require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const workoutRoutes = require('./routes/workout.routes');
const dietRoutes = require('./routes/diet.routes');
const measurementRoutes = require('./routes/measurement.routes');
const progressPhotoRoutes = require('./routes/progressPhoto.routes');
const equipmentRoutes = require('./routes/equipment.routes');
const supplementRoutes = require('./routes/supplement.routes');
const questionRoutes = require('./routes/question.routes');
const notificationRoutes = require('./routes/notification.routes');
const chatRoutes = require('./routes/chat.routes');
const trainerRoutes = require('./routes/trainer.routes');
const chatSocket = require('./socket/chatSocket');
const Chat = require('./models/Chat');
const Member = require('./models/Member');
const Trainer = require('./models/Trainer');

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://ironfort.onrender.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:5178',
  'http://127.0.0.1:5178',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Initialize socket handling
chatSocket(io);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/diets', dietRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/progress-photos', progressPhotoRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/supplements', supplementRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/trainer', trainerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'IronFort API is running' });
});

const PORT = process.env.PORT || 5000;

const prepareChatIndexes = async () => {
  try {
    const chatsWithoutKey = await Chat.find({
      $or: [
        { participantsKey: { $exists: false } },
        { participantsKey: '' },
      ],
    }).select('participants');

    for (const chat of chatsWithoutKey) {
      const participantIds = [...new Set(chat.participants.map((id) => id.toString()))].sort();

      if (participantIds.length) {
        await Chat.updateOne(
          { _id: chat._id },
          {
            $set: {
              participants: participantIds,
              participantsKey: participantIds.join(':'),
            },
          }
        );
      }
    }

    const indexes = await Chat.collection.indexes();
    const staleParticipantsIndex = indexes.find((index) => (
      index.name === 'participants_1' && index.unique
    ));

    if (staleParticipantsIndex) {
      await Chat.collection.dropIndex(staleParticipantsIndex.name);
    }

    await Chat.syncIndexes();
  } catch (error) {
    console.warn('Chat index preparation skipped:', error.message);
  }
};

const prepareProfileIds = async () => {
  try {
    const [membersWithoutId, trainersWithoutId] = await Promise.all([
      Member.find({
        $or: [
          { memberId: { $exists: false } },
          { memberId: '' },
          { memberId: null },
        ],
      }).select('user memberId'),
      Trainer.find({
        $or: [
          { trainerId: { $exists: false } },
          { trainerId: '' },
          { trainerId: null },
        ],
      }).select('user trainerId'),
    ]);

    for (const member of membersWithoutId) {
      const seed = (member.user || member._id).toString().slice(-6).toUpperCase();
      await Member.updateOne(
        { _id: member._id },
        { $set: { memberId: `MEM-${seed}` } }
      );
    }

    for (const trainer of trainersWithoutId) {
      const seed = (trainer.user || trainer._id).toString().slice(-6).toUpperCase();
      await Trainer.updateOne(
        { _id: trainer._id },
        { $set: { trainerId: `TRN-${seed}` } }
      );
    }

    await Promise.all([
      Member.createIndexes(),
      Trainer.createIndexes(),
    ]);
  } catch (error) {
    console.warn('Profile ID preparation skipped:', error.message);
  }
};

const startServer = async () => {
  await connectDB();
  await prepareProfileIds();
  await prepareChatIndexes();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
