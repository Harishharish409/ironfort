const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const mongoose = require('mongoose');

const USER_SELECT = 'username role isActive profilePhoto';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getParticipantsKey = (participantIds) => (
  [...new Set(participantIds.map((id) => id.toString()))].sort().join(':')
);

const isParticipant = (chat, userId) => (
  chat.participants.some((participant) => participant.toString() === userId.toString())
);

const getDisplayNameMap = async (userIds) => {
  const ids = [...new Set(userIds.filter(Boolean).map((id) => id.toString()))];

  if (!ids.length) {
    return new Map();
  }

  const [members, trainers] = await Promise.all([
    Member.find({ user: { $in: ids } }).select('user fullName'),
    Trainer.find({ user: { $in: ids } }).select('user fullName'),
  ]);

  const names = new Map();
  members.forEach((member) => names.set(member.user.toString(), member.fullName));
  trainers.forEach((trainer) => names.set(trainer.user.toString(), trainer.fullName));

  return names;
};

const addDisplayNamesToUsers = async (users) => {
  const userObjects = users.map((user) => (
    typeof user.toObject === 'function' ? user.toObject() : user
  ));
  const displayNames = await getDisplayNameMap(userObjects.map((user) => user._id));

  return userObjects.map((user) => ({
    ...user,
    displayName: displayNames.get(user._id.toString()) || user.username,
  }));
};

const decorateChats = async (chats, unreadCounts = new Map()) => {
  const chatObjects = chats.map((chat) => (
    typeof chat.toObject === 'function' ? chat.toObject() : chat
  ));
  const participantIds = chatObjects.flatMap((chat) => (
    chat.participants || []
  ).map((participant) => participant?._id || participant).filter(Boolean));
  const displayNames = await getDisplayNameMap(participantIds);

  return chatObjects.map((chat) => ({
    ...chat,
    participants: (chat.participants || []).filter(Boolean).map((participant) => {
      const participantId = (participant._id || participant).toString();

      return {
        ...participant,
        displayName: displayNames.get(participantId) || participant.username,
      };
    }),
    unreadCount: unreadCounts.get(chat._id.toString()) || 0,
  }));
};

const populateChat = (query) => query
  .populate('participants', USER_SELECT)
  .populate({
    path: 'lastMessage',
    populate: {
      path: 'sender',
      select: USER_SELECT,
    },
  });

const markMessagesRead = async (chatId, userId) => {
  await Message.updateMany(
    { chat: chatId, sender: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );
};

// @desc    Get active users available to chat
// @route   GET /api/chats/users
// @access  All
const getChatUsers = async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const query = {
      _id: { $ne: req.user._id },
      isActive: true,
    };

    if (search) {
      query.username = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const users = await User.find(query)
      .select(USER_SELECT)
      .sort({ role: 1, username: 1 });
    const usersWithNames = await addDisplayNamesToUsers(users);

    res.json(usersWithNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get or create chat between users
// @route   POST /api/chats
// @access  All
const getOrCreateChat = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId || !isValidObjectId(participantId)) {
      return res.status(400).json({ message: 'Participant is required' });
    }

    if (participantId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot start a chat with yourself' });
    }

    const participant = await User.findOne({ _id: participantId, isActive: true }).select(USER_SELECT);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    const participantIds = [req.user._id, participant._id];
    const participantsKey = getParticipantsKey(participantIds);

    let chat = await populateChat(Chat.findOne({
      $or: [
        { participantsKey },
        { participants: { $all: participantIds, $size: 2 } },
      ],
    }));

    if (!chat) {
      chat = await Chat.create({
        participants: participantIds,
        participantsKey,
      });
      chat = await populateChat(Chat.findById(chat._id));
    } else if (!chat.participantsKey) {
      chat.participantsKey = participantsKey;
      await chat.save();
      chat = await populateChat(Chat.findById(chat._id));
    }

    const [decoratedChat] = await decorateChats([chat]);
    res.json(decoratedChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's chats
// @route   GET /api/chats
// @access  All
const getUserChats = async (req, res) => {
  try {
    const chats = await populateChat(Chat.find({ participants: req.user._id }))
      .sort({ updatedAt: -1 });

    const chatIds = chats.map((chat) => chat._id);
    const unreadCounts = new Map();

    if (chatIds.length) {
      const unread = await Message.aggregate([
        {
          $match: {
            chat: { $in: chatIds },
            sender: { $ne: req.user._id },
            readBy: { $ne: req.user._id },
          },
        },
        { $group: { _id: '$chat', count: { $sum: 1 } } },
      ]);

      unread.forEach((item) => unreadCounts.set(item._id.toString(), item.count));
    }

    const decoratedChats = await decorateChats(chats, unreadCounts);
    res.json(decoratedChats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat messages
// @route   GET /api/chats/:chatId/messages
// @access  All
const getChatMessages = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.chatId)) {
      return res.status(400).json({ message: 'Invalid chat' });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!isParticipant(chat, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', USER_SELECT)
      .sort({ createdAt: 1 });

    await markMessagesRead(chat._id, req.user._id);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark chat messages as read
// @route   PATCH /api/chats/:chatId/read
// @access  All
const markChatAsRead = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.chatId)) {
      return res.status(400).json({ message: 'Invalid chat' });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!isParticipant(chat, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await markMessagesRead(chat._id, req.user._id);
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getChatUsers,
  getOrCreateChat,
  getUserChats,
  getChatMessages,
  markChatAsRead,
};
