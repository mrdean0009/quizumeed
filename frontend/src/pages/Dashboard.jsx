import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Play, BookOpen, Trophy, Target } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [questionCount, setQuestionCount] = useState('25')
  const [customCount, setCustomCount] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [recentActivity, setRecentActivity] = useState([])
  const [categories, setCategories] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    bestScore: 0,
    avgAccuracy: 0,
    totalContent: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
    fetchCategories()
    fetchUserStats()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchSubjects(selectedCategory)
      setSelectedSubject('') // Reset subject when category changes
    } else {
      setSubjects([])
      setSelectedSubject('')
    }
  }, [selectedCategory])

  const fetchUserStats = async () => {
    try {
      setLoadingStats(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/stats/user-dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await axios.get('/api/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchSubjects = async (categoryId) => {
    try {
      setLoadingSubjects(true)
      const response = await axios.get(`/api/subjects/category/${categoryId}`)
      setSubjects(response.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to load subjects')
    } finally {
      setLoadingSubjects(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/stats/recent-activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setRecentActivity(response.data)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  }

  const startQuiz = async () => {
    if (!selectedCategory || !selectedSubject) {
      toast.error('Please select both category and subject')
      return
    }

    const finalQuestionCount = questionCount === 'custom' ? parseInt(customCount) : parseInt(questionCount)
    
    if (!finalQuestionCount || finalQuestionCount < 1 || finalQuestionCount > 200) {
      toast.error('Please enter a valid number of questions (1-200)')
      return
    }

    setIsStarting(true)
    try {
      const response = await axios.post('/api/quiz/start', {
        category: selectedCategory,
        subject: selectedSubject,
        questionCount: finalQuestionCount
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      
      navigate(`/quiz/${response.data._id}`)
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('No questions available for this category and subject combination')
      } else {
        toast.error(error.response?.data?.message || 'Failed to start quiz')
      }
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Ready to continue your learning journey?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Quizzes Taken</p>
              <p className="text-2xl font-bold text-gray-900">
                {loadingStats ? '...' : stats.totalQuizzes}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Best Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {loadingStats ? '...' : `${stats.bestScore}%`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Avg Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">
                {loadingStats ? '...' : `${stats.avgAccuracy}%`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Study Materials</p>
              <p className="text-2xl font-bold text-gray-900">
                {loadingStats ? '...' : stats.totalContent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Start New Quiz */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Start New Quiz</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loadingCategories}
            >
              <option value="">
                {loadingCategories ? 'Loading categories...' : 'Choose a category'}
              </option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={!selectedCategory || loadingSubjects}
            >
              <option value="">
                {!selectedCategory 
                  ? 'Select category first' 
                  : loadingSubjects 
                    ? 'Loading subjects...' 
                    : 'Choose a subject'
                }
              </option>
              {selectedCategory && subjects.length > 1 && (
                <option value="all">All Subjects (Mixed Quiz)</option>
              )}
              {subjects.map(subject => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="questionCount"
                  value="25"
                  checked={questionCount === '25'}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="mr-2"
                />
                25 Questions
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="questionCount"
                  value="50"
                  checked={questionCount === '50'}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="mr-2"
                />
                50 Questions
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="questionCount"
                  value="custom"
                  checked={questionCount === 'custom'}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="mr-2"
                />
                Custom
              </label>
            </div>
            
            {questionCount === 'custom' && (
              <input
                type="number"
                value={customCount}
                onChange={(e) => setCustomCount(e.target.value)}
                placeholder="Enter number of questions"
                min="1"
                max="200"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        </div>

        <button
          onClick={startQuiz}
          disabled={!selectedCategory || !selectedSubject || isStarting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
        >
          <Play className="w-5 h-5 mr-2" />
          {isStarting ? 'Starting Quiz...' : 'Start Quiz'}
        </button>
      </div>

      {/* Recent Quiz History */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Quiz History</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivity.map((activity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.accuracy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
