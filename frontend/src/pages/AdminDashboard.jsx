import { Link } from 'react-router-dom'
import { Users, FileQuestion, BookOpen, BarChart3, FolderOpen, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalContent: 0,
    totalQuizzes: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/stats/admin-activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setRecentActivity(response.data)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage questions, content, and monitor platform activity</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FileQuestion className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Content Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Quizzes Taken</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/categories"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center mb-4">
            <FolderOpen className="w-8 h-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold text-gray-900">Manage Quiz</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Manage categories and subjects for quiz organization and structure.
          </p>
          <div className="text-blue-600 font-medium">
            Manage Quiz Settings →
          </div>
        </Link>
        <Link
          to="/admin/questions"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center mb-4">
            <FileQuestion className="w-8 h-8 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold text-gray-900">Manage Questions</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Add, edit, and organize quiz questions. Upload questions in bulk via CSV.
          </p>
          <div className="text-green-600 font-medium">
            Manage Questions →
          </div>
        </Link>

        <Link
          to="/admin/content"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-semibold text-gray-900">Manage Content</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Upload and manage study materials, PDFs, and educational content.
          </p>
          <div className="text-purple-600 font-medium">
            Manage Content →
          </div>
        </Link>

        <Link to="/admin/delete" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <Trash2 className="w-8 h-8 text-red-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Data Management</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Manage users, questions and content. Freeze/unfreeze accounts and delete data.
          </p>
          <div className="text-red-600 font-medium">
            Manage Data Operations →
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-900">{activity.message}</span>
                  {activity.score && (
                    <span className="ml-2 text-sm text-gray-600">({activity.score})</span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(activity.time).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
