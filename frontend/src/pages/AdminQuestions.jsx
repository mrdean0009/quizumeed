import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Upload, FileText, Eye } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AdminQuestions = () => {
  const [activeTab, setActiveTab] = useState('add')
  const [csvFile, setCsvFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm()

  const categories = ['SSC', 'RRB', 'Bank', 'Railway', 'UPSC']
  const subjects = ['Reasoning', 'Quant', 'English', 'GK', 'Computer']
  const difficulties = ['easy', 'medium', 'hard']

  const watchedOptions = watch(['option1', 'option2', 'option3', 'option4'])
  const watchedCorrectAnswer = watch('correctAnswer')

  const onSubmitQuestion = async (data) => {
    try {
      const options = [data.option1, data.option2, data.option3, data.option4].filter(Boolean)
      
      await axios.post('/api/questions', {
        question: data.question,
        options,
        correctAnswer: data.correctAnswer,
        difficulty: data.difficulty,
        category: data.category,
        subject: data.subject,
        timeLimit: parseInt(data.timeLimit) || 60
      })

      toast.success('Question added successfully!')
      reset()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add question')
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      // Preview first few rows
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const lines = text.split('\n').slice(0, 6) // Header + 5 rows
        setPreviewData(lines)
      }
      reader.readAsText(file)
    } else {
      toast.error('Please select a valid CSV file')
    }
  }

  const uploadCsvFile = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('csvFile', csvFile)

    try {
      const response = await axios.post('/api/questions/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success(response.data.message)
      if (response.data.errors && response.data.errors.length > 0) {
        console.log('Upload errors:', response.data.errors)
      }
      
      setCsvFile(null)
      setPreviewData(null)
      document.getElementById('csvFile').value = ''
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload questions')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Questions</h1>
        <p className="text-gray-600">Add questions manually or upload in bulk via CSV</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('add')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'add'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Question
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'bulk'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Bulk Upload
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'add' && (
            <form onSubmit={handleSubmit(onSubmitQuestion)} className="space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <textarea
                  {...register('question', { required: 'Question is required' })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter the question..."
                />
                {errors.question && (
                  <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
                )}
              </div>

              {/* Options */}
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option {num} *
                    </label>
                    <input
                      {...register(`option${num}`, { required: `Option ${num} is required` })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder={`Enter option ${num}...`}
                    />
                    {errors[`option${num}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`option${num}`].message}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer *
                </label>
                <select
                  {...register('correctAnswer', { required: 'Correct answer is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select correct answer</option>
                  {watchedOptions.map((option, index) => (
                    option && (
                      <option key={index} value={option}>
                        Option {index + 1}: {option}
                      </option>
                    )
                  ))}
                </select>
                {errors.correctAnswer && (
                  <p className="mt-1 text-sm text-red-600">{errors.correctAnswer.message}</p>
                )}
              </div>

              {/* Category, Subject, Difficulty */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    {...register('subject', { required: 'Subject is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    {...register('difficulty', { required: 'Difficulty is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select difficulty</option>
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.difficulty && (
                    <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                  )}
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (seconds)
                </label>
                <input
                  {...register('timeLimit')}
                  type="number"
                  min="30"
                  max="300"
                  defaultValue="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Preview */}
              {watchedCorrectAnswer && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </h4>
                  <p className="text-sm text-gray-600">
                    Correct answer: <strong>{watchedCorrectAnswer}</strong>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {isSubmitting ? 'Adding Question...' : 'Add Question'}
              </button>
            </form>
          )}

          {activeTab === 'bulk' && (
            <div className="space-y-6">
              {/* CSV Format Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h4>
                <p className="text-sm text-blue-800 mb-2">
                  Your CSV file should have the following columns:
                </p>
                <code className="text-xs bg-blue-100 p-2 rounded block">
                  question,option1,option2,option3,option4,correctAnswer,difficulty,category,subject,timeLimit
                </code>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Preview */}
              {previewData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Preview (First 5 rows)</h4>
                  <div className="overflow-x-auto">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {previewData.join('\n')}
                    </pre>
                  </div>
                </div>
              )}

              <button
                onClick={uploadCsvFile}
                disabled={!csvFile || isUploading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Questions
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminQuestions
