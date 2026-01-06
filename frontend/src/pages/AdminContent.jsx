import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Upload, FileText, Type } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('text')
  const [pdfFile, setPdfFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const { register: registerText, handleSubmit: handleSubmitText, reset: resetText, formState: { errors: errorsText, isSubmitting: isSubmittingText } } = useForm()
  const { register: registerPdf, handleSubmit: handleSubmitPdf, reset: resetPdf, formState: { errors: errorsPdf, isSubmitting: isSubmittingPdf } } = useForm()

  const categories = ['SSC', 'RRB', 'Bank', 'Railway', 'UPSC']
  const subjects = ['Reasoning', 'Quant', 'English', 'GK', 'Computer']

  const onSubmitTextContent = async (data) => {
    try {
      await axios.post('/api/content/text', {
        title: data.title,
        content: data.content,
        category: data.category,
        subject: data.subject,
        description: data.description
      })

      toast.success('Text content added successfully!')
      resetText()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add content')
    }
  }

  const onSubmitPdfContent = async (data) => {
    if (!pdfFile) {
      toast.error('Please select a PDF file')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('pdfFile', pdfFile)
    formData.append('title', data.title)
    formData.append('category', data.category)
    formData.append('subject', data.subject)
    formData.append('description', data.description)

    try {
      await axios.post('/api/content/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('PDF content uploaded successfully!')
      resetPdf()
      setPdfFile(null)
      document.getElementById('pdfFile').value = ''
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload PDF')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
    } else {
      toast.error('Please select a valid PDF file')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Content</h1>
        <p className="text-gray-600">Add and manage study materials and educational content</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('text')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'text'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Type className="w-4 h-4 inline mr-2" />
              Text Content
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'pdf'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              PDF Upload
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'text' && (
            <form onSubmit={handleSubmitText(onSubmitTextContent)} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  {...registerText('title', { required: 'Title is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter content title..."
                />
                {errorsText.title && (
                  <p className="mt-1 text-sm text-red-600">{errorsText.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...registerText('description')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief description of the content..."
                />
              </div>

              {/* Category and Subject */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...registerText('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errorsText.category && (
                    <p className="mt-1 text-sm text-red-600">{errorsText.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    {...registerText('subject', { required: 'Subject is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  {errorsText.subject && (
                    <p className="mt-1 text-sm text-red-600">{errorsText.subject.message}</p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  {...registerText('content', { required: 'Content is required' })}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter the content here... You can include formatted text, bullet points, etc."
                />
                {errorsText.content && (
                  <p className="mt-1 text-sm text-red-600">{errorsText.content.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingText}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
              >
                {isSubmittingText ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding Content...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Text Content
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'pdf' && (
            <form onSubmit={handleSubmitPdf(onSubmitPdfContent)} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  {...registerPdf('title', { required: 'Title is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter PDF title..."
                />
                {errorsPdf.title && (
                  <p className="mt-1 text-sm text-red-600">{errorsPdf.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...registerPdf('description')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Brief description of the PDF content..."
                />
              </div>

              {/* Category and Subject */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...registerPdf('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errorsPdf.category && (
                    <p className="mt-1 text-sm text-red-600">{errorsPdf.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    {...registerPdf('subject', { required: 'Subject is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  {errorsPdf.subject && (
                    <p className="mt-1 text-sm text-red-600">{errorsPdf.subject.message}</p>
                  )}
                </div>
              </div>

              {/* PDF File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File *
                </label>
                <input
                  id="pdfFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {pdfFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Security Features</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• PDF will be watermarked with user information</li>
                  <li>• Download and copy functions will be disabled</li>
                  <li>• Content is protected against screenshots</li>
                  <li>• View-only mode for enhanced security</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={!pdfFile || isSubmittingPdf || isUploading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
              >
                {isSubmittingPdf || isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading PDF...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload PDF Content
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminContent
