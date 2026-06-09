# IronFort Gym Management System

A comprehensive gym management system built with the MERN stack (MongoDB, Express, React, Node.js) featuring role-based access control for Admin, Trainer, and Member users.

## Features

### Admin Features
- User management (Members and Trainers)
- Subscription plan management
- Member subscription tracking and renewal
- Attendance monitoring
- Equipment and supplements management
- Supplement booking confirmation
- Q&A management
- Revenue and attendance reports
- Real-time notifications
- Chat functionality

### Trainer Features
- Workout plan assignment
- Diet plan assignment
- Body measurement recording
- Attendance tracking
- Supplement browsing and booking
- Q&A participation
- Real-time notifications
- Chat functionality

### Member Features
- View assigned workouts and diets
- Track body measurements
- Upload progress photos
- Attendance marking
- Supplement browsing and booking
- Q&A participation
- Real-time notifications
- Chat functionality

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, Redux Toolkit, Tailwind CSS
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Authentication**: JWT (Access & Refresh tokens)
- **File Upload**: Cloudinary

## Project Structure

```
IronFort/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── server.js
│   └── .env
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IronFort
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Edit `server/.env` and update the following values:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ironfort
   JWT_ACCESS_SECRET=your_access_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   CLOUDINARY_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLIENT_URL=http://localhost:5173
   ```

### Running the Application

1. **Start the MongoDB server** (if using local MongoDB)
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:5000`

3. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The client will run on `http://localhost:5173`

## Default Admin Access

The first user registered with role 'admin' will have full administrative access. To create the initial admin user:

1. Register a new account via the registration endpoint (accessible through the admin panel)
2. Set the role to 'admin' during registration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/change-password` - Change password

### Admin Routes
- `GET/POST /api/admin/members` - Manage members
- `GET/POST /api/admin/trainers` - Manage trainers
- `GET/POST /api/admin/plans` - Manage subscription plans
- `GET /api/admin/subscriptions` - View subscriptions
- `GET /api/admin/attendance` - View attendance
- `GET/POST/PUT/DELETE /api/admin/equipment` - Manage equipment
- `GET/POST/PUT/DELETE /api/admin/supplements` - Manage supplements
- `GET/PATCH /api/admin/bookings` - Manage supplement bookings
- `GET/PATCH /api/admin/questions` - Manage Q&A
- `GET /api/admin/reports` - View reports

### Subscription Routes
- `GET/POST /api/subscriptions` - Manage subscription plans
- `POST /api/subscriptions/assign` - Assign plan to member
- `POST /api/subscriptions/renew` - Renew subscription

### Attendance Routes
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/check-today` - Check today's attendance

### Workout Routes
- `POST /api/workouts` - Assign workout
- `GET /api/workouts` - Get workouts
- `PATCH /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout
- `PATCH /api/workouts/:id/exercise/:exerciseId/done` - Mark exercise as done

### Diet Routes
- `POST /api/diets` - Assign diet
- `GET /api/diets` - Get diets
- `PATCH /api/diets/:id` - Update diet
- `DELETE /api/diets/:id` - Delete diet

### Measurement Routes
- `POST /api/measurements` - Record measurement
- `GET /api/measurements` - Get measurements
- `PATCH /api/measurements/:id` - Update measurement

### Progress Photo Routes
- `POST /api/progress-photos` - Upload progress photo
- `GET /api/progress-photos` - Get progress photos
- `DELETE /api/progress-photos/:id` - Delete progress photo

### Equipment Routes
- `GET/POST /api/equipment` - Manage equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Supplement Routes
- `GET/POST /api/supplements` - Manage supplements
- `PUT /api/supplements/:id` - Update supplement
- `DELETE /api/supplements/:id` - Delete supplement
- `POST /api/supplements/book` - Book supplement
- `PATCH /api/supplements/bookings/:id/confirm` - Confirm booking

### Question Routes
- `POST /api/questions` - Ask question
- `GET /api/questions` - Get all questions (admin/trainer)
- `GET /api/questions/me` - Get my questions
- `PATCH /api/questions/:id/answer` - Answer question

### Notification Routes
- `POST /api/notifications` - Create notification (admin)
- `GET /api/notifications/me` - Get my notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Chat Routes
- `POST /api/chats` - Get or create chat
- `GET /api/chats` - Get user's chats
- `GET /api/chats/:chatId/messages` - Get chat messages

## Socket.IO Events

### Client to Server
- `join` - Join user's personal room
- `sendMessage` - Send message
- `markAsRead` - Mark messages as read

### Server to Client
- `receiveMessage` - Receive new message
- `messagesRead` - Notify that messages were read

## Role-Based Access Control

- **Admin**: Full access to all features
- **Trainer**: Can assign workouts/diets, record measurements, view member data
- **Member**: Can view assigned content, track progress, book supplements

## Development

### Building for Production

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Start the server in production mode**
   ```bash
   cd server
   npm start
   ```

## License

ISC

## Support

For issues or questions, please contact the development team.
