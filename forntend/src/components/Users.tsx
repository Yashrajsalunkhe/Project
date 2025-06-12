import React, { useState, useEffect, useContext } from 'react';
import { Users as UsersIcon, UserPlus, Edit, Trash2, Mail, Calendar, X } from 'lucide-react';
import type { User } from '../api';
import { userApi } from '../api';
import { ToastContext } from './Toast';

const UsersComponent: React.FC = () => {
  const toastContext = useContext(ToastContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a minimum loading time promise (1 second)
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
      
      // Run API call and minimum loading time in parallel
      const [userData] = await Promise.all([
        userApi.getAll(),
        minLoadingTime
      ]);
      
      setUsers(userData);
    } catch (err) {
      const errorMessage = 'Failed to load users';
      setError(errorMessage);
      toastContext?.showToast(errorMessage, 'error');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age)
      };

      if (editingUser) {
        await userApi.update(editingUser.id, userData);
        toastContext?.showToast('User updated successfully!', 'success');
      } else {
        await userApi.create(userData);
        toastContext?.showToast('User created successfully!', 'success');
      }

      setFormData({ name: '', email: '', age: '' });
      setShowForm(false);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      const errorMessage = 'Failed to save user';
      setError(errorMessage);
      toastContext?.showToast(errorMessage, 'error');
      console.error('Error saving user:', err);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      age: user.age.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.delete(id);
        toastContext?.showToast('User deleted successfully!', 'success');
        loadUsers();
      } catch (err) {
        const errorMessage = 'Failed to delete user';
        setError(errorMessage);
        toastContext?.showToast(errorMessage, 'error');
        console.error('Error deleting user:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', age: '' });
    setShowForm(false);
    setEditingUser(null);
  };

  if (loading) {
    return (
      <div className="users-container">
        <div className="users-loading-container">
          <div className="users-loading-content">
            <div className="loading-icon-container">
              <UsersIcon className="loading-main-icon" size={48} />
              <div className="loading-spinner-ring">
                <div className="spinner-ring"></div>
                <div className="spinner-ring spinner-ring-delay-1"></div>
                <div className="spinner-ring spinner-ring-delay-2"></div>
              </div>
            </div>
            <div className="loading-text-container">
              <h3 className="loading-title">Loading Users</h3>
              <p className="loading-subtitle">Gathering user information...</p>
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
    <div className="users-container">
      <div className="users-header">
        <h2><UsersIcon className="title-icon" size={24} /> Users Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <UserPlus className="header-icon" size={16} /> Add User
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Age:</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  min="1"
                  max="120"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-grid">
        {users.length === 0 ? (
          <div className="no-data">No users found</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="user-card card">
              <div className="user-info">
                <h3>{user.name}</h3>
                <div className="user-details">
                  <p className="user-email">
                    <Mail className="card-icon" size={16} />
                    {user.email}
                  </p>
                  <p className="user-age">
                    <Calendar className="card-icon" size={16} />
                    Age: {user.age}
                  </p>
                </div>
              </div>
              <div className="user-actions">
                <button 
                  className="btn btn-edit"
                  onClick={() => handleEdit(user)}
                >
                  <Edit className="header-icon" size={14} /> Edit
                </button>
                <button 
                  className="btn btn-delete"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash2 className="header-icon" size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UsersComponent;
