const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const USER_SELECT = 'username role profilePhoto isActive';

const isParticipant = (chat, userId) => (
  chat.participants.some((participant) => {
    if (!participant) {
      return false;
    }

    const participantId = participant._id || participant;
    return participantId.toString() === userId.toString();
  })
);

const populateChat = (query) => query
  .populate('participants', USER_SELECT)
  .populate({
    path: 'lastMessage',
    populate: {
      path: 'sender',
      select: USER_SELECT,
    },
  });

const emitChatUpdated = async (io, chatId) => {
  const chat = await populateChat(Chat.findById(chatId));

  if (!chat) {
    return;
  }

  chat.participants.filter(Boolean).forEach((participant) => {
    io.to(participant._id.toString()).emit('chatUpdated', chat);
  });
};

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select(USER_SELECT);

      if (!user || !user.isActive) {
        return next(new Error('User is not authorized'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user._id.toString();

    socket.join(userId);
    console.log('User connected:', userId);

    socket.on('join', (requestedUserId) => {
      if (requestedUserId?.toString() === userId) {
        socket.join(userId);
      }
    });

    // Send message
    socket.on('sendMessage', async (data = {}, acknowledge) => {
      try {
        const { chatId } = data;
        const content = data.content?.trim();

        if (!chatId || !content) {
          acknowledge?.({ ok: false, message: 'Chat and message are required' });
          return;
        }

        const chat = await populateChat(Chat.findById(chatId));

        if (!chat || !isParticipant(chat, userId)) {
          acknowledge?.({ ok: false, message: 'Not authorized to send to this chat' });
          return;
        }

        const message = await Message.create({
          chat: chatId,
          sender: userId,
          content,
          readBy: [userId],
        });

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          USER_SELECT
        );

        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        chat.participants.filter(Boolean).forEach((participant) => {
          io.to(participant._id.toString()).emit('receiveMessage', populatedMessage);
        });

        await emitChatUpdated(io, chatId);
        acknowledge?.({ ok: true, message: populatedMessage });
      } catch (error) {
        console.error('Error sending message:', error);
        acknowledge?.({ ok: false, message: 'Message could not be sent' });
      }
    });

    // Mark messages as read
    socket.on('markAsRead', async (data = {}) => {
      try {
        const { chatId } = data;

        const chat = await populateChat(Chat.findById(chatId));
        if (!chat || !isParticipant(chat, userId)) {
          return;
        }

        await Message.updateMany(
          { chat: chatId, sender: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );

        chat.participants.filter(Boolean).forEach((participant) => {
          if (participant._id.toString() !== userId) {
            io.to(participant._id.toString()).emit('messagesRead', { chatId, userId });
          }
        });
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
