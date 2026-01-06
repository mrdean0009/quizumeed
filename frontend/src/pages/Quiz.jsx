import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Quiz = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchQuizData()
  }, [quizId])

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showResult) {
      handleFinalSubmit()
    }
  }, [timeLeft, showResult])

  const fetchQuizData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/quiz/${quizId}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      setQuiz(response.data.quiz)
      setQuestions(response.data.questions)
      
      // Initialize answers object
      const initialAnswers = {}
      response.data.questions.forEach(q => {
        initialAnswers[q._id] = null
      })
      setAnswers(initialAnswers)
    } catch (error) {
      toast.error('Failed to load quiz')
      navigate('/dashboard')
    }
  }

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const getAttemptedCount = () => {
    return Object.values(answers).filter(answer => answer !== null).length
  }

  const isAllAttempted = () => {
    return Object.values(answers).every(answer => answer !== null)
  }

  const handleFinalSubmit = async () => {
    if (!isAllAttempted()) {
      toast.error('Please attempt all questions before submitting')
      return
    }

    if (!confirm('Are you sure you want to submit the quiz?')) {
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`/api/quiz/${quizId}/submit`, {
        answers
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      setResult(response.data)
      setShowResult(true)
    } catch (error) {
      toast.error('Failed to submit quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h1>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result?.score || 0}/{questions.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(((result?.score || 0) / questions.length) * 100)}%
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Time Taken</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatTime(1800 - timeLeft)}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Quiz Examination</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-500" />
              <span className="font-mono text-lg font-semibold text-red-500">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Question Panel */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <span className="text-sm text-gray-500">
                {currentQuestion?.difficulty || 'Medium'} Level
              </span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </p>
            </div>

            <div className="space-y-3">
              {currentQuestion?.options?.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion._id] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={index}
                    checked={answers[currentQuestion._id] === index}
                    onChange={() => handleAnswerSelect(currentQuestion._id, index)}
                    className="sr-only"
                  />
                  <span className="flex items-center">
                    <span className="w-6 h-6 border-2 rounded-full mr-3 flex items-center justify-center">
                      {answers[currentQuestion._id] === index && (
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                      )}
                    </span>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={nextQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  disabled={!isAllAttempted() || isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Quiz Progress</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-semibold">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Attempted:</span>
                <span className="font-semibold text-green-600">{getAttemptedCount()}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className="font-semibold text-red-600">
                  {questions.length - getAttemptedCount()}
                </span>
              </div>
            </div>
          </div>

          {/* Question Grid */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Questions</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded text-sm font-semibold ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[questions[index]._id] !== null
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="text-xs space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Attempted</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Not Attempted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Quiz
