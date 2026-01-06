import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AdminDelete = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [questions, setQuestions] = useState([])
  const [content, setContent] = useState([])

  useEffect(() => {
    fetchUsers()
    fetchQuestions()
    fetchContent()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    }
  }

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setQuestions(response.data)
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/content', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setContent(response.data)
    } catch (error) {
      console.error('Error fetching content:', error)
    }
  }

  const deleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/questions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast.success('Question deleted')
      fetchQuestions()
    } catch (error) {
      toast.error('Failed to delete question')
    }
  }

  const deleteAllQuestions = async () => {
    if (!confirm('Delete ALL questions? This cannot be undone!')) return
    try {
      const token = localStorage.getItem('token')
      await Promise.all(questions.map(q => 
        axios.delete(`/api/questions/${q._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ))
      toast.success('All questions deleted')
      fetchQuestions()
    } catch (error) {
      toast.error('Failed to delete questions')
    }
  }

  const deleteContent = async (id) => {
    if (!confirm('Delete this content?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/content/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast.success('Content deleted')
      fetchContent()
    } catch (error) {
      toast.error('Failed to delete content')
    }
  }

  const deleteAllContent = async () => {
    if (!confirm('Delete ALL content? This cannot be undone!')) return
    try {
      const token = localStorage.getItem('token')
      await Promise.all(content.map(c => 
        axios.delete(`/api/content/${c._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ))
      toast.success('All content deleted')
      fetchContent()
    } catch (error) {
      toast.error('Failed to delete content')
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/users/${userId}/status`, 
        { isActive: !currentStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      toast.success(`User ${currentStatus ? 'frozen' : 'unfrozen'}`)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user? This cannot be undone!')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast.success('User deleted')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Trash2 className="w-8 h-8 text-red-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-red-500 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'questions'
                  ? 'border-b-2 border-red-500 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'content'
                  ? 'border-b-2 border-red-500 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Content
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Users ({users.length})</h2>
              </div>
              <div className="space-y-3">
                {users.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          user.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-xs text-gray-500">
                          {user.isActive ? 'Active' : 'Frozen'} • {user.lastLogin ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isActive)}
                        className={`px-3 py-1 rounded text-sm ${
                          user.isActive 
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {user.isActive ? 'Freeze' : 'Unfreeze'}
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'questions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
                <button
                  onClick={deleteAllQuestions}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  disabled={questions.length === 0}
                >
                  Delete All Questions
                </button>
              </div>
              
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No questions found in database
                </div>
              ) : (
                <div className="grid gap-4">
                  {questions.map(question => (
                    <div key={question._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {question.category?.name || question.category || 'No Category'}
                            </span>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {question.subject?.name || question.subject || 'No Subject'}
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              {question.difficulty || 'Medium'}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium mb-3 leading-relaxed">
                            {question.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {question.options?.map((option, index) => (
                              <div 
                                key={index} 
                                className={`p-2 rounded text-xs ${
                                  index === question.correctAnswer 
                                    ? 'bg-green-50 text-green-700 border border-green-200 font-semibold' 
                                    : 'bg-gray-50 text-gray-600'
                                }`}
                              >
                                <span className="font-bold">{String.fromCharCode(65 + index)}.</span> {option}
                                {index === question.correctAnswer && (
                                  <span className="ml-2 text-green-600">✓ Correct</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteQuestion(question._id)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 border-t pt-2 flex justify-between">
                        <span>ID: {question._id}</span>
                        {question.createdAt && (
                          <span>
                            Created: {new Date(question.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Content ({content.length})</h2>
                <button
                  onClick={deleteAllContent}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete All Content
                </button>
              </div>
              <div className="space-y-3">
                {content.map(item => (
                  <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <button
                      onClick={() => deleteContent(item._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDelete
