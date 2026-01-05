import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ExternalLink, Trash2, Clock, Search, Filter, Edit, Bell, Repeat} from 'lucide-react';
import { getBookmarks, deleteBookmark } from '../utils/api';

const Dashboard = ({ user }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [tags, setTags] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
    const interval = setInterval(fetchBookmarks, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookmarks = async () => {
    try {
      const data = await getBookmarks();

      if (data.success) {
        setBookmarks(data.bookmarks);
        // Extract unique tags
        const allTags = data.bookmarks.flatMap(bookmark => bookmark.tag || []);
        const uniqueTags = [...new Set(allTags)];
        setTags(uniqueTags);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bookmark?')) return;

    try {
      const data = await deleteBookmark(id);

      if (data.success) {
        setBookmarks(bookmarks.filter(bookmark => bookmark._id !== id));
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = filterTag === 'all' || bookmark.tag?.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Helper to format UTC datetime to local datetime string
  const formatLocalDateTime = (utcString) => {
    if (!utcString) return '';
    const date = new Date(utcString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle "Remind Again" - only updates reminder time
  const handleRemindAgain = (bookmark) => {
    const params = new URLSearchParams();
    params.set('url', bookmark.url);
    params.set('title', bookmark.title || '');
    params.set('tag', Array.isArray(bookmark.tag) ? bookmark.tag.join(',') : '');
    params.set('id', bookmark._id);
    params.set('mode', 'remind');

    navigate(`/add-bookmark?${params.toString()}`);
  };

  // Handle "Edit Bookmark" - allows editing all fields
  const handleEditBookmark = (bookmark) => {
    const params = new URLSearchParams();
    params.set('url', bookmark.url);
    params.set('title', bookmark.title || '');
    params.set('tag', Array.isArray(bookmark.tag) ? bookmark.tag.join(',') : '');
    params.set('id', bookmark._id);
    params.set('mode', 'edit');
    params.set('remindAt', bookmark.remindAt ? new Date(bookmark.remindAt).toISOString() : '');

    navigate(`/add-bookmark?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Bookmarks</h1>
          <p className="text-gray-600 mt-2">
            You have {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/add-bookmark"
          className="btn-primary mt-4 sm:mt-0 flex items-center space-x-2 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          <span>Add Bookmark</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="relative w-full sm:w-60">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="input-field pl-10 w-full"
            >
              <option value="all">All Tags</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {bookmarks.length === 0 ? 'No bookmarks yet' : 'No bookmarks found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {bookmarks.length === 0
              ? 'Start by adding your first bookmark!'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {bookmarks.length === 0 && (
            <Link to="/add-bookmark" className="btn-primary">
              Add Your First Bookmark
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookmarks.map((bookmark) => (
            <div key={bookmark._id} className="card hover:shadow-lg transition-shadow flex flex-col h-full">
              {/* Header with title and actions */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                  {bookmark.title || 'Untitled'}
                </h3>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleEditBookmark(bookmark)}
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                    title="Edit bookmark"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBookmark(bookmark._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    title="Delete bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {bookmark.url}
              </p>

              {/* Tags */}
              {bookmark.tag && bookmark.tag.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {bookmark.tag.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer with actions and date */}
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
                  >
                    <span>Visit</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(bookmark.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Reminder status and actions */}
                {/* Reminder status and actions */}
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Main reminder status */}
                      <span
                        className={`px-2 py-1 rounded-full ${bookmark.reminded
                          ? 'bg-green-100 text-green-700'
                          : bookmark.remindAt
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        {bookmark.reminded
                          ? `✓ Sent`
                          : bookmark.remindAt
                            ? `⏰ Scheduled`
                            : 'No Reminder'
                        }
                      </span>

                      {/* NEW: Repeat badge */}
                      {bookmark.repeatType && bookmark.repeatType !== 'none' && (
                        <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Repeat className="h-3 w-3" />
                          {bookmark.repeatType.charAt(0).toUpperCase() + bookmark.repeatType.slice(1)}
                        </span>
                      )}

                      {/* NEW: Smart follow-up badge */}
                      {bookmark.smartFollowUp?.enabled && (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                          <Bell className="h-3 w-3" />
                          Follow-up ({bookmark.smartFollowUp.daysDelay}d)
                        </span>
                      )}
                    </div>

                    {/* Remind Again button */}
                    {bookmark.reminded && (
                      <button
                        onClick={() => handleRemindAgain(bookmark)}
                        className="text-primary-600 hover:text-primary-800 underline flex items-center space-x-1"
                        title="Set new reminder"
                      >
                        <Bell className="h-3 w-3" />
                        <span>Remind Again</span>
                      </button>
                    )}
                  </div>

                  {/* Show reminder time */}
                  {bookmark.remindAt && (
                    <div className="text-gray-600 text-xs">
                      {bookmark.reminded ? 'Sent at: ' : 'Scheduled for: '}
                      <span className="font-medium">
                        {formatLocalDateTime(bookmark.remindAt)}
                      </span>
                    </div>
                  )}

                  {/* NEW: Show next reminder for repeating bookmarks */}
                  {bookmark.repeatType && bookmark.repeatType !== 'none' && bookmark.remindAt && (
                    <div className="text-gray-500 text-xs italic">
                      Next: {formatLocalDateTime(bookmark.remindAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;