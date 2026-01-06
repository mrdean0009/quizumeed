import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Trophy, BookOpen, Settings } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">QuizUmeed</span>
            </Link>
            
            {user && (
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link to="/dashboard" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/content" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  <BookOpen className="inline w-4 h-4 mr-1" />
                  Content
                </Link>
                <Link to="/leaderboard" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  <Trophy className="inline w-4 h-4 mr-1" />
                  Leaderboard
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                    <Settings className="inline w-4 h-4 mr-1" />
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700 text-sm">
                  <User className="inline w-4 h-4 mr-1" />
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
