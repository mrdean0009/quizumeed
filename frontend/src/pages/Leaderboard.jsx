import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const Leaderboard = () => {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [userRank, setUserRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    subject: '',
    timeframe: 'all'
  })

  const categories = ['SSC', 'RRB', 'Bank', 'Railway', 'UPSC']
  const subjects = ['Reasoning', 'Quant', 'English', 'GK', 'Computer']
  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' }
  ]

  useEffect(() => {
    fetchLeaderboard()
    fetchUserRank()
  }, [filters])

  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.subject) params.append('subject', filters.subject)
      if (filters.timeframe) params.append('timeframe', filters.timeframe)

      const response = await axios.get(`/api/leaderboard?${params}`)
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    }
  }

  const fetchUserRank = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.subject) params.append('subject', filters.subject)

      const response = await axios.get(`/api/leaderboard/my-rank?${params}`)
      setUserRank(response.data)
    } catch (error) {
      console.error('Failed to fetch user rank:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const getRankIcon = (position) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (position === 3) return <Award className="w-6 h-6 text-orange-500" />
    return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">{position}</span>
  }

  const getRankBadge = (position) => {
    if (position === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (position === 2) return 'bg-gray-100 text-gray-800 border-gray-200'
    if (position === 3) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against other students</p>
      </div>

      {/* User Rank Card */}
      {userRank && userRank.rank && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-md p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Your Current Rank</h2>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">#{userRank.rank}</p>
                  <p className="text-sm opacity-90">Rank</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{userRank.stats.totalScore}</p>
                  <p className="text-sm opacity-90">Total Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{Math.round(userRank.stats.avgAccuracy)}%</p>
                  <p className="text-sm opacity-90">Avg Accuracy</p>
                </div>
              </div>
            </div>
            <Trophy className="w-16 h-16 opacity-20" />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Filter Leaderboard</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              value={filters.timeframe}
              onChange={(e) => handleFilterChange('timeframe', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {timeframes.map(timeframe => (
                <option key={timeframe.value} value={timeframe.value}>{timeframe.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {leaderboard.map((entry, index) => {
            const position = index + 1
            const isCurrentUser = entry._id === user?.id

            return (
              <div
                key={entry._id}
                className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  isCurrentUser ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(position)}
                  </div>
                  
                  <div>
                    <h3 className={`font-semibold ${isCurrentUser ? 'text-primary-900' : 'text-gray-900'}`}>
                      {entry.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {entry.totalQuizzes} quiz{entry.totalQuizzes !== 1 ? 'es' : ''} completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{entry.totalScore}</p>
                    <p className="text-xs text-gray-600">Total Score</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{entry.avgAccuracy}%</p>
                    <p className="text-xs text-gray-600">Avg Accuracy</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{entry.bestScore}</p>
                    <p className="text-xs text-gray-600">Best Score</p>
                  </div>

                  <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getRankBadge(position)}`}>
                    #{position}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings yet</h3>
            <p className="text-gray-600">Complete some quizzes to see the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
