import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Clock, Edit, Repeat, Bell } from 'lucide-react';
import { addBookmark, getBookmarkById, updateBookmark, updateReminderFromEmail } from '../utils/api';

const AddBookmark = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(location.search);

  // Helper function to convert UTC datetime to local datetime-local format
  const utcToLocalDatetime = (utcString) => {
    if (!utcString) return '';
    const date = new Date(utcString);
    // Get local time components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to convert local datetime-local to UTC ISO string
  const localDatetimeToUTC = (localDatetime) => {
    if (!localDatetime) return '';
    // Create date object from local datetime string
    // This preserves the local timezone
    const date = new Date(localDatetime);
    return date.toISOString();
  };

  // Helper to get current local datetime in `yyyy-MM-ddTHH:mm` format for `min` attr
  const getLocalNowForMin = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    url: params.get('url') || '',
    title: params.get('title') || '',
    tag: params.get('tag') || '',
    // Convert UTC from params to local datetime for display
    remindAt: params.get('remindAt')
      ? utcToLocalDatetime(params.get('remindAt'))
      : '',
    repeatType: 'none',
    smartFollowUpEnabled: false,
    smartFollowUpDays: 3,
  });

  const bookmarkId = params.get('id');
  const mode = params.get('mode');

  const isRemindMode = mode === 'remind';
  const isEditMode = mode === 'edit';
  const isNewBookmark = !bookmarkId;

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  useEffect(() => {
    const fetchBookmark = async () => {
      if (
        bookmarkId &&
        (isRemindMode || isEditMode)
      ) {
        try {
          console.log('fetchbookmark called');

          const res = await getBookmarkById(bookmarkId);

          if (res.success) {
            const b = res.bookmark;

            setFormData({
              url: b.url || '',
              title: b.title || '',
              tag: b.tag?.join(',') || '',
              remindAt: b.remindAt ? utcToLocalDatetime(b.remindAt) : '',
              repeatType: b.repeatType || 'none',
              smartFollowUpEnabled: b.smartFollowUp?.enabled || false,
              smartFollowUpDays: b.smartFollowUp?.daysDelay || 3,
            });
          }
        } catch (err) {
          setError("Failed to load bookmark details");
        }
      }
    };

    fetchBookmark();
  }, [bookmarkId, isRemindMode, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert local datetime to UTC ISO string for backend
      // Validate remindAt is not in the past (when provided)
      if (formData.remindAt) {
        const selected = new Date(formData.remindAt);
        const now = new Date();
        if (selected <= now) {
          setError('Reminder time must be in the future.');
          setLoading(false);
          return;
        }
      }

      let remindAtUTC = formData.remindAt ? localDatetimeToUTC(formData.remindAt) : '';

      let bookmarkData;
      let data;

      if (isNewBookmark) {
        bookmarkData = {
          url: formData.url,
          title: formData.title,
          tag: formData.tag ? formData.tag.split(',').map(tag => tag.trim()) : [],
          remindAt: remindAtUTC,
          repeatType: formData.repeatType,
          smartFollowUp: {
            enabled: formData.smartFollowUpEnabled,
            daysDelay: parseInt(formData.smartFollowUpDays) || 3
          }
        };
        data = await addBookmark(bookmarkData);
      } else if (isRemindMode) {
        data = await updateBookmark(bookmarkId, { remindAt: remindAtUTC });
      } else if (isEditMode) {
        bookmarkData = {
          url: formData.url,
          title: formData.title,
          tag: formData.tag ? formData.tag.split(',').map(tag => tag.trim()) : [],
          remindAt: remindAtUTC,
          repeatType: formData.repeatType,
          smartFollowUp: {
            enabled: formData.smartFollowUpEnabled,
            daysDelay: parseInt(formData.smartFollowUpDays) || 3
          }
        };
        data = await updateBookmark(bookmarkId, bookmarkData);
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
            remindAt: '',
            repeatType: 'none',
            smartFollowUpEnabled: false,
            smartFollowUpDays: 3,
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
    // Return in local datetime format
    return utcToLocalDatetime(now.toISOString());
  };

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
                min={getLocalNowForMin()}
                className="input-field pl-10"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              When would you like to be reminded about this bookmark? (Your local time)
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
                setFormData({ ...formData, remindAt: utcToLocalDatetime(nextWeek.toISOString()) });
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

          {/* NEW: Smart Reminder Settings */}
          {formData.remindAt && !isRemindMode && (
            <div className="border-t pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Repeat className="h-5 w-5 text-primary-600" />
                  Smart Reminder Options
                </h3>

                {/* Repeat Type */}
                <div className="mb-4">
                  <label htmlFor="repeatType" className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat Reminder
                  </label>
                  <select
                    id="repeatType"
                    name="repeatType"
                    value={formData.repeatType}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="none">No repeat (one-time)</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.repeatType === 'none' && 'Reminder will be sent once'}
                    {formData.repeatType === 'daily' && 'Reminder will repeat every day'}
                    {formData.repeatType === 'weekly' && 'Reminder will repeat every week'}
                  </p>
                </div>

                {/* Smart Follow-up */}
                <div className="border-t pt-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="smartFollowUpEnabled"
                      name="smartFollowUpEnabled"
                      checked={formData.smartFollowUpEnabled}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="smartFollowUpEnabled" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Smart Follow-up
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Send an additional reminder if you don't open the bookmark
                      </p>

                      {formData.smartFollowUpEnabled && (
                        <div className="mt-3">
                          <label htmlFor="smartFollowUpDays" className="block text-sm text-gray-600 mb-1">
                            Follow-up after:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              id="smartFollowUpDays"
                              name="smartFollowUpDays"
                              min="1"
                              max="30"
                              value={formData.smartFollowUpDays}
                              onChange={handleInputChange}
                              className="input-field w-20"
                            />
                            <span className="text-sm text-gray-600">days of inactivity</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            If you don't open the bookmark within {formData.smartFollowUpDays} {formData.smartFollowUpDays === 1 ? 'day' : 'days'}, we'll send a follow-up reminder
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <li>• Use repeat reminders for daily/weekly habits or recurring content</li>
              <li>• Enable smart follow-up to ensure you don't miss important bookmarks</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AddBookmark;