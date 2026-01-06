import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, FileText, Filter } from 'lucide-react'
import axios from 'axios'

const Content = () => {
  const [content, setContent] = useState([])
  const [filteredContent, setFilteredContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    subject: '',
    type: ''
  })

  const categories = ['SSC', 'RRB', 'Bank', 'Railway', 'UPSC']
  const subjects = ['Reasoning', 'Quant', 'English', 'GK', 'Computer']
  const types = ['pdf', 'text']

  useEffect(() => {
    fetchContent()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [content, filters])

  const fetchContent = async () => {
    try {
      const response = await axios.get('/api/content')
      setContent(response.data)
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = content

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category)
    }
    if (filters.subject) {
      filtered = filtered.filter(item => item.subject === filters.subject)
    }
    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type)
    }

    setFilteredContent(filtered)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({ category: '', subject: '', type: '' })
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Materials</h1>
        <p className="text-gray-600">Access comprehensive study materials and resources</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="text">Text/Blog</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {item.type === 'pdf' ? (
                  <FileText className="w-8 h-8 text-red-500 mr-3" />
                ) : (
                  <BookOpen className="w-8 h-8 text-blue-500 mr-3" />
                )}
                <div>
                  <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded ml-1">
                    {item.subject}
                  </span>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            
            {item.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {item.type.toUpperCase()} • {new Date(item.createdAt).toLocaleDateString()}
              </span>
              
              <Link
                to={`/content/${item._id}`}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                View Content
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-600">Try adjusting your filters or check back later for new content.</p>
        </div>
      )}
    </div>
  )
}

export default Content
