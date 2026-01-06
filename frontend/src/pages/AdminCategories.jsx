import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, FolderOpen, ArrowRight, ArrowLeft } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [allSubjects, setAllSubjects] = useState([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryFormData, setCategoryFormData] = useState({ 
    name: '', 
    description: '', 
    subjects: [] 
  })
  const [subjectFormData, setSubjectFormData] = useState({ name: '', description: '', category: '' })
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [selectedSubjects, setSelectedSubjects] = useState([])

  useEffect(() => {
    fetchCategories()
    fetchAllSubjects()
  }, [])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to fetch categories')
    }
  }

  const fetchAllSubjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setAllSubjects(response.data)
      setAvailableSubjects(response.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to fetch subjects')
    }
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const categoryData = {
        ...categoryFormData,
        subjects: selectedSubjects.map(s => s._id)
      }
      
      if (editingCategory) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/${editingCategory._id}`, categoryData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        toast.success('Category updated successfully')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`, categoryData, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        toast.success('Category created successfully')
      }
      fetchCategories()
      resetCategoryForm()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Failed to save category')
    }
  }

  const handleSubjectSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/subjects`, subjectFormData, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast.success('Subject created successfully')
      fetchAllSubjects()
      setShowSubjectForm(false)
      setSubjectFormData({ name: '', description: '', category: '' })
    } catch (error) {
      console.error('Error creating subject:', error)
      toast.error('Failed to save subject')
    }
  }

  const resetCategoryForm = () => {
    setShowCategoryForm(false)
    setEditingCategory(null)
    setCategoryFormData({ name: '', description: '', subjects: [] })
    setSelectedSubjects([])
    setAvailableSubjects(allSubjects)
  }

  const moveToSelected = (subject) => {
    setSelectedSubjects([...selectedSubjects, subject])
    setAvailableSubjects(availableSubjects.filter(s => s._id !== subject._id))
  }

  const moveToAvailable = (subject) => {
    setAvailableSubjects([...availableSubjects, subject])
    setSelectedSubjects(selectedSubjects.filter(s => s._id !== subject._id))
  }

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast.success('Category deleted')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const editCategory = (category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description,
      subjects: category.subjects || []
    })
    
    const categorySubjects = allSubjects.filter(s => 
      category.subjects?.includes(s._id)
    )
    const available = allSubjects.filter(s => 
      !category.subjects?.includes(s._id)
    )
    
    setSelectedSubjects(categorySubjects)
    setAvailableSubjects(available)
    setShowCategoryForm(true)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <FolderOpen className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Manage Quiz</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Categories</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSubjectForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </button>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {showCategoryForm && (
          <form onSubmit={handleCategorySubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                className="px-3 py-2 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                className="px-3 py-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Subjects</label>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Available Subjects</h4>
                  <div className="border rounded-md p-2 h-32 overflow-y-auto bg-white">
                    {availableSubjects.map(subject => (
                      <div
                        key={subject._id}
                        onClick={() => moveToSelected(subject)}
                        className="p-2 hover:bg-blue-50 cursor-pointer rounded text-sm"
                      >
                        {subject.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Selected Subjects</h4>
                  <div className="border rounded-md p-2 h-32 overflow-y-auto bg-white">
                    {selectedSubjects.map(subject => (
                      <div
                        key={subject._id}
                        onClick={() => moveToAvailable(subject)}
                        className="p-2 hover:bg-red-50 cursor-pointer rounded text-sm"
                      >
                        {subject.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {allSubjects.length === 0 && (
                <div className="mt-4 text-center text-gray-500">
                  <p>No subjects available. Create subjects first using the "Add Subject" button above.</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                {editingCategory ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetCategoryForm}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {showSubjectForm && (
          <form onSubmit={handleSubjectSubmit} className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Add New Subject</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Subject name"
                value={subjectFormData.name}
                onChange={(e) => setSubjectFormData({...subjectFormData, name: e.target.value})}
                className="px-3 py-2 border rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={subjectFormData.description}
                onChange={(e) => setSubjectFormData({...subjectFormData, description: e.target.value})}
                className="px-3 py-2 border rounded-md"
              />
              <select
                value={subjectFormData.category}
                onChange={(e) => setSubjectFormData({...subjectFormData, category: e.target.value})}
                className="px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2 mt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                Add Subject
              </button>
              <button
                type="button"
                onClick={() => setShowSubjectForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {categories.map(category => (
            <div key={category._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
                <p className="text-xs text-gray-500">
                  Subjects: {category.subjects?.length || 0}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => editCategory(category)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCategory(category._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminCategories
