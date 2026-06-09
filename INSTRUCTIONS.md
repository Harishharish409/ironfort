# IronFort — Gym Management System
### Full-Stack MERN Project Blueprint

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Database Models](#4-database-models)
5. [Authentication & Role System](#5-authentication--role-system)
6. [API Routes Reference](#6-api-routes-reference)
7. [Feature Modules — Admin](#7-feature-modules--admin)
8. [Feature Modules — Trainer](#8-feature-modules--trainer)
9. [Feature Modules — Member](#9-feature-modules--member)
10. [Chat System](#10-chat-system)
11. [Notification System](#11-notification-system)
12. [File Uploads](#12-file-uploads)
13. [Frontend Pages & Components](#13-frontend-pages--components)
14. [Environment Variables](#14-environment-variables)
15. [Step-by-Step Build Order](#15-step-by-step-build-order)

---

## 1. Project Overview

**IronFort** is a gym management web application built on the MERN stack. It supports three user roles — **Admin**, **Trainer**, and **Member** — each with a distinct set of capabilities.

### Core Flow

> Admin creates an account for a new member → assigns a membership plan → assigns a trainer → trainer sets workouts & diet → member tracks progress → when the subscription expires, the member clicks **"Renew / Pay"** → admin gets notified → admin confirms and extends the subscription.

### Role Summary

| Capability | Admin | Trainer | Member |
|---|---|---|---|
| Register users | ✅ | ❌ | ❌ |
| Remove users | ✅ | ❌ | ❌ |
| Assign trainer to member | ✅ | ❌ | ❌ |
| Manage subscription plans | ✅ | ❌ | ❌ |
| Track attendance | ✅ (view all) | ✅ (self) | ✅ (self) |
| Assign workouts & diets | ❌ | ✅ | ❌ |
| View workouts & diets | ❌ | ✅ | ✅ |
| Upload exercise videos | ❌ | ✅ | ❌ |
| Record body measurements | ❌ | ✅ | ❌ |
| Recommend supplements | ❌ | ✅ | ❌ |
| Share progress photos | ❌ | ❌ | ✅ |
| Book supplements | ❌ | ✅ | ✅ |
| Chat | ✅ (all) | ✅ (assigned members + admin) | ✅ (assigned trainer + admin) |
| Revenue & attendance reports | ✅ | ❌ | ❌ |
| Equipment management | ✅ | ❌ | ❌ |
| Supplement stock management | ✅ | ❌ | ❌ |
| Renew subscription (notify admin) | ❌ | ❌ | ✅ |

---

## 2. Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (access token + refresh token)
- **Real-time**: Socket.IO (chat + notifications)
- **File Uploads**: Multer + Cloudinary
- **Password Hashing**: bcryptjs
- **Email (optional)**: Nodemailer

### Frontend
- **Framework**: React (Vite)
- **Routing**: React Router v6
- **State Management**: Redux Toolkit + RTK Query
- **UI**: Tailwind CSS + shadcn/ui
- **Real-time**: Socket.IO client
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **File Upload UI**: react-dropzone

---

## 3. Folder Structure

```
ironfort/
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── admin.controller.js
│   │   ├── trainer.controller.js
│   │   ├── member.controller.js
│   │   ├── attendance.controller.js
│   │   ├── workout.controller.js
│   │   ├── diet.controller.js
│   │   ├── chat.controller.js
│   │   ├── notification.controller.js
│   │   ├── supplement.controller.js
│   │   ├── equipment.controller.js
│   │   ├── subscription.controller.js
│   │   └── report.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── upload.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Member.js
│   │   ├── Trainer.js
│   │   ├── Attendance.js
│   │   ├── Workout.js
│   │   ├── Diet.js
│   │   ├── SubscriptionPlan.js
│   │   ├── MemberSubscription.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Supplement.js
│   │   ├── SupplementBooking.js
│   │   ├── Equipment.js
│   │   ├── ProgressPhoto.js
│   │   ├── BodyMeasurement.js
│   │   └── Question.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── trainer.routes.js
│   │   ├── member.routes.js
│   │   ├── attendance.routes.js
│   │   ├── workout.routes.js
│   │   ├── diet.routes.js
│   │   ├── chat.routes.js
│   │   ├── notification.routes.js
│   │   ├── supplement.routes.js
│   │   ├── equipment.routes.js
│   │   ├── subscription.routes.js
│   │   └── report.routes.js
│   ├── socket/
│   │   └── socket.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── sendNotification.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── client/
    ├── public/
    ├── src/
    │   ├── api/           ← RTK Query endpoints
    │   ├── app/           ← Redux store
    │   ├── assets/
    │   ├── components/
    │   │   ├── shared/
    │   │   ├── admin/
    │   │   ├── trainer/
    │   │   └── member/
    │   ├── hooks/
    │   ├── layouts/
    │   │   ├── AdminLayout.jsx
    │   │   ├── TrainerLayout.jsx
    │   │   └── MemberLayout.jsx
    │   ├── pages/
    │   │   ├── auth/
    │   │   ├── admin/
    │   │   ├── trainer/
    │   │   └── member/
    │   ├── socket/
    │   │   └── socket.js
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    ├── tailwind.config.js
    └── package.json
```

---

## 4. Database Models

### User.js
The base authentication model shared by all three roles.

```js
{
  username:       { type: String, required: true, unique: true },
  password:       { type: String, required: true },          // bcrypt hashed
  role:           { type: String, enum: ['admin','trainer','member'], required: true },
  isActive:       { type: Boolean, default: true },
  profilePhoto:   { type: String },                          // Cloudinary URL
  createdBy:      { type: ObjectId, ref: 'User' },           // always admin
  createdAt:      Date,
  updatedAt:      Date
}
```

### Member.js
Extended profile linked to a User document.

```js
{
  user:             { type: ObjectId, ref: 'User', required: true },
  fullName:         String,
  email:            String,
  phone:            String,
  dateOfBirth:      Date,
  gender:           { type: String, enum: ['male','female','other'] },
  address:          String,
  assignedTrainer:  { type: ObjectId, ref: 'User' },
  emergencyContact: { name: String, phone: String },
  joinDate:         { type: Date, default: Date.now },
  removalReason:    String,
  removedAt:        Date
}
```

### Trainer.js
Extended profile linked to a User document.

```js
{
  user:           { type: ObjectId, ref: 'User', required: true },
  fullName:       String,
  email:          String,
  phone:          String,
  specialization: [String],
  experience:     Number,                 // years
  certifications: [String],
  assignedMembers:[{ type: ObjectId, ref: 'User' }],
  removalReason:  String,
  removedAt:      Date
}
```

### SubscriptionPlan.js

```js
{
  name:        String,                   // e.g. "Monthly Basic"
  duration:    Number,                   // days — 30, 90, 180, 365
  price:       Number,
  discount:    Number,                   // percentage
  offer:       String,                   // offer description
  features:    [String],
  isActive:    { type: Boolean, default: true },
  createdAt:   Date
}
```

### MemberSubscription.js

```js
{
  member:          { type: ObjectId, ref: 'User', required: true },
  plan:            { type: ObjectId, ref: 'SubscriptionPlan', required: true },
  startDate:       Date,
  endDate:         Date,
  status:          { type: String, enum: ['active','expired','pending_renewal'] },
  paymentStatus:   { type: String, enum: ['pending','confirmed'], default: 'pending' },
  renewalRequested:{ type: Boolean, default: false },
  renewalNotifiedAt: Date,
  planSwitchRequest: { type: ObjectId, ref: 'SubscriptionPlan' }  // requested new plan
}
```

### Attendance.js

```js
{
  user:      { type: ObjectId, ref: 'User', required: true },
  role:      { type: String, enum: ['trainer','member'] },
  date:      { type: Date, required: true },
  status:    { type: String, enum: ['present','absent'], default: 'present' },
  markedAt:  { type: Date, default: Date.now },
  note:      String
}
```

### Workout.js

```js
{
  assignedTo:   { type: ObjectId, ref: 'User' },       // member
  assignedBy:   { type: ObjectId, ref: 'User' },       // trainer
  title:        String,
  frequency:    { type: String, enum: ['daily','weekly','monthly'] },
  startDate:    Date,
  endDate:      Date,
  exercises: [{
    name:          String,
    sets:          Number,
    reps:          String,
    duration:      String,
    restTime:      String,
    videoUrl:      String,    // Cloudinary URL
    notes:         String,
    doneStatus:    { type: Boolean, default: false },
    doneMarkedAt:  Date
  }],
  notes:        String
}
```

### Diet.js

```js
{
  assignedTo:  { type: ObjectId, ref: 'User' },
  assignedBy:  { type: ObjectId, ref: 'User' },
  title:       String,
  frequency:   { type: String, enum: ['daily','weekly','monthly'] },
  startDate:   Date,
  endDate:     Date,
  meals: [{
    mealTime:    String,     // Breakfast / Lunch / Dinner / Snack
    items:       [String],
    calories:    Number,
    protein:     Number,
    carbs:       Number,
    fat:         Number,
    notes:       String
  }],
  notes:       String
}
```

### BodyMeasurement.js

```js
{
  member:       { type: ObjectId, ref: 'User' },
  recordedBy:   { type: ObjectId, ref: 'User' },    // trainer
  date:         Date,
  weight:       Number,       // kg
  height:       Number,       // cm
  bmi:          Number,       // calculated
  chest:        Number,
  waist:        Number,
  hips:         Number,
  arms:         Number,
  thighs:       Number,
  bodyFat:      Number,
  notes:        String
}
```

### ProgressPhoto.js

```js
{
  member:       { type: ObjectId, ref: 'User' },
  photoUrl:     String,       // Cloudinary URL
  caption:      String,
  sharedWith:   [{ type: ObjectId, ref: 'User' }],   // trainers
  uploadedAt:   Date
}
```

### Equipment.js

```js
{
  name:          String,
  description:   String,
  category:      String,
  quantity:      Number,
  available:     Number,
  condition:     { type: String, enum: ['good','maintenance','broken'] },
  photoUrl:      String,
  lastUpdated:   Date
}
```

### Supplement.js

```js
{
  name:        String,
  description: String,
  category:    String,
  price:       Number,
  stock:       Number,
  photoUrl:    String,
  isAvailable: { type: Boolean, default: true },
  lastUpdated: Date
}
```

### SupplementBooking.js

```js
{
  supplement:  { type: ObjectId, ref: 'Supplement' },
  bookedBy:    { type: ObjectId, ref: 'User' },
  quantity:    Number,
  status:      { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' },
  bookedAt:    Date
}
```

### Chat.js (conversation room)

```js
{
  participants: [{ type: ObjectId, ref: 'User' }],
  type:         { type: String, enum: ['private'] },
  createdAt:    Date,
  lastMessage:  { type: ObjectId, ref: 'Message' }
}
```

### Message.js

```js
{
  chat:        { type: ObjectId, ref: 'Chat' },
  sender:      { type: ObjectId, ref: 'User' },
  content:     String,
  mediaUrl:    String,
  readBy:      [{ type: ObjectId, ref: 'User' }],
  sentAt:      { type: Date, default: Date.now }
}
```

### Notification.js

```js
{
  recipient:   { type: ObjectId, ref: 'User' },
  sender:      { type: ObjectId, ref: 'User' },
  type:        String,  // 'renewal_request','plan_switch','payment_done','question','supplement_booking','general'
  message:     String,
  isRead:      { type: Boolean, default: false },
  meta:        Object,  // any extra data (planId, memberId, etc.)
  createdAt:   Date
}
```

### Question.js

```js
{
  askedBy:     { type: ObjectId, ref: 'User' },    // member
  answeredBy:  { type: ObjectId, ref: 'User' },    // trainer
  question:    String,
  answer:      String,
  status:      { type: String, enum: ['open','answered'], default: 'open' },
  askedAt:     Date,
  answeredAt:  Date
}
```

---

## 5. Authentication & Role System

### Registration (Admin only)
- Admin calls `POST /api/admin/register-trainer` or `POST /api/admin/register-member`
- Server creates a **User** document + the role-specific profile document
- Admin sets the initial username and password
- The new user logs in at `POST /api/auth/login` using those credentials
- On first login, the user should be prompted to change their password (add a `mustChangePassword` flag to User)

### JWT Flow
1. Login → server issues `accessToken` (15min) + `httpOnly` cookie `refreshToken` (7d)
2. Every protected request sends `Authorization: Bearer <accessToken>`
3. On 401, client hits `POST /api/auth/refresh` to get a new access token
4. Logout hits `POST /api/auth/logout` which clears the cookie

### Middleware

**auth.middleware.js** — verifies JWT, attaches `req.user`

```js
// Usage on route:
router.get('/dashboard', protect, route_handler)
```

**role.middleware.js** — checks role after protect

```js
// Usage:
router.post('/register-member', protect, authorize('admin'), handler)
router.get('/my-members', protect, authorize('trainer'), handler)
```

### Password & Username Reset (Admin only)
- `PATCH /api/admin/users/:userId/reset-credentials`
- Body: `{ newUsername?, newPassword? }`
- Admin can reset either or both for any trainer or member

---

## 6. API Routes Reference

### Auth Routes — `/api/auth`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Login, returns JWT |
| POST | `/logout` | Protected | Clear refresh token |
| POST | `/refresh` | Public | Refresh access token |
| PATCH | `/change-password` | Protected | User changes own password |

### Admin Routes — `/api/admin`

| Method | Path | Description |
|---|---|---|
| POST | `/register-trainer` | Create trainer account |
| POST | `/register-member` | Create member account |
| DELETE | `/trainers/:id` | Remove trainer (body: reason) |
| DELETE | `/members/:id` | Remove member (body: reason) |
| PATCH | `/users/:id/reset-credentials` | Reset username/password |
| PATCH | `/members/:memberId/assign-trainer` | Assign trainer to member |
| GET | `/members` | List all members |
| GET | `/trainers` | List all trainers |
| GET | `/members/:id` | Member detail |
| GET | `/trainers/:id` | Trainer detail |
| GET | `/attendance` | All attendance records (filter by date/user/role) |
| GET | `/reports/revenue` | Revenue report |
| GET | `/reports/attendance` | Attendance report |
| POST | `/transformation-photos` | Upload member transformation photo |

### Subscription Routes — `/api/subscriptions`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/plans` | Admin | Create a plan |
| GET | `/plans` | All | List active plans |
| PATCH | `/plans/:id` | Admin | Edit plan (price, discount, offer) |
| DELETE | `/plans/:id` | Admin | Deactivate a plan |
| POST | `/assign` | Admin | Assign plan to member |
| GET | `/member/:memberId` | Admin/Trainer | Member's current subscription |
| POST | `/renew-request` | Member | Click "Renew" — notifies admin |
| POST | `/payment-done` | Member | Click "Payment Done" — notifies admin |
| POST | `/switch-plan` | Member | Request plan switch — notifies admin |
| PATCH | `/:id/confirm` | Admin | Confirm payment + extend subscription |

### Attendance Routes — `/api/attendance`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/mark` | Trainer / Member | Mark own attendance for today |
| GET | `/me` | Trainer / Member | Own attendance history |
| GET | `/` | Admin | All attendance (query: userId, role, from, to) |

### Workout Routes — `/api/workouts`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Trainer | Assign workout to a member |
| GET | `/member/:memberId` | Trainer / Member | Get member's workouts |
| PATCH | `/:id` | Trainer | Update workout |
| DELETE | `/:id` | Trainer | Delete workout |
| PATCH | `/:workoutId/exercise/:exerciseId/done` | Member | Mark exercise done |

### Diet Routes — `/api/diets`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Trainer | Assign diet to a member |
| GET | `/member/:memberId` | Trainer / Member | Get member's diets |
| PATCH | `/:id` | Trainer | Update diet |
| DELETE | `/:id` | Trainer | Delete diet |

### Body Measurement Routes — `/api/measurements`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Trainer | Record measurement for member |
| GET | `/member/:memberId` | Trainer / Member | Get measurement history |
| PATCH | `/:id` | Trainer | Update measurement |

### Equipment Routes — `/api/equipment`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Admin | Add equipment |
| GET | `/` | All | List all equipment |
| PATCH | `/:id` | Admin | Update equipment (qty, condition, photo) |
| DELETE | `/:id` | Admin | Remove equipment |

### Supplement Routes — `/api/supplements`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Admin | Add supplement |
| GET | `/` | All | List supplements |
| PATCH | `/:id` | Admin | Update supplement (stock, price, photo) |
| DELETE | `/:id` | Admin | Remove supplement |
| POST | `/book` | Member / Trainer | Book a supplement |
| GET | `/bookings` | Admin | All bookings |
| PATCH | `/bookings/:id/confirm` | Admin | Confirm booking |

### Progress Photo Routes — `/api/progress-photos`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Member | Upload progress photo |
| GET | `/me` | Member | Own photos |
| GET | `/member/:memberId` | Trainer | View member's shared photos |

### Question Routes — `/api/questions`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Member | Raise a question |
| GET | `/me` | Member | Own questions |
| GET | `/my-members` | Trainer | Questions from assigned members |
| PATCH | `/:id/answer` | Trainer | Answer a question |

### Exercise Video Routes — `/api/exercise-videos`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/` | Trainer | Upload demonstration video |
| GET | `/` | Trainer / Member | List videos |
| DELETE | `/:id` | Trainer | Remove video |

### Chat Routes — `/api/chats`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | All | List user's conversations |
| POST | `/` | All | Create/get chat with another user |
| GET | `/:chatId/messages` | Participants | Load message history |

### Notification Routes — `/api/notifications`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | All | Get own notifications |
| PATCH | `/:id/read` | All | Mark as read |
| PATCH | `/read-all` | All | Mark all as read |
| POST | `/send` | Admin / Trainer | Send notification to user(s) |

---

## 7. Feature Modules — Admin

### 7.1 User Registration
- Admin fills a form with full name, username, password, email, phone, role
- For members: also select a subscription plan and assign a trainer at creation time (can be done later too)
- Server creates `User` + `Member` or `Trainer` profile in one transaction
- Admin sees a confirmation with the auto-generated credentials to share with the new user

### 7.2 User Removal
- Admin clicks "Remove" on a trainer or member card
- A modal appears requiring a **reason** to be typed before confirming
- The `isActive` flag is set to `false` on the User; the reason and timestamp are stored on the profile
- Removed users cannot log in (middleware checks `isActive`)
- Their data (attendance, workouts, chats) is retained for records

### 7.3 Trainer–Member Assignment
- On the member detail page, admin sees a dropdown of all active trainers
- Selecting one calls `PATCH /api/admin/members/:memberId/assign-trainer`
- The trainer's `assignedMembers` array is updated
- A notification is sent to both the trainer and the member

### 7.4 Subscription Plan Management
- Admin can create plans with name, duration (days), price, discount %, offer text, and feature bullets
- Plans can be edited (price, discount, offer) or deactivated (not deleted to preserve history)
- When assigning a plan to a member, `startDate` = today, `endDate` = today + duration

### 7.5 Subscription Tracking (Due Dates)
- Admin dashboard shows a table of all members sorted by `endDate` ascending
- Color coding: green = active, amber = expiring within 7 days, red = expired
- Admin can filter by plan, trainer, or status

### 7.6 Attendance Tracking
- Admin can view a calendar/table of attendance for any user
- Filters: by role (trainer/member), by date range, by specific user
- Attendance report can be exported as CSV (generate on frontend from API data)

### 7.7 Equipment Management
- Admin adds equipment with name, category, total quantity, available quantity, condition, and a photo
- On the equipment list page, admin can inline-edit the available count and condition
- Photo is uploaded to Cloudinary; URL stored in the document

### 7.8 Supplement Management
- Admin manages stock: name, category, price, stock count, photo, availability toggle
- When stock = 0, `isAvailable` is set to false automatically
- Booking confirmations reduce stock count

### 7.9 Messaging & Notifications
- Admin can select any user (or a group: all members, all trainers, all) and send an in-app notification with a message
- Admin participates in the chat system and can chat with any user

### 7.10 Reports
- **Revenue report**: lists all member subscriptions with plan name, price, start/end date, payment status, grouped by month
- **Attendance report**: daily/weekly/monthly attendance counts per user, with present/absent percentages
- Both are rendered as charts (Recharts) with a table below

### 7.11 Transformation Photos
- Admin can upload before/after transformation photos for any member (separate from member-uploaded progress photos)
- These are visible on the member's profile

---

## 8. Feature Modules — Trainer

### 8.1 Trainer Dashboard
- Summary cards: assigned members count, today's attendance, pending questions, members with expiring plans
- A list of assigned members with quick links to their profiles

### 8.2 Attendance
- Trainer marks their own attendance once per day via a prominent "Mark Attendance" button
- If already marked today, the button shows "Marked ✓" and is disabled
- Own attendance history shown in a calendar view

### 8.3 Workout Assignment
- Trainer selects a member from their assigned list
- Fills out workout: title, frequency (daily / weekly / monthly), start date, end date
- Adds exercises one by one: name, sets, reps, rest time, optional video (upload to Cloudinary), notes
- Submitted workouts appear on the member's dashboard immediately

### 8.4 Diet Assignment
- Same flow as workouts
- Trainer adds meals: meal time, food items, macro breakdown (calories, protein, carbs, fat)
- Frequency and date range work the same way

### 8.5 Body Measurements
- Trainer opens a member's profile → "Record Measurement"
- Fields: weight, height (BMI auto-calculated), chest, waist, hips, arms, thighs, body fat %
- History shown as a line chart (Recharts) so the trainer and member can see progress over time

### 8.6 Exercise Demonstration Videos
- Trainer uploads a video with a title and description
- Videos are stored on Cloudinary and listed in a library
- When assigning an exercise in a workout, trainer can pick from the library or upload new

### 8.7 Supplement Recommendations
- On a member's profile, trainer can add a supplement recommendation: pick from the supplement list, add dosage notes
- Recommendation is saved to the member's profile and a notification is sent to the member

### 8.8 Member Performance Dashboard
- For each assigned member, trainer sees:
  - Workout done status (which exercises were marked done and when)
  - Attendance streak
  - Body measurement trend chart
  - Progress photos shared by the member
  - Open questions

### 8.9 Questions (Q&A)
- Trainer sees a list of open questions from all their assigned members
- Clicking one opens a text area to type an answer
- On submit, the question is marked `answered` and the member receives a notification

### 8.10 Chat & Notifications
- Trainer can chat with any of their assigned members and with admin
- Trainer cannot initiate a chat with a member not assigned to them
- Trainer receives notifications for: new questions, supplement bookings, member progress photo shares, admin messages

---

## 9. Feature Modules — Member

### 9.1 Member Dashboard
- Subscription status card: plan name, days remaining, status badge
- Today's workout and diet at a glance
- Attendance streak
- Recent notifications

### 9.2 Subscription & Renewal
- Member sees their current plan, start date, end date, and status
- When status is `expired` or `pending_renewal`:
  - A **"Renew Subscription"** button appears
  - Clicking it sets `renewalRequested: true` on `MemberSubscription` and sends a notification to admin
- **"Payment Done"** button: separate button the member clicks to notify admin that payment has been made in person
  - Admin receives a notification and can confirm via `PATCH /api/subscriptions/:id/confirm`
- **Plan Switch**: member can browse active plans and click "Switch to this Plan"
  - This sets `planSwitchRequest` on the subscription and notifies admin
  - Admin confirms or rejects the switch

### 9.3 Attendance
- Member marks their own attendance once per day ("I'm here today" button)
- Calendar view of own attendance history

### 9.4 Workouts
- List of all assigned workouts, filterable by frequency and date
- Each workout shows all exercises with sets, reps, rest time, and an optional demo video
- Each exercise has a **"Mark Done"** checkbox — member ticks it when they complete the exercise
- Completed exercises are visible to the trainer on the performance dashboard

### 9.5 Diet Plan
- List of assigned diet plans with meals for each time of day
- Macro breakdown shown per meal and as a daily total

### 9.6 Progress Photos
- Member can upload photos with an optional caption
- They choose which trainer(s) to share with
- Photos are stored on Cloudinary

### 9.7 Q&A with Trainer
- Member types a question and submits it
- Submitted questions show as "Open" until the trainer answers
- On answer, member is notified and can see the answer inline

### 9.8 Supplements
- Member can browse the supplement list (name, price, availability, photo)
- Member can book a supplement (quantity) — booking goes to admin for confirmation
- Trainer recommendations appear highlighted at the top of the list

### 9.9 Equipment View
- Read-only view of available gym equipment with photos and availability count

### 9.10 Chat & Notifications
- Member can chat with their assigned trainer and with admin
- Member cannot initiate chats with other members or unassigned trainers
- Notifications for: workout assigned, diet assigned, question answered, supplement booking confirmed, admin messages

---

## 10. Chat System

### Architecture
- **Socket.IO** for real-time delivery
- **MongoDB** for message persistence
- Chat rooms are identified by the `Chat._id`

### Access Rules

| Sender | Can chat with |
|---|---|
| Admin | Any user (trainer or member) |
| Trainer | Admin + their assigned members only |
| Member | Admin + their assigned trainer only |

### Backend — socket/socket.js

```js
// Core events to implement:

io.on('connection', (socket) => {
  // socket.handshake.auth.token — verify JWT here

  socket.on('join_chat', (chatId) => {
    socket.join(chatId)
  })

  socket.on('send_message', async (data) => {
    // data: { chatId, content, mediaUrl? }
    // 1. Validate sender is a participant of this chat
    // 2. Save Message to DB
    // 3. Update Chat.lastMessage
    // 4. Emit 'receive_message' to the room
    // 5. Emit 'notification' to offline participants
    io.to(data.chatId).emit('receive_message', savedMessage)
  })

  socket.on('mark_read', async ({ chatId }) => {
    // Mark all messages in chat as read by this user
  })

  socket.on('disconnect', () => {
    // handle cleanup
  })
})
```

### Creating a Chat
- `POST /api/chats` with `{ participantId }` — finds an existing chat between the two users or creates one
- Access control: validate that the two users are allowed to chat (role-based check)

### Frontend — socket/socket.js (client)

```js
import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_SERVER_URL, {
  autoConnect: false,
  auth: { token: localStorage.getItem('accessToken') }
})
```

Connect after login, disconnect on logout.

---

## 11. Notification System

### In-App Notifications
- Every action that requires another user's attention creates a `Notification` document
- The recipient's notification bell shows an unread count badge
- On page load, fetch `GET /api/notifications` for the current user

### Real-Time Delivery (Socket.IO)
```js
// Server emits to a specific user's room (each user joins a room named after their userId on connect)
socket.join(userId.toString())
io.to(recipientId.toString()).emit('new_notification', notificationDoc)
```

### Notification Types & Triggers

| Type | Trigger | Recipient |
|---|---|---|
| `renewal_request` | Member clicks "Renew" | Admin |
| `payment_done` | Member clicks "Payment Done" | Admin |
| `plan_switch` | Member requests plan switch | Admin |
| `workout_assigned` | Trainer assigns workout | Member |
| `diet_assigned` | Trainer assigns diet | Member |
| `question_answered` | Trainer answers question | Member |
| `new_question` | Member raises question | Trainer |
| `trainer_assigned` | Admin assigns trainer | Member + Trainer |
| `supplement_booking` | Member/Trainer books supplement | Admin |
| `booking_confirmed` | Admin confirms booking | Member/Trainer |
| `supplement_recommended` | Trainer recommends supplement | Member |
| `progress_photo_shared` | Member shares photo | Trainer |
| `general` | Admin/Trainer sends manual message | Target user(s) |

---

## 12. File Uploads

### Cloudinary Setup
```js
// config/cloudinary.js
const cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
```

### Multer Middleware
```js
// middleware/upload.middleware.js
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: `ironfort/${file.fieldname}`,
    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
    allowed_formats: ['jpg','jpeg','png','webp','mp4','mov']
  })
})

module.exports = multer({ storage })
```

### Upload Endpoints
- Profile photos → `upload.single('profilePhoto')`
- Equipment photos → `upload.single('photo')`
- Supplement photos → `upload.single('photo')`
- Progress photos → `upload.single('photo')`
- Exercise videos → `upload.single('video')`
- Transformation photos → `upload.single('photo')`

---

## 13. Frontend Pages & Components

### Auth Pages
- `pages/auth/Login.jsx` — single login form for all roles, redirect based on role after login

### Admin Pages
```
pages/admin/
├── Dashboard.jsx           ← stats, expiring subscriptions, recent activity
├── Members.jsx             ← all members table with search/filter
├── MemberDetail.jsx        ← full profile, subscription, trainer assignment
├── Trainers.jsx            ← all trainers table
├── TrainerDetail.jsx       ← full profile, assigned members
├── RegisterUser.jsx        ← form to register trainer or member
├── Plans.jsx               ← subscription plan CRUD
├── Attendance.jsx          ← attendance table/calendar (all users)
├── Equipment.jsx           ← equipment list + edit
├── Supplements.jsx         ← supplement stock management
├── Bookings.jsx            ← supplement bookings management
├── Reports.jsx             ← revenue + attendance charts
├── Notifications.jsx       ← send notifications
└── Chat.jsx                ← admin chat interface
```

### Trainer Pages
```
pages/trainer/
├── Dashboard.jsx           ← assigned members, today's attendance, pending Q&A
├── MyMembers.jsx           ← assigned members list
├── MemberProfile.jsx       ← member detail: measurements, workouts, diet, performance
├── AssignWorkout.jsx       ← workout builder form
├── AssignDiet.jsx          ← diet builder form
├── RecordMeasurement.jsx   ← measurement form
├── VideoLibrary.jsx        ← upload + manage demo videos
├── Questions.jsx           ← Q&A inbox
├── Supplements.jsx         ← view + book supplements
├── Equipment.jsx           ← read-only equipment view
├── Attendance.jsx          ← mark own attendance
└── Chat.jsx                ← trainer chat interface
```

### Member Pages
```
pages/member/
├── Dashboard.jsx           ← subscription status, today's workout/diet, notifications
├── Subscription.jsx        ← current plan, renew button, payment done button, switch plan
├── Workouts.jsx            ← assigned workouts with done checkboxes
├── Diet.jsx                ← assigned diet plans
├── Attendance.jsx          ← mark own attendance + history calendar
├── Progress.jsx            ← upload progress photos
├── Measurements.jsx        ← view body measurement history chart
├── Questions.jsx           ← raise questions + view answers
├── Supplements.jsx         ← browse + book supplements
├── Equipment.jsx           ← read-only equipment view
└── Chat.jsx                ← member chat interface
```

### Shared Components
```
components/shared/
├── Navbar.jsx
├── Sidebar.jsx
├── NotificationBell.jsx    ← real-time badge + dropdown
├── ChatWindow.jsx          ← reusable chat panel
├── AttendanceCalendar.jsx
├── MeasurementChart.jsx    ← Recharts line chart
├── SubscriptionCard.jsx
├── UserCard.jsx
├── FileUpload.jsx          ← react-dropzone wrapper
├── ConfirmModal.jsx        ← for removal/destructive actions
└── ProtectedRoute.jsx      ← role-based route guard
```

---

## 14. Environment Variables

### Server — `.env`
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

### Client — `.env`
```
VITE_SERVER_URL=http://localhost:5000
VITE_API_BASE=http://localhost:5000/api
```

---

## 15. Step-by-Step Build Order

Follow this order to build incrementally — each phase is independently testable before moving on.

### Phase 1 — Project Setup & Auth (Week 1)
1. Initialize server: `npm init`, install express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken, cookie-parser
2. Initialize client: `npm create vite@latest client -- --template react`, install dependencies
3. Connect MongoDB (`config/db.js`)
4. Build `User` model and the auth controller (login, logout, refresh)
5. Build `auth.middleware.js` and `role.middleware.js`
6. Build the Login page on the frontend with JWT storage in memory (access token) and cookie (refresh)
7. Build `ProtectedRoute` and role-based redirects

### Phase 2 — Admin Core (Week 2)
1. Build `Member` and `Trainer` models and profile routes
2. Build register-trainer and register-member endpoints + Admin registration form
3. Build user removal endpoint + ConfirmModal on frontend
4. Build trainer–member assignment endpoint + UI
5. Build credential reset endpoint + UI

### Phase 3 — Subscriptions (Week 2–3)
1. Build `SubscriptionPlan` model and CRUD routes
2. Build `MemberSubscription` model and assign-plan route
3. Build subscription tracking dashboard (due dates table with color coding)
4. Build member-side: renew button, payment done button, plan switch
5. Build admin confirmation flow

### Phase 4 — Attendance (Week 3)
1. Build `Attendance` model and mark-attendance route
2. Build "Mark Attendance" button for trainer and member (once-per-day guard)
3. Build attendance history calendar component
4. Build admin attendance view with filters

### Phase 5 — Workouts & Diet (Week 3–4)
1. Build `Workout` model and trainer assignment routes
2. Build workout builder form (dynamic exercise rows)
3. Build member workout view with "Mark Done" checkboxes
4. Build `Diet` model and the same pattern
5. Build exercise video upload and video library

### Phase 6 — Body Measurements & Progress (Week 4)
1. Build `BodyMeasurement` model and trainer recording routes
2. Build measurement history chart (Recharts line chart)
3. Build `ProgressPhoto` model and member upload routes
4. Build trainer view of member progress photos

### Phase 7 — Equipment & Supplements (Week 4–5)
1. Build `Equipment` model and admin CRUD routes + frontend
2. Build `Supplement` model and admin CRUD routes + frontend
3. Build `SupplementBooking` model, booking flow, and admin confirmation
4. Build supplement recommendation feature for trainers

### Phase 8 — Questions & Notifications (Week 5)
1. Build `Question` model and member Q&A routes
2. Build trainer Q&A inbox and answer flow
3. Build `Notification` model and notification routes
4. Wire notifications to all existing actions (use a `createNotification` utility function)

### Phase 9 — Chat System (Week 5–6)
1. Install Socket.IO on server and client
2. Build `Chat` and `Message` models
3. Build chat room creation endpoint with access control
4. Build socket event handlers (join, send, read, disconnect)
5. Build the `ChatWindow` component with message list and input
6. Build the conversation list sidebar
7. Wire the notification bell to real-time socket events

### Phase 10 — Reports & Polish (Week 6)
1. Build revenue report endpoint + Recharts bar/line chart
2. Build attendance report endpoint + chart
3. Add loading states, error boundaries, and empty states throughout
4. Add search and filter to all list pages
5. Mobile responsiveness pass
6. Final testing of all role flows end-to-end

---

## Quick Reference — Chat Access Rules (Implementation)

When `POST /api/chats` is called with a `participantId`, run this check before creating the room:

```js
async function canChat(requester, targetId) {
  if (requester.role === 'admin') return true

  const target = await User.findById(targetId)

  if (requester.role === 'trainer') {
    if (target.role === 'admin') return true
    if (target.role === 'member') {
      const trainer = await Trainer.findOne({ user: requester._id })
      return trainer.assignedMembers.includes(targetId)
    }
    return false
  }

  if (requester.role === 'member') {
    if (target.role === 'admin') return true
    if (target.role === 'trainer') {
      const member = await Member.findOne({ user: requester._id })
      return member.assignedTrainer?.toString() === targetId.toString()
    }
    return false
  }

  return false
}
```

---

*IronFort — Built to be strong. Instructions v1.0*
