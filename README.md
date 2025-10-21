# 🎯 **Animated Quiz Application**

## **🌟 A Modern, Interactive Quiz Platform**

A **cutting-edge quiz application** built with **Next.js**, featuring **stunning animations**, **secure user authentication**, and **comprehensive admin management**.

<div align="center">

![Quiz App Banner](https://via.placeholder.com/800x200/6366f1/ffffff?text=Animated+Quiz+Application)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

## ✨ Features

### 🎮 Core Features
- **Interactive Quiz Player** - Engaging quiz interface with timer and animations
- **User Authentication** - Secure JWT-based login/signup system
- **Retake Prevention** - Users can only attempt each quiz once
- **Real-time Statistics** - Track scores, rankings, and performance
- **Responsive Design** - Works perfectly on desktop and mobile devices

### 👤 User Features
- **Profile Management** - Update name and avatar
- **Quiz Statistics** - View personal performance metrics
- **Leaderboard** - Compare scores with other users
- **Progress Tracking** - See completed quizzes and results

### 🛠️ Admin Features
- **User Management** - View and manage all registered users
- **Quiz Management** - Create, edit, and delete quizzes
- **Bulk Import** - Import questions from Excel files
- **Admin Dashboard** - Comprehensive overview of system statistics

### 🎨 Design Features
- **Gradient Backgrounds** - Beautiful animated gradients
- **Glass Morphism** - Modern glassmorphic UI components
- **Smooth Animations** - Framer Motion powered animations
- **Dark Theme** - Sleek dark mode interface
- **Custom Avatars** - Multiple avatar options for users

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: SWR for data fetching
- **File Processing**: ExcelJS for bulk imports

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB database
- npm or pnpm package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/eshwargit2/Quiz_Application-.git
   cd Quiz_Application-
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/quiz_app
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz_app

   # JWT Secret (generate a secure random string)
   JWT_SECRET=your-super-secure-jwt-secret-key-here

   # Next.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗂️ Project Structure

```
animated-quiz-app/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin dashboard pages
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── admin/          # Admin management APIs
│   │   ├── attempts/       # Quiz attempt handling
│   │   ├── quizzes/        # Quiz management
│   │   └── questions/      # Question management
│   ├── dashboard/          # User dashboard
│   ├── quiz/              # Quiz playing interface
│   └── profile/           # User profile management
├── components/             # Reusable UI components
│   ├── auth/              # Authentication forms
│   ├── quiz/              # Quiz-specific components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── auth.ts           # JWT authentication logic
│   ├── mongodb.ts        # Database connection
│   └── utils.ts          # Helper functions
├── models/               # Mongoose database models
│   ├── user.ts          # User schema
│   ├── quiz.ts          # Quiz schema
│   ├── question.ts      # Question schema
│   └── attempt.ts       # Quiz attempt schema
└── types/               # TypeScript type definitions
```

## 📊 Database Schema

### User Model
```typescript
{
  email: string (unique)
  passwordHash: string
  name: string
  isAdmin: boolean
  avatarId: number
}
```

### Quiz Model
```typescript
{
  title: string
  description: string
  questionIds: ObjectId[]
  createdBy: ObjectId
  isActive: boolean
}
```

### Question Model
```typescript
{
  text: string
  options: string[]
  correctOptionIndex: number
  explanation?: string
}
```

### Attempt Model
```typescript
{
  userId: ObjectId
  quizId: ObjectId
  answers: Answer[]
  score: number
  total: number
  durationSec: number
}
```

## 🔐 Authentication Flow

1. **User Registration/Login** - JWT tokens stored in HTTP-only cookies
2. **Route Protection** - Middleware validates tokens on protected routes
3. **Admin Access** - Special admin role for management features
4. **Auto Logout** - Tokens expire after 7 days

## 🎮 Usage Guide

### For Users
1. **Sign up** for a new account or **log in**
2. **Browse available quizzes** on the dashboard
3. **Take quizzes** - answer questions within the time limit
4. **View results** and compare with others on the leaderboard
5. **Update profile** with custom avatar and name

### For Admins
1. **Access admin dashboard** at `/admin`
2. **Create quizzes** manually or import from Excel
3. **Manage users** - view user statistics
4. **Monitor system** - track overall performance

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Quizzes
- `GET /api/quizzes` - List all quizzes
- `POST /api/quizzes` - Create new quiz (admin)
- `DELETE /api/quizzes/[id]` - Delete quiz (admin)

### Quiz Attempts
- `GET /api/attempts` - Get user's attempts
- `POST /api/attempts` - Submit quiz attempt

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/leaderboard` - Get leaderboard data

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (already done!)
2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
3. **Configure MongoDB**
   - Use MongoDB Atlas for production
   - Update `MONGODB_URI` in Vercel environment variables

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Future Enhancements

- [ ] Real-time multiplayer quizzes
- [ ] Video/image questions support
- [ ] Categories and difficulty levels
- [ ] Detailed analytics dashboard
- [ ] Mobile app version
- [ ] Social sharing features
- [ ] Question explanations and learning mode

## 👨‍💻 Author

**Eshwar** - [eshwargit2](https://github.com/eshwargit2)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations

---

<div align="center">
  <p>Made with ❤️ and ☕</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>