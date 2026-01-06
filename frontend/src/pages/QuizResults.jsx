import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Trophy, Clock, Target, Home } from 'lucide-react'
import axios from 'axios'

const QuizResults = () => {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [quizId])

  const fetchResults = async () => {
    try {
      const response = await axios.get(`/api/quiz/${quizId}/results`)
      setQuiz(response.data)
    } catch (error) {
      console.error('Failed to fetch results:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceMessage = (accuracy) => {
    if (accuracy >= 80) return { message: "Excellent! Outstanding performance! 🏆", color: "text-green-600" }
    if (accuracy >= 60) return { message: "Good job! Keep practicing! 👍", color: "text-blue-600" }
    if (accuracy >= 40) return { message: "Not bad! Room for improvement! 📚", color: "text-yellow-600" }
    return { message: "Keep studying! You'll get better! 💪", color: "text-red-600" }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h2>
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const performance = getPerformanceMessage(quiz.accuracy)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Header */}
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
          <p className={`text-xl ${performance.color} font-semibold`}>
            {performance.message}
          </p>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Results</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <Trophy className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-3xl font-bold text-primary-600">{quiz.score}</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-3xl font-bold text-green-600">{Math.round(quiz.accuracy)}%</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total Time</p>
              <p className="text-3xl font-bold text-blue-600">
                {Math.floor(quiz.totalDuration / 60)}:{(quiz.totalDuration % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Question Breakdown</h3>
          
          <div className="space-y-4">
            {quiz.questions.map((q, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 flex-1">
                    Q{index + 1}: {q.questionId?.question}
                  </h4>
                  <div className="flex items-center ml-4">
                    {q.isCorrect ? (
                      <span className="text-green-600 font-semibold">✓ Correct</span>
                    ) : (
                      <span className="text-red-600 font-semibold">✗ Incorrect</span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Your Answer:</strong> {q.userAnswer || 'Not answered'}</p>
                  {!q.isCorrect && (
                    <p><strong>Correct Answer:</strong> {q.questionId?.correctAnswer}</p>
                  )}
                  <p><strong>Time Spent:</strong> {q.timeSpent}s</p>
                  <p><strong>Difficulty:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {q.difficulty}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-x-4">
          <Link
            to="/dashboard"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          
          <Link
            to="/leaderboard"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center"
          >
            <Trophy className="w-5 h-5 mr-2" />
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default QuizResults
