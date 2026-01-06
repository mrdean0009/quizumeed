import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import QuizResults from './pages/QuizResults'
import Content from './pages/Content'
import ContentView from './pages/ContentView'
import Leaderboard from './pages/Leaderboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminQuestions from './pages/AdminQuestions'
import AdminContent from './pages/AdminContent'
import AdminCategories from './pages/AdminCategories'
import AdminDelete from './pages/AdminDelete'
import WatermarkOverlay from './components/WatermarkOverlay'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <WatermarkOverlay />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/quiz/:quizId" element={user ? <Quiz /> : <Navigate to="/login" />} />
        <Route path="/quiz/:quizId/results" element={user ? <QuizResults /> : <Navigate to="/login" />} />
        <Route path="/content" element={user ? <Content /> : <Navigate to="/login" />} />
        <Route path="/content/:id" element={user ? <ContentView /> : <Navigate to="/login" />} />
        <Route path="/leaderboard" element={user ? <Leaderboard /> : <Navigate to="/login" />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/questions" element={user?.role === 'admin' ? <AdminQuestions /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/content" element={user?.role === 'admin' ? <AdminContent /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/categories" element={user?.role === 'admin' ? <AdminCategories /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/delete" element={user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/dashboard" />} />
      </Routes>
    </div>
  )
}

export default App
