import React, { useState, useEffect, useContext } from 'react';
import { 
  FileText, 
  User as UserIcon, 
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
  Send,
  Trash2,
  Edit3
} from 'lucide-react';
import type { Post, User } from '../api';
import { postApi, userApi } from '../api';
import { ToastContext } from './Toast';
import './Posts.css';

const Posts: React.FC = () => {
  const toastContext = useContext(ToastContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    userId: ''
  });
  
  // State for likes and comments
  const [postLikes, setPostLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({});
  const [postComments, setPostComments] = useState<Record<string, { count: number; comments: Array<{ id: string; author: string; text: string; timestamp: string }> }>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  
  // State for post menu dropdowns
  const [showPostMenu, setShowPostMenu] = useState<Record<string, boolean>>({});
  
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Record<string, boolean>>({});
  
  // State for edit functionality
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Don't close menus if clicking inside post actions container or edit form modal
      if (!target.closest('.post-actions-container') && !target.closest('.linkedin-form-modal')) {
        closeAllMenus();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
        resetForm();
        resetEditForm();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a minimum loading time promise (1 second)
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
      
      // Run API calls and minimum loading time in parallel
      const [postsData, usersData] = await Promise.all([
        postApi.getAll(),
        userApi.getAll(),
        minLoadingTime
      ]);
      
      setPosts(postsData);
      setUsers(usersData);
      
      // Initialize likes and comments for each post
      const likesData: Record<string, { count: number; isLiked: boolean }> = {};
      const commentsData: Record<string, { count: number; comments: Array<{ id: string; author: string; text: string; timestamp: string }> }> = {};
      
      postsData.forEach((post) => {
        likesData[post.id.toString()] = { count: Math.floor(Math.random() * 50) + 1, isLiked: false };
        commentsData[post.id.toString()] = { 
          count: Math.floor(Math.random() * 10), 
          comments: [] 
        };
      });
      
      setPostLikes(likesData);
      setPostComments(commentsData);
    } catch (err) {
      const errorMessage = 'Failed to load posts';
      setError(errorMessage);
      toastContext?.showToast(errorMessage, 'error');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (formData.title.length < 3) {
      toastContext?.showToast('Title must be at least 3 characters long', 'error');
      return;
    }
    
    if (formData.title.length > 200) {
      toastContext?.showToast('Title must be less than 200 characters', 'error');
      return;
    }
    
    if (formData.content.length < 10) {
      toastContext?.showToast('Content must be at least 10 characters long', 'error');
      return;
    }
    
    if (formData.content.length > 2000) {
      toastContext?.showToast('Content must be less than 2000 characters', 'error');
      return;
    }
    
    if (!formData.userId) {
      toastContext?.showToast('Please select an author', 'error');
      return;
    }
    
    try {
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        userId: formData.userId
      };

      console.log('Attempting to create post with data:', postData);
      await postApi.create(postData);
      toastContext?.showToast('Post created successfully!', 'success');
      setFormData({ title: '', content: '', userId: '' });
      setShowForm(false);
      loadData();
    } catch (err: any) {
      console.error('Error creating post:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to create post';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toastContext?.showToast(errorMessage, 'error');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', userId: '' });
    setShowForm(false);
  };

  const handleLike = (postId: string) => {
    setPostLikes(prev => ({
      ...prev,
      [postId]: {
        count: prev[postId]?.isLiked 
          ? prev[postId].count - 1 
          : (prev[postId]?.count || 0) + 1,
        isLiked: !prev[postId]?.isLiked
      }
    }));
  };

  const handleCommentToggle = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    const newComment = {
      id: Date.now().toString(),
      author: 'You', // In a real app, this would be the current user
      text,
      timestamp: new Date().toISOString()
    };

    setPostComments(prev => ({
      ...prev,
      [postId]: {
        count: (prev[postId]?.count || 0) + 1,
        comments: [...(prev[postId]?.comments || []), newComment]
      }
    }));

    setCommentText(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

  const handleCommentTextChange = (postId: string, text: string) => {
    setCommentText(prev => ({
      ...prev,
      [postId]: text
    }));
  };
  
  const handleDeletePost = async (postId: string) => {
    try {
      await postApi.delete(postId);
      toastContext?.showToast('Post deleted successfully!', 'success');
      loadData(); // Reload posts after deletion
      setShowPostMenu(prev => ({ ...prev, [postId]: false })); // Close menu
      setShowDeleteConfirm(prev => ({ ...prev, [postId]: false })); // Close confirmation
    } catch (err: any) {
      console.error('Error deleting post:', err);
      let errorMessage = 'Failed to delete post';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      toastContext?.showToast(errorMessage, 'error');
    }
  };
  
  const togglePostMenu = (postId: string) => {
    setShowPostMenu(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };
  
  const closeAllMenus = () => {
    setShowPostMenu({});
    setShowDeleteConfirm({});
    // Don't close edit form here - it should be closed explicitly
  };
  
  const closeAllModals = () => {
    setShowPostMenu({});
    setShowDeleteConfirm({});
    setShowEditForm(false);
  };
  
  const handleDeleteConfirmation = (postId: string) => {
    setShowDeleteConfirm(prev => ({ ...prev, [postId]: true }));
    setShowPostMenu(prev => ({ ...prev, [postId]: false }));
  };
  
  const cancelDelete = (postId: string) => {
    setShowDeleteConfirm(prev => ({ ...prev, [postId]: false }));
  };
  
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditFormData({
      title: post.title,
      content: post.content
    });
    setShowEditForm(true);
    setShowPostMenu(prev => ({ ...prev, [post.id.toString()]: false })); // Close menu
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPost) return;
    
    // Frontend validation
    if (editFormData.title.length < 3) {
      toastContext?.showToast('Title must be at least 3 characters long', 'error');
      return;
    }
    
    if (editFormData.title.length > 200) {
      toastContext?.showToast('Title must be less than 200 characters', 'error');
      return;
    }
    
    if (editFormData.content.length < 10) {
      toastContext?.showToast('Content must be at least 10 characters long', 'error');
      return;
    }
    
    if (editFormData.content.length > 2000) {
      toastContext?.showToast('Content must be less than 2000 characters', 'error');
      return;
    }
    
    try {
      setIsEditing(true);
      await postApi.update(editingPost.id.toString(), {
        title: editFormData.title.trim(),
        content: editFormData.content.trim()
      });
      toastContext?.showToast('Post updated successfully!', 'success');
      setShowEditForm(false);
      setEditingPost(null);
      setEditFormData({ title: '', content: '' });
      loadData(); // Reload posts after update
    } catch (err: any) {
      console.error('Error updating post:', err);
      let errorMessage = 'Failed to update post';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      toastContext?.showToast(errorMessage, 'error');
    } finally {
      setIsEditing(false);
    }
  };
  
  const resetEditForm = () => {
    setEditFormData({ title: '', content: '' });
    setShowEditForm(false);
    setEditingPost(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="linkedin-posts-container">
        <div className="posts-loading-container">
          <div className="posts-loading-content">
            <div className="loading-icon-container">
              <FileText className="loading-main-icon" size={48} />
              <div className="loading-spinner-ring">
                <div className="spinner-ring"></div>
                <div className="spinner-ring spinner-ring-delay-1"></div>
                <div className="spinner-ring spinner-ring-delay-2"></div>
              </div>
            </div>
            <div className="loading-text-container">
              <h3 className="loading-title">Loading Posts</h3>
              <p className="loading-subtitle">Fetching the latest content...</p>
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="linkedin-posts-container">
      <div className="linkedin-posts-header">
        <div className="create-post-section">
          <div className="create-post-input" onClick={() => setShowForm(true)}>
            <div className="user-avatar-small">
              <UserIcon size={20} />
            </div>
            <div className="create-post-placeholder">
              Share your thoughts with the community...
            </div>
          </div>
          <div className="create-post-actions">
            <button 
              className="create-action-btn"
              onClick={() => setShowForm(true)}
              disabled={users.length === 0}
            >
              <FileText size={18} />
              <span>Write article</span>
            </button>
          </div>
        </div>
      </div>

      {users.length === 0 && (
        <div className="warning-message">
          No users available. Please create users first to add posts.
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="linkedin-form-overlay">
          <div className="linkedin-form-modal">
            <div className="linkedin-form-header">
              <div className="form-header-content">
                <h3 className="form-title">Create a post</h3>
                <p className="form-subtitle">Share your thoughts with the community</p>
              </div>
              <button className="close-btn" onClick={resetForm} title="Close">
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="linkedin-form-author">
                <div className="author-avatar-form">
                  <UserIcon size={32} />
                </div>
                <div className="author-selection">
                  <label htmlFor="author-select" className="author-label">
                    Post as:
                  </label>
                  <select
                    id="author-select"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    required
                    className="author-select"
                  >
                    <option value="">Select author</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="linkedin-form-content">
                <div className="form-field">
                  <label htmlFor="post-title" className="field-label">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    minLength={3}
                    maxLength={200}
                    placeholder="What would you like to talk about?"
                    className="post-title-input"
                  />
                  <div className="character-count">
                    <span className={formData.title.length > 200 ? 'over-limit' : ''}>
                      {formData.title.length}/200
                    </span>
                  </div>
                </div>
                
                <div className="form-field">
                  <label htmlFor="post-content" className="field-label">
                    Content <span className="required">*</span>
                  </label>
                  <textarea
                    id="post-content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={6}
                    placeholder="Share your thoughts, insights, or updates..."
                    className="post-content-input"
                  />
                  <div className="character-count">
                    <span className={formData.content.length > 2000 ? 'over-limit' : ''}>
                      {formData.content.length}/2000
                    </span>
                  </div>
                </div>
                
                {/* Enhanced validation messages */}
                <div className="form-validation-info">
                  <div className="validation-grid">
                    <div className="validation-item">
                      <div className={`validation-indicator ${formData.title.length >= 3 && formData.title.length <= 200 ? 'valid' : 'invalid'}`}>
                        {formData.title.length >= 3 && formData.title.length <= 200 ? '✓' : '!'}
                      </div>
                      <span className={`validation-text ${formData.title.length >= 3 && formData.title.length <= 200 ? 'valid' : 'invalid'}`}>
                        Title: {formData.title.length >= 3 ? 'Good length' : 'Too short (min 3 chars)'}
                      </span>
                    </div>
                    <div className="validation-item">
                      <div className={`validation-indicator ${formData.content.length >= 10 && formData.content.length <= 2000 ? 'valid' : 'invalid'}`}>
                        {formData.content.length >= 10 && formData.content.length <= 2000 ? '✓' : '!'}
                      </div>
                      <span className={`validation-text ${formData.content.length >= 10 && formData.content.length <= 2000 ? 'valid' : 'invalid'}`}>
                        Content: {formData.content.length >= 10 ? 'Good length' : 'Too short (min 10 chars)'}
                      </span>
                    </div>
                    <div className="validation-item">
                      <div className={`validation-indicator ${formData.userId ? 'valid' : 'invalid'}`}>
                        {formData.userId ? '✓' : '!'}
                      </div>
                      <span className={`validation-text ${formData.userId ? 'valid' : 'invalid'}`}>
                        Author: {formData.userId ? 'Selected' : 'Please select an author'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="linkedin-form-actions">
                <div className="post-options">
                  <div className="post-visibility-option">
                    <Globe size={16} />
                    <span>Anyone can see this post</span>
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="button" className="btn-cancel" onClick={resetForm}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`btn-post ${
                      formData.title.length >= 3 && 
                      formData.title.length <= 200 &&
                      formData.content.length >= 10 && 
                      formData.content.length <= 2000 &&
                      formData.userId
                        ? 'enabled' : 'disabled'
                    }`}
                    disabled={
                      formData.title.length < 3 || 
                      formData.title.length > 200 ||
                      formData.content.length < 10 || 
                      formData.content.length > 2000 ||
                      !formData.userId
                    }
                  >
                    <Send size={16} />
                    Post
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Form Modal */}
      {showEditForm && editingPost && (
        <div className="linkedin-form-overlay">
          <div className="linkedin-form-modal">
            <div className="linkedin-form-header">
              <div className="form-header-content">
                <h3 className="form-title">Edit post</h3>
                <p className="form-subtitle">Update your thoughts and content</p>
              </div>
              <button className="close-btn" onClick={resetEditForm} title="Close">
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="linkedin-form-author">
                <div className="author-avatar-form">
                  {editingPost.user?.name ? editingPost.user.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 'UN'}
                </div>
                <div className="author-selection">
                  <span className="author-label">Editing as:</span>
                  <div className="author-name-display">
                    {editingPost.user?.name || 'Unknown'} ({editingPost.user?.email || 'unknown@email.com'})
                  </div>
                </div>
              </div>
              
              <div className="linkedin-form-content">
                <div className="form-field">
                  <label htmlFor="edit-post-title" className="field-label">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    id="edit-post-title"
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                    minLength={3}
                    maxLength={200}
                    placeholder="What would you like to talk about?"
                    className="post-title-input"
                  />
                  <div className="character-count">
                    <span className={editFormData.title.length > 200 ? 'over-limit' : ''}>
                      {editFormData.title.length}/200
                    </span>
                  </div>
                </div>
                
                <div className="form-field">
                  <label htmlFor="edit-post-content" className="field-label">
                    Content <span className="required">*</span>
                  </label>
                  <textarea
                    id="edit-post-content"
                    value={editFormData.content}
                    onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={6}
                    placeholder="Share your thoughts, insights, or updates..."
                    className="post-content-input"
                  />
                  <div className="character-count">
                    <span className={editFormData.content.length > 2000 ? 'over-limit' : ''}>
                      {editFormData.content.length}/2000
                    </span>
                  </div>
                </div>
                
                {/* Enhanced validation messages */}
                <div className="form-validation-info">
                  <div className="validation-grid">
                    <div className="validation-item">
                      <div className={`validation-indicator ${editFormData.title.length >= 3 && editFormData.title.length <= 200 ? 'valid' : 'invalid'}`}>
                        {editFormData.title.length >= 3 && editFormData.title.length <= 200 ? '✓' : '!'}
                      </div>
                      <span className={`validation-text ${editFormData.title.length >= 3 && editFormData.title.length <= 200 ? 'valid' : 'invalid'}`}>
                        Title: {editFormData.title.length >= 3 ? 'Good length' : 'Too short (min 3 chars)'}
                      </span>
                    </div>
                    <div className="validation-item">
                      <div className={`validation-indicator ${editFormData.content.length >= 10 && editFormData.content.length <= 2000 ? 'valid' : 'invalid'}`}>
                        {editFormData.content.length >= 10 && editFormData.content.length <= 2000 ? '✓' : '!'}
                      </div>
                      <span className={`validation-text ${editFormData.content.length >= 10 && editFormData.content.length <= 2000 ? 'valid' : 'invalid'}`}>
                        Content: {editFormData.content.length >= 10 ? 'Good length' : 'Too short (min 10 chars)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="linkedin-form-actions">
                <div className="post-options">
                  <div className="post-visibility-option">
                    <Globe size={16} />
                    <span>Anyone can see this post</span>
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="button" className="btn-cancel" onClick={resetEditForm}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={`btn-post ${
                      editFormData.title.length >= 3 && 
                      editFormData.title.length <= 200 &&
                      editFormData.content.length >= 10 && 
                      editFormData.content.length <= 2000
                        ? 'enabled' : 'disabled'
                    }`}
                    disabled={
                      editFormData.title.length < 3 || 
                      editFormData.title.length > 200 ||
                      editFormData.content.length < 10 || 
                      editFormData.content.length > 2000 ||
                      isEditing
                    }
                  >
                    <Send size={16} />
                    {isEditing ? 'Updating...' : 'Update Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="linkedin-posts-feed">
        {posts.length === 0 ? (
          <div className="no-data">No posts found</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="linkedin-post-card">
              {/* Post Header */}
              <div className="linkedin-post-header">
                <div className="author-info">
                  <div className="author-avatar">
                    {getInitials(post.user?.name || 'Unknown')}
                  </div>
                  <div className="author-details">
                    <h4 className="author-name">{post.user?.name || 'Unknown'}</h4>
                    <p className="author-subtitle">Professional • {post.user?.age} years old</p>
                    <div className="post-time">
                      <span>{formatDate(post.createdAt)}</span>
                      <Globe size={12} className="visibility-icon" />
                      {post.updatedAt && post.updatedAt !== post.createdAt && (
                        <span className="edited-indicator" title="This post has been edited">
                          • Edited
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="post-actions-container">
                  <button 
                    className="post-menu-btn"
                    onClick={() => togglePostMenu(post.id.toString())}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  
                  {/* Post Menu Dropdown */}
                  {showPostMenu[post.id.toString()] && (
                    <div className="post-menu-dropdown">
                      <button 
                        className="menu-item"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit3 size={16} />
                        <span>Edit post</span>
                      </button>
                      <button 
                        className="menu-item delete-item"
                        onClick={() => handleDeleteConfirmation(post.id.toString())}
                      >
                        <Trash2 size={16} />
                        <span>Delete post</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Delete Confirmation Modal */}
                  {showDeleteConfirm[post.id.toString()] && (
                    <div className="delete-confirmation-overlay">
                      <div className="delete-confirmation-modal">
                        <div className="delete-modal-header">
                          <h3>Delete post?</h3>
                        </div>
                        <div className="delete-modal-content">
                          <p>This action cannot be undone. Are you sure you want to delete this post?</p>
                          <div className="post-preview">
                            <strong>"{post.title}"</strong>
                          </div>
                        </div>
                        <div className="delete-modal-actions">
                          <button 
                            className="btn-cancel"
                            onClick={() => cancelDelete(post.id.toString())}
                          >
                            Cancel
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeletePost(post.id.toString())}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="linkedin-post-content">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-text">{post.content}</p>
              </div>

              {/* Post Engagement */}
              <div className="linkedin-post-engagement">
                <div className="engagement-stats">
                  <span className="likes-count">
                    {postLikes[post.id.toString()]?.count > 0 && (
                      <>👍 {postLikes[post.id.toString()]?.count}</>
                    )}
                    {postLikes[post.id.toString()]?.count > 0 && postComments[post.id.toString()]?.count > 0 && ' • '}
                    {postComments[post.id.toString()]?.count > 0 && (
                      <>{postComments[post.id.toString()]?.count} comment{postComments[post.id.toString()]?.count !== 1 ? 's' : ''}</>
                    )}
                  </span>
                </div>
                
                <div className="engagement-actions">
                  <button 
                    className={`engagement-btn ${postLikes[post.id.toString()]?.isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id.toString())}
                  >
                    <Heart size={18} fill={postLikes[post.id.toString()]?.isLiked ? 'currentColor' : 'none'} />
                    <span>Like</span>
                  </button>
                  <button 
                    className="engagement-btn"
                    onClick={() => handleCommentToggle(post.id.toString())}
                  >
                    <MessageCircle size={18} />
                    <span>Comment</span>
                  </button>
                  <button className="engagement-btn">
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post.id.toString()] && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {postComments[post.id.toString()]?.comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-avatar">
                            <UserIcon size={16} />
                          </div>
                          <div className="comment-content">
                            <div className="comment-bubble">
                              <span className="comment-author">{comment.author}</span>
                              <p className="comment-text">{comment.text}</p>
                            </div>
                            <div className="comment-actions">
                              <span className="comment-time">{formatDate(comment.timestamp)}</span>
                              <button className="comment-action-btn">Like</button>
                              <button className="comment-action-btn">Reply</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="comment-input-section">
                      <div className="comment-input-avatar">
                        <UserIcon size={20} />
                      </div>
                      <div className="comment-input-container">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentText[post.id.toString()] || ''}
                          onChange={(e) => handleCommentTextChange(post.id.toString(), e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCommentSubmit(post.id.toString());
                            }
                          }}
                          className="comment-input"
                        />
                        <button
                          onClick={() => handleCommentSubmit(post.id.toString())}
                          disabled={!commentText[post.id.toString()]?.trim()}
                          className="comment-submit-btn"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Posts;
