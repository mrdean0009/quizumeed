import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, BookOpen, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const ContentView = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [id])

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/api/content/${id}/view`)
      setContent(response.data)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Content not found</h2>
          <Link to="/content" className="text-blue-600 hover:text-blue-700">
            Back to Content Library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/content"
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center">
                {content.type === 'pdf' ? (
                  <FileText className="w-6 h-6 text-red-500 mr-2" />
                ) : (
                  <BookOpen className="w-6 h-6 text-blue-500 mr-2" />
                )}
                <h1 className="text-xl font-semibold text-gray-900">{content.title}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {content.category}
              </span>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {content.subject}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden no-select">
          {/* Content Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">{content.title}</h2>
                {content.description && (
                  <p className="text-sm text-gray-600 mt-1">{content.description}</p>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                View Only
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6">
            {content.type === 'text' ? (
              <div className="prose max-w-none">
                <div 
                  className="whitespace-pre-wrap text-gray-900 leading-relaxed"
                  style={{ 
                    fontFamily: 'Georgia, serif',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}
                >
                  {content.content}
                </div>
              </div>
            ) : content.type === 'pdf' ? (
              <div className="w-full">
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>PDF Viewer:</strong> If the PDF doesn't load, try opening it in a new tab.
                  </p>
                </div>
                <div className="flex flex-col space-y-4">
                  <iframe
                    src={content.pdfUrl}
                    className="w-full border border-gray-300 rounded"
                    title={content.title}
                    style={{ height: '800px' }}
                    onError={() => console.error('PDF loading failed')}
                  />
                  <div className="text-center">
                    <a
                      href={content.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Open PDF in New Tab
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Content Not Available</h3>
                <p className="text-gray-600 mb-4">
                  This content type is not supported for viewing.
                </p>
              </div>
            )}
          </div>

          {/* Watermark Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t">
            <p className="text-xs text-gray-500 text-center">
              This content is licensed to {user?.name} (ID: {user?.id}) • QuizUmeed Platform
            </p>
          </div>
        </div>

        {/* Related Content */}
        {content.relatedQuizzes && content.relatedQuizzes.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Quizzes</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {content.relatedQuizzes.map((quiz, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {content.category} - {content.subject} Quiz
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Test your knowledge on this topic
                  </p>
                  <Link
                    to="/dashboard"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Start Quiz →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Watermark */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 opacity-10">
          <div className="text-4xl font-bold text-gray-800 whitespace-nowrap">
            {user?.name} - {user?.id}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentView
