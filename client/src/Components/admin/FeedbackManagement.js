import React, { useState, useEffect } from 'react';
import API_URL from '../Utils/Api';
import '../css/Feedback.css';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    rating: 'all'
  });

  useEffect(() => {
    fetchFeedbackData();
  }, [currentPage]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const [feedbackResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/api/feedback/all?page=${currentPage}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/api/feedback/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      ]);

      if (feedbackResponse.ok && statsResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        const statsData = await statsResponse.json();
        
        setFeedback(feedbackData.feedback);
        setStats(statsData);
        setTotalPages(feedbackData.pages || 1);
      } else {
        throw new Error('Failed to fetch feedback data');
      }
    } catch (error) {
      setMessage('Error fetching feedback data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(feedback.map(item =>
          item._id === feedbackId ? { ...item, status: data.feedback.status } : item
        ));
        setMessage('Feedback status updated successfully');
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to update feedback status');
      }
    } catch (error) {
      setMessage('Error updating feedback: ' + error.message);
    }
  };

  const handleReplySubmit = async (feedbackId) => {
    if (!adminReply.trim()) {
      setMessage('Please enter a reply message');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'replied', 
          adminReply: adminReply.trim() 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(feedback.map(item =>
          item._id === feedbackId ? { 
            ...item, 
            status: 'replied', 
            adminReply: adminReply.trim(),
            updatedAt: new Date().toISOString()
          } : item
        ));
        setReplyingTo(null);
        setAdminReply('');
        setMessage('Reply sent successfully');
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      setMessage('Error sending reply: ' + error.message);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      rating: 'all'
    });
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    const matchesCategory = filters.category === 'all' || item.category === filters.category;
    const matchesRating = filters.rating === 'all' || item.rating.toString() === filters.rating;

    return matchesSearch && matchesStatus && matchesCategory && matchesRating;
  });

  const uniqueStatuses = [...new Set(feedback.map(item => item.status).filter(Boolean))];
  const uniqueCategories = [...new Set(feedback.map(item => item.category).filter(Boolean))];
  const uniqueRatings = [...new Set(feedback.map(item => item.rating).filter(Boolean))].sort();

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length;

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      reviewed: '#3b82f6',
      replied: '#10b981',
      resolved: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="feedback-management-content">
      {/* Top Bar - NO BACKGROUND */}
      <div className="content-topbar">
        <div className="topbar-left">
          <div className="page-breadcrumb">
            <span className="breadcrumb-item">Dashboard</span>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-item active">Feedback Management</span>
          </div>
          <h1 className="page-title">Feedback Management</h1>
          <p className="page-subtitle">
            <span className="subtitle-dot"></span>
            Review and respond to user feedback
          </p>
        </div>
        <div className="topbar-right">
          <div className="topbar-date">
            <div className="date-icon">📅</div>
            <span>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - NO BACKGROUND */}
      <div className="management-section">
        
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-header">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search feedback by user, email, message, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="feedback-count">
              {filteredFeedback.length} feedback{filteredFeedback.length !== 1 ? ' items' : ''} found
              {searchTerm && ` for "${searchTerm}"`}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filters-container">
          <div className="filters-header">
            <h3 className="filters-title">Filters</h3>
            {activeFiltersCount > 0 && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All ({activeFiltersCount})
              </button>
            )}
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Ratings</option>
                {uniqueRatings.map(rating => (
                  <option key={rating} value={rating.toString()}>
                    {rating} Star{rating !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="active-filters">
              <span className="active-filters-label">Active filters:</span>
              {filters.status !== 'all' && (
                <span className="active-filter-tag">
                  Status: {filters.status}
                  <button onClick={() => handleFilterChange('status', 'all')}>×</button>
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="active-filter-tag">
                  Category: {filters.category}
                  <button onClick={() => handleFilterChange('category', 'all')}>×</button>
                </span>
              )}
              {filters.rating !== 'all' && (
                <span className="active-filter-tag">
                  Rating: {filters.rating} star{filters.rating !== '1' ? 's' : ''}
                  <button onClick={() => handleFilterChange('rating', 'all')}>×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="stats-grid compact">
            <div className="stat-card mini">
              <h3>Total Feedback</h3>
              <p className="stat-value">{stats.totalFeedback}</p>
            </div>
            <div className="stat-card mini">
              <h3>Average Rating</h3>
              <p className="stat-value">{stats.averageRating?.toFixed(1) || '0.0'}/5</p>
            </div>
            <div className="stat-card mini">
              <h3>Pending</h3>
              <p className="stat-value">
                {stats.statusStats?.find(s => s._id === 'pending')?.count || 0}
              </p>
            </div>
            <div className="stat-card mini">
              <h3>Replied</h3>
              <p className="stat-value">
                {stats.statusStats?.find(s => s._id === 'replied')?.count || 0}
              </p>
            </div>
          </div>
        )}

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            <span className="alert-icon">{message.includes('Error') ? '✕' : '✓'}</span>
            <span className="alert-message">{message}</span>
          </div>
        )}

        <div className="feedback-list">
          {filteredFeedback.map(item => (
            <div key={item._id} className="feedback-item">
              <div className="feedback-header">
                <div className="user-info">
                  <div className="user-avatar small">
                    {item.user?.profile ? (
                      <img src={item.user.profile} alt={item.user.username} />
                    ) : (
                      <span>{item.user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <div className="user-details">
                    <strong className="user-name">{item.user?.username || 'Unknown User'}</strong>
                    <span className="user-email">{item.user?.email}</span>
                  </div>
                </div>
                <div className="feedback-meta">
                  <span className="rating" title={`Rating: ${item.rating}/5`}>
                    {getRatingStars(item.rating)}
                  </span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {item.status}
                  </span>
                  <span className="date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="feedback-content">
                <div className="category-tag">
                  <span className="category-label">Category:</span>
                  <span className="category-value">{item.category}</span>
                </div>
                <div className="message-content">
                  <p>{item.message}</p>
                </div>
                
                {item.adminReply && (
                  <div className="admin-reply">
                    <div className="admin-reply-header">
                      <strong>Admin Reply:</strong>
                      <span className="reply-date">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p>{item.adminReply}</p>
                  </div>
                )}
              </div>

              <div className="feedback-actions">
                <select
                  value={item.status}
                  onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="replied">Replied</option>
                  <option value="resolved">Resolved</option>
                </select>

                <button
                  className="reply-btn"
                  onClick={() => {
                    setReplyingTo(item._id);
                    setAdminReply(item.adminReply || '');
                  }}
                >
                  {item.adminReply ? 'Edit Reply' : 'Reply'}
                </button>
              </div>

              {replyingTo === item._id && (
                <div className="reply-section">
                  <div className="reply-header">
                    <h4>{item.adminReply ? 'Edit Admin Reply' : 'Write Admin Reply'}</h4>
                    <p>Your reply will be visible to the user and will mark this feedback as "replied".</p>
                  </div>
                  <textarea
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    placeholder="Type your professional reply here. Be helpful and courteous..."
                    rows="4"
                    className="reply-textarea"
                  />
                  <div className="reply-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => handleReplySubmit(item._id)}
                      disabled={!adminReply.trim()}
                    >
                      {item.adminReply ? 'Update Reply' : 'Send Reply'}
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        setReplyingTo(null);
                        setAdminReply('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}

        {filteredFeedback.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>No feedback found</h3>
            <p>
              {searchTerm || activeFiltersCount > 0 
                ? 'Try adjusting your search terms or filters' 
                : 'There are no feedback submissions to display'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;