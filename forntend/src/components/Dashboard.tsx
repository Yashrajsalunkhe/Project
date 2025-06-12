import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, BarChart3, Zap, RefreshCw, Edit3, TrendingUp, ArrowRight } from 'lucide-react';
import { analyticsApi } from '../api';
import type { Analytics } from '../api';
import { ToastContext } from './Toast';

const Dashboard: React.FC = () => {
  const toastContext = useContext(ToastContext);
  const [stats, setStats] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Create a minimum loading time promise (1 second) only for initial load
      const minLoadingTime = isInitialLoad ? new Promise(resolve => setTimeout(resolve, 1000)) : Promise.resolve();
      
      // Run API call and minimum loading time in parallel
      const [analyticsData] = await Promise.all([
        analyticsApi.get(),
        minLoadingTime
      ]);
      
      setStats(analyticsData);
      if (!isInitialLoad) {
        toastContext?.showToast('Dashboard refreshed successfully!', 'success');
      }
    } catch (error) {
      toastContext?.showToast('Failed to load dashboard stats', 'error');
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const quickActions = [
    { title: 'Manage Users', icon: Users, path: '/users', description: 'Add, edit, or remove users' },
    { title: 'Create Posts', icon: Edit3, path: '/posts', description: 'Write and publish content' },
    { title: 'View Analytics', icon: TrendingUp, path: '/analytics', description: 'Track performance metrics' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div style={{
            display:'flex',
            flexDirection:"column"
        }} className="header-content">
          <h1 className="dashboard-title">
            <Zap className="title-icon" size={24} />
            <div>
                Welcome to Management Dashboard
            </div>
          </h1>
          <div className="dashboard-subtitle">
            Your central hub for managing users, content, and analytics
          </div>
        </div>
        <button 
          className="btn btn-secondary refresh-btn"
          onClick={loadStats}
          disabled={loading}
        >
          {loading ? <RefreshCw size={16} className="spinning" /> : <RefreshCw size={16} />} Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="dashboard-stats">
        {loading ? (
          <div className="dashboard-loading-container">
            <div className="dashboard-loading-content">
              <div className="loading-icon-container">
                <BarChart3 className="loading-main-icon" size={48} />
                <div className="loading-spinner-ring">
                  <div className="spinner-ring"></div>
                  <div className="spinner-ring spinner-ring-delay-1"></div>
                  <div className="spinner-ring spinner-ring-delay-2"></div>
                </div>
              </div>
              <div className="loading-text-container">
                <h3 className="loading-title">Loading Dashboard</h3>
                <p className="loading-subtitle">Gathering platform statistics...</p>
                <div className="loading-dots">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          </div>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FileText size={32} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.totalPosts}</div>
                <div className="stat-label">Total Posts</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <BarChart3 size={32} />
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.averageUserAge.toFixed(1)}</div>
                <div className="stat-label">Avg User Age</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <h2 className="actions-title">Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link key={action.path} to={action.path} className="action-card">
                <div className="action-icon">
                  <IconComponent size={24} />
                </div>
                <div className="action-content">
                  <h3 className="action-title">{action.title}</h3>
                  <p className="action-description">{action.description}</p>
                </div>
                <div className="action-arrow">
                  <ArrowRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-activity">
        <h2 className="activity-title">Getting Started</h2>
        <div className="activity-steps">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Add Users</h3>
              <p>Start by adding users to your platform</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Create Content</h3>
              <p>Let users create and publish posts</p>
            </div>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Track Analytics</h3>
              <p>Monitor engagement and growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
