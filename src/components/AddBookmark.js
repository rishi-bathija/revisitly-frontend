import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Clock, Edit } from 'lucide-react';
import { addBookmark, updateBookmark } from '../utils/api';
import { getISTISOString } from '../utils/utctoist';

const AddBookmark = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(location.search);

  console.log('params at addbookmark', params);

  // Fix the form initialization - handle remindAt properly
  const [formData, setFormData] = useState({
    url: params.get('url') || '',
    title: params.get('title') || '',
    tag: params.get('tag') || '',
    // Fix: Convert UTC to local datetime-local format for display
    remindAt: params.get('remindAt')
      ? new Date(params.get('remindAt')).toISOString().slice(0, 16)
      : ''
  });

  console.log('formData', formData);

  const bookmarkId = params.get('id');
  const mode = params.get('mode'); // 'remind' or 'edit'

  const isRemindMode = mode === 'remind';
  const isEditMode = mode === 'edit';
  const isNewBookmark = !bookmarkId;

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
      // Fix: Only convert to UTC when we have a datetime value
      let remindAtUTC = formData.remindAt ? new Date(formData.remindAt).toISOString() : '';

      let bookmarkData;
      let data;

      if (isNewBookmark) {
        // Adding new bookmark
        bookmarkData = {
          ...formData,
          remindAt: remindAtUTC,
          tag: formData.tag ? formData.tag.split(',').map(tag => tag.trim()) : []
        };
        data = await addBookmark(bookmarkData);
      } else if (isRemindMode) {
        // Remind mode - only update reminder
        bookmarkData = {
          remindAt: remindAtUTC
        };
        data = await updateBookmark(bookmarkId, bookmarkData);
      } else if (isEditMode) {
        console.log('inside isedit');

        // Fix: Remove the double conversion - formData.remindAt is already in local format
        // Just convert directly to UTC for sending to server
        console.log('remindAtUTC for edit mode', remindAtUTC);

        bookmarkData = {
          url: formData.url,
          title: formData.title,
          tag: formData.tag ? formData.tag.split(',').map(tag => tag.trim()) : [],
          remindAt: remindAtUTC // Use UTC directly, no double conversion
        };
        console.log('edit mode bookmarkdata', bookmarkData, bookmarkId);

        data = await updateBookmark(bookmarkId, bookmarkData);
        console.log('data', data);
      }

      if (data.success) {
        let successMessage;
        if (isNewBookmark) {
          successMessage = 'Bookmark added successfully!';
        } else if (isRemindMode) {
          successMessage = 'Reminder updated successfully!';
        } else {
          successMessage = 'Bookmark updated successfully!';
        }

        setSuccess(successMessage);

        if (isNewBookmark) {
          setFormData({
            url: '',
            title: '',
            tag: '',
            remindAt: ''
          });
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultReminderTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 24); // Default to tomorrow
    // Return in datetime-local format
    return now.toISOString().slice(0, 16);
  };

  // Get page title and description based on mode
  const getPageContent = () => {
    if (isNewBookmark) {
      return {
        title: 'Add New Bookmark',
        description: 'Save and organize your important content',
        icon: <Plus className="h-6 w-6" />
      };
    } else if (isRemindMode) {
      return {
        title: 'Update Reminder',
        description: 'Set a new reminder time for your bookmark',
        icon: <Clock className="h-6 w-6" />
      };
    } else {
      return {
        title: 'Edit Bookmark',
        description: 'Update your bookmark details',
        icon: <Edit className="h-6 w-6" />
      };
    }
  };

  const pageContent = getPageContent();

  console.log('formdata.remindAt', formData.remindAt);

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
        <div className="flex items-center space-x-3">
          {pageContent.icon}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {pageContent.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {pageContent.description}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        {/* Mode-specific notice */}
        {isRemindMode && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <Clock className="h-5 w-5" />
              <div>
                <p className="font-medium">Updating reminder for existing bookmark</p>
                <p className="text-sm text-blue-600">Only the reminder time can be changed. Other details remain the same.</p>
              </div>
            </div>
          </div>
        )}

        {isEditMode && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2 text-amber-800">
              <Edit className="h-5 w-5" />
              <div>
                <p className="font-medium">Editing bookmark details</p>
                <p className="text-sm text-amber-600">You can update any field. URL changes are not recommended as it creates a different bookmark.</p>
              </div>
            </div>
          </div>
        )}

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
              disabled={isRemindMode}
              className={`input-field ${isRemindMode ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              placeholder="https://example.com"
            />
            {isRemindMode && (
              <p className="text-sm text-gray-400 mt-1">
                URL cannot be changed when updating reminder
              </p>
            )}
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
              disabled={isRemindMode}
              className={`input-field ${isRemindMode ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              placeholder="Enter a title for this bookmark"
            />
            {isRemindMode ? (
              <p className="text-sm text-gray-400 mt-1">
                Title cannot be changed when updating reminder
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to auto-fetch from the URL
              </p>
            )}
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
              disabled={isRemindMode}
              className={`input-field ${isRemindMode ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              placeholder="work, important, tutorial (comma separated)"
            />
            {isRemindMode ? (
              <p className="text-sm text-gray-400 mt-1">
                Tags cannot be changed when updating reminder
              </p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple tags with commas
              </p>
            )}
          </div>

          {/* Reminder Field */}
          <div>
            <label htmlFor="remindAt" className="block text-sm font-medium text-gray-700 mb-2">
              {isRemindMode ? 'Update Reminder' : 'Set Reminder'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="datetime-local"
                id="remindAt"
                name="remindAt"
                value={formData.remindAt}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
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
                  <span>
                    {isNewBookmark ? 'Adding...' : isRemindMode ? 'Updating Reminder...' : 'Updating...'}
                  </span>
                </>
              ) : (
                <>
                  {isNewBookmark ? (
                    <><Plus className="h-4 w-4" /><span>Add Bookmark</span></>
                  ) : isRemindMode ? (
                    <><Clock className="h-4 w-4" /><span>Update Reminder</span></>
                  ) : (
                    <><Edit className="h-4 w-4" /><span>Update Bookmark</span></>
                  )}
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
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 {isRemindMode ? 'Reminder Tips' : isEditMode ? 'Editing Tips' : 'Tips for Better Bookmarking'}
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {isRemindMode ? (
            <>
              <li>• Set a specific time when you'll be available to check the bookmark</li>
              <li>• Consider your schedule and workload when setting reminder times</li>
              <li>• You can always come back and reschedule if needed</li>
            </>
          ) : isEditMode ? (
            <>
              <li>• Be careful when changing URLs as it essentially creates a different bookmark</li>
              <li>• Update tags to keep your bookmarks well organized</li>
              <li>• Adjust reminder times based on the content's relevance timeline</li>
            </>
          ) : (
            <>
              <li>• Add descriptive titles to easily find your bookmarks later</li>
              <li>• Use tags to organize content by topic or project</li>
              <li>• Set reminders for time-sensitive content or follow-ups</li>
              <li>• You can always edit or delete bookmarks from your dashboard</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AddBookmark;