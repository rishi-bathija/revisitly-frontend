import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';
import { addBookmark } from '../utils/api';

const AddBookmark = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(location.search);

  const [formData, setFormData] = useState({
    url: params.get('url') || '',
    title: params.get('title') || '',
    tag: params.get('tag') || '',
    remindAt: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let remindAtUTC = formData.remindAt
        ? new Date(new Date(formData.remindAt).getTime() - IST_OFFSET).toISOString()
        : '';

      const bookmarkData = {
        ...formData,
        remindAt: remindAtUTC,
        tag: formData.tag ? formData.tag.split(',').map(tag => tag.trim()) : []
      };

      const data = await addBookmark(bookmarkData);

      if (data.success) {
        setSuccess('Bookmark added successfully!');
        setFormData({
          url: '',
          title: '',
          tag: '',
          remindAt: ''
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Failed to add bookmark');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const IST_OFFSET = 5.5 * 60 * 60 * 1000;

  const getISTISOString = (date) => {
    const ist = new Date(date.getTime() + IST_OFFSET);
    return ist.toISOString().slice(0, 16);
  }

  const getDefaultReminderTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 24); // Default to tomorrow
    return getISTISOString(now);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Bookmark</h1>
          <p className="text-gray-600 mt-1">Save and organize your important content</p>
        </div>
      </div>

      <div className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Field */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="url"
              name="url"
              required
              value={formData.url}
              onChange={handleInputChange}
              className="input-field"
              placeholder="https://example.com"
            />
          </div>

          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter a title for this bookmark"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to auto-fetch from the URL
            </p>
          </div>

          {/* Tags Field */}
          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              id="tag"
              name="tag"
              value={formData.tag}
              onChange={handleInputChange}
              className="input-field"
              placeholder="work, important, tutorial (comma separated)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Reminder Field */}
          <div>
            <label htmlFor="remindAt" className="block text-sm font-medium text-gray-700 mb-2">
              Set Reminder
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="datetime-local"
                id="remindAt"
                name="remindAt"
                value={formData.remindAt}
                onChange={handleInputChange}
                min={getISTISOString(new Date())}
                className="input-field pl-10"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              When would you like to be reminded about this bookmark?
            </p>
          </div>

          {/* Quick Reminder Options */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, remindAt: getDefaultReminderTime() })}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                setFormData({ ...formData, remindAt: nextWeek.toISOString().slice(0, 16) });
              }}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              Next Week
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, remindAt: '' })}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              No Reminder
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Bookmark</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Better Bookmarking</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Add descriptive titles to easily find your bookmarks later</li>
          <li>• Use tags to organize content by topic or project</li>
          <li>• Set reminders for time-sensitive content or follow-ups</li>
          <li>• You can always edit or delete bookmarks from your dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default AddBookmark; 