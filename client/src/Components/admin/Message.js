import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API_URL from '../Utils/Api';
import '../css/message.css';

const Message = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Helper function to get authentication token
  const getAuthToken = () => {
    const possibleTokens = ['adminToken', 'userToken', 'token'];
    for (const tokenKey of possibleTokens) {
      const token = localStorage.getItem(tokenKey);
      if (token) {
        console.log('Using token from:', tokenKey);
        return token;
      }
    }
    return null;
  };

  // Helper function to get current user ID
  const getCurrentUserId = () => {
    const possibleKeys = ['userId', 'user_id', 'id', 'userID'];
    for (const key of possibleKeys) {
      const id = localStorage.getItem(key);
      if (id) {
        console.log('Found user ID in:', key, '=', id);
        return id;
      }
    }
    return null;
  };

  useEffect(() => {
    const token = getAuthToken();
    const userId = getCurrentUserId();
    
    console.log('Current User ID:', userId);
    console.log('Auth Token:', token ? 'Present' : 'Missing');
    
    if (userId && token) {
      fetchCurrentUser();
      fetchConversations();
      fetchUsers();
    } else {
      setError('User not properly logged in. Please login again.');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch current user info
  const fetchCurrentUser = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/messages/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.authenticatedUser);
        console.log('Current user:', data.authenticatedUser);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      
      console.log('Fetching conversations...');
      
      // Updated endpoint - no need to pass currentUserId in URL
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Conversations response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Conversations data received:', data);
        setConversations(data);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Network error loading conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/messages/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users data:', data);
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      setError('');
      const token = getAuthToken();
      console.log('Fetching messages with user:', otherUserId);
      
      // Updated endpoint - only need otherUserId
      const response = await fetch(`${API_URL}/api/messages/conversation/${otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Messages response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Messages data received:', data);
        setMessages(data);
        
        // Mark messages as read
        await markAsRead(otherUserId);
      } else {
        const errorText = await response.text();
        console.error('Error fetching messages:', errorText);
        setError('Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Network error loading messages');
    }
  };

  const markAsRead = async (senderId) => {
    try {
      const token = getAuthToken();
      // Updated endpoint - only need senderId
      await fetch(`${API_URL}/api/messages/read/${senderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) {
      setError('Please select a user and enter a message');
      return;
    }

    try {
      setError('');
      const token = getAuthToken();
      console.log('Sending message to:', selectedUser._id, 'text:', newMessage);

      // Updated - no need to send senderId, backend gets it from token
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedUser._id, // Only receiverId needed now
          text: newMessage
        }),
      });

      console.log('Send message response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Message sent successfully:', data);
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        fetchConversations(); // Refresh conversations list
      } else {
        const errorData = await response.json();
        console.error('Send message error:', errorData);
        setError('Failed to send message: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Network error sending message');
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/api/messages/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const selectUser = (user) => {
    console.log('Selecting user:', user);
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
    setError('');
    fetchMessages(user._id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="role-badge admin">Admin</span>;
    } else if (role === 'user') {
      return <span className="role-badge user">User</span>;
    }
    return null;
  };

  const getDisplayName = (user) => {
    return user.username || user.email?.split('@')[0] || 'Unknown User';
  };

  const getAvatarInitial = (user) => {
    const name = getDisplayName(user);
    return name?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="messaging-container">
      {/* Header */}
      <div className="content-topbar">
        <div className="topbar-left">
          <div className="page-breadcrumb">
            <span className="breadcrumb-item">Dashboard</span>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-item active">Messages</span>
          </div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">
            <span className="subtitle-dot"></span>
            {currentUser ? `Logged in as: ${currentUser.email} (${currentUser.role})` : 'Communicate with users and team members'}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="messaging-layout">
        {/* Sidebar - Conversations List */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h3>Conversations</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="search-input"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">Loading conversations...</div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <div className="search-results-header">Search Results</div>
              {searchResults.map(user => (
                <div
                  key={user._id}
                  className="conversation-item"
                  onClick={() => selectUser(user)}
                >
                  <div className="user-avatar">
                    {user.profile ? (
                      <img src={user.profile} alt={getDisplayName(user)} />
                    ) : (
                      <span>{getAvatarInitial(user)}</span>
                    )}
                  </div>
                  <div className="conversation-info">
                    <div className="user-name">
                      {getDisplayName(user)}
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Conversations List */}
          <div className="conversations-list">
            {conversations.length === 0 && !loading ? (
              <div className="no-conversations">
                No conversations yet. Start by searching for a user.
              </div>
            ) : (
              conversations.map(conversation => (
                <div
                  key={conversation.user._id}
                  className={`conversation-item ${selectedUser?._id === conversation.user._id ? 'active' : ''}`}
                  onClick={() => selectUser(conversation.user)}
                >
                  <div className="user-avatar">
                    {conversation.user.profile ? (
                      <img src={conversation.user.profile} alt={getDisplayName(conversation.user)} />
                    ) : (
                      <span>{getAvatarInitial(conversation.user)}</span>
                    )}
                    {conversation.unread && <div className="unread-indicator"></div>}
                  </div>
                  <div className="conversation-info">
                    <div className="user-name">
                      {getDisplayName(conversation.user)}
                      {getRoleBadge(conversation.user.role)}
                    </div>
                    <div className="last-message">{conversation.lastMessage.text}</div>
                    <div className="message-time">
                      {formatTime(conversation.lastMessage.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="user-avatar">
                    {selectedUser.profile ? (
                      <img src={selectedUser.profile} alt={getDisplayName(selectedUser)} />
                    ) : (
                      <span>{getAvatarInitial(selectedUser)}</span>
                    )}
                  </div>
                  <div>
                    <div className="user-name">
                      {getDisplayName(selectedUser)}
                      {getRoleBadge(selectedUser.role)}
                    </div>
                    <div className="user-status">Online</div>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message._id}
                      className={`message ${message.senderId === getCurrentUserId() ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <div className="message-text">{message.text}</div>
                        <div className="message-time">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="message-input-form">
                <div className="input-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                    disabled={!selectedUser}
                  />
                  <button 
                    type="submit" 
                    className="send-button"
                    disabled={!newMessage.trim() || !selectedUser}
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose a user from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;