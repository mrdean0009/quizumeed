# QuizUmeed - MERN Quiz Application

A comprehensive quiz platform for competitive exam preparation with adaptive difficulty, content management, and security features.

## Features

- **User Authentication**: JWT-based login/register with role management
- **Adaptive Quiz System**: Dynamic difficulty progression (Easy → Medium → Hard)
- **Question Management**: Manual entry + bulk CSV upload for admins
- **Content Library**: Secure PDF/text content with watermarking
- **Leaderboard**: Real-time rankings with filtering
- **Security**: Anti-screenshot, watermarks, session management

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, JWT
- **Frontend**: React, Vite, Tailwind CSS, React Query
- **Security**: Rate limiting, CORS, cache control headers

## Quick Start

1. **Install dependencies**:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. **Setup MongoDB**:
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` in `backend/.env`

3. **Start development**:
```bash
# From root directory
npm run dev
```

4. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Admin Account

Create an admin account by registering with role "admin" or update a user in MongoDB:
```javascript
db.users.updateOne({email: "admin@example.com"}, {$set: {role: "admin"}})
```

## CSV Format for Bulk Questions

```csv
question,option1,option2,option3,option4,correctAnswer,difficulty,category,subject,timeLimit
"What is 2+2?","3","4","5","6","4","easy","SSC","Quant","60"
```

## Deployment

- **Frontend**: Deploy to Netlify/Vercel
- **Backend**: Deploy to Heroku/AWS/Railway
- **Database**: MongoDB Atlas for production

## Security Features

- JWT authentication with secure headers
- Rate limiting (100 requests/15min)
- Content watermarking with user ID
- Disabled right-click, F12, screenshots
- View-only PDF mode
- Session timeout handling
