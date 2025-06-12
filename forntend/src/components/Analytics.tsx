import React, { useState, useEffect, useContext } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  RefreshCw, 
  TrendingUp, 
  Edit3, 
  Rocket, 
  UserCheck, 
  Award,
  Target,
  Activity,
  Crown
} from 'lucide-react';
import type { Analytics as AnalyticsType, User } from '../api';
import { analyticsApi, userApi } from '../api';
import { ToastContext } from './Toast';
import './Analytics.css';

const Analytics: React.FC = () => {
  const toastContext = useContext(ToastContext);
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a minimum loading time promise (1 second)
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
      
      // Run API calls and minimum loading time in parallel
      const [analyticsData, usersData] = await Promise.all([
        analyticsApi.get(),
        userApi.getAll(),
        minLoadingTime
      ]);
      
      setAnalytics(analyticsData);
      setUsers(usersData);
    } catch (err) {
      const errorMessage = 'Failed to load analytics';
      setError(errorMessage);
      toastContext?.showToast(errorMessage, 'error');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="analytics-loading-container">
          <div className="analytics-loading-content">
            <div className="loading-icon-container">
              <BarChart3 className="loading-main-icon" size={48} />
              <div className="loading-spinner-ring">
                <div className="spinner-ring"></div>
                <div className="spinner-ring spinner-ring-delay-1"></div>
                <div className="spinner-ring spinner-ring-delay-2"></div>
              </div>
            </div>
            <div className="loading-text-container">
              <h3 className="loading-title">Loading Analytics</h3>
              <p className="loading-subtitle">Analyzing your platform data...</p>
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

  if (error) {
    return (
      <div className="analytics-container">
        <h2>Analytics</h2>
        <div className="error-message">
          {error}
          <button onClick={loadAnalytics}>Retry</button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-container">
        <h2>Analytics</h2>
        <div className="no-data">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>
          <BarChart3 className="header-icon" size={20} />
          Platform Analytics
        </h2>
        <button className="btn btn-secondary" onClick={loadAnalytics}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card card">
          <div className="card-icon">
            <Users size={32} />
          </div>
          <div className="card-content">
            <h3>{analytics.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="analytics-card card">
          <div className="card-icon">
            <FileText size={32} />
          </div>
          <div className="card-content">
            <h3>{analytics.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>

        <div className="analytics-card card">
          <div className="card-icon">
            <TrendingUp size={32} />
          </div>
          <div className="card-content">
            <h3>{analytics.averageUserAge.toFixed(1)}</h3>
            <p>Average User Age</p>
          </div>
        </div>

        <div className="analytics-card card">
          <div className="card-icon">
            <Edit3 size={32} />
          </div>
          <div className="card-content">
            <h3>{analytics.totalPosts > 0 ? (analytics.totalPosts / analytics.totalUsers).toFixed(1) : '0'}</h3>
            <p>Posts per User</p>
          </div>
        </div>
      </div>

      {Object.keys(analytics.postsPerUser).length > 0 && (
        <div className="posts-distribution-beautiful card">
          <div className="distribution-header">
            <div className="distribution-title">
              <BarChart3 className="header-icon" size={24} />
              <h3>Posts Distribution by User</h3>
            </div>
            <div className="distribution-stats">
              <span className="total-contributors">
                <Users size={16} />
                {Object.keys(analytics.postsPerUser).length} Contributors
              </span>
            </div>
          </div>
          
          <div className="distribution-chart">
            {Object.entries(analytics.postsPerUser)
              .sort(([, a], [, b]) => b - a)
              .map(([userId, postCount], index) => {
                const maxPosts = Math.max(...Object.values(analytics.postsPerUser));
                const percentage = (postCount / maxPosts) * 100;
                const isTopContributor = index === 0;
                const user = users.find(u => u.id === userId);
                
                return (
                  <div key={userId} className={`distribution-user-card ${isTopContributor ? 'top-contributor' : ''}`}>
                    <div className="user-info-section">
                      <div className="user-avatar-analytics">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                        {isTopContributor && <Crown className="crown-icon" size={12} />}
                      </div>
                      <div className="user-details">
                        <span className="user-name-analytics">{getUserName(userId)}</span>
                        <div className="user-badges">
                          {isTopContributor && (
                            <span className="badge top-badge">
                              <Award size={10} />
                              Top Contributor
                            </span>
                          )}
                          {postCount >= maxPosts * 0.7 && !isTopContributor && (
                            <span className="badge active-badge">
                              <Target size={10} />
                              Active
                            </span>
                          )}
                          {user && (
                            <span className="badge age-badge">
                              <Activity size={10} />
                              {user.age}y
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="posts-progress-section">
                      <div className="posts-count-display">
                        <span className="posts-number">{postCount}</span>
                        <span className="posts-label">post{postCount !== 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="progress-bar-container">
                        <div className="progress-bar-bg">
                          <div 
                            className={`progress-bar-fill ${isTopContributor ? 'top-fill' : ''}`}
                            style={{ 
                              width: `${percentage}%`,
                              animationDelay: `${index * 100}ms`
                            }}
                          />
                        </div>
                        <span className="percentage-text">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <div className="engagement-metrics">
                      <div className="metric">
                        <TrendingUp size={12} />
                        <span>{((postCount / analytics.totalPosts) * 100).toFixed(1)}% of total</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          
          <div className="distribution-insights">
            <div className="insight-card">
              <UserCheck className="insight-icon" size={16} />
              <div className="insight-content">
                <span className="insight-label">Most Active</span>
                <span className="insight-value">
                  {getUserName(Object.entries(analytics.postsPerUser).sort(([, a], [, b]) => b - a)[0][0])}
                </span>
              </div>
            </div>
            
            <div className="insight-card">
              <BarChart3 className="insight-icon" size={16} />
              <div className="insight-content">
                <span className="insight-label">Avg Posts</span>
                <span className="insight-value">
                  {(analytics.totalPosts / Object.keys(analytics.postsPerUser).length).toFixed(1)}
                </span>
              </div>
            </div>
            
            <div className="insight-card">
              <Activity className="insight-icon" size={16} />
              <div className="insight-content">
                <span className="insight-label">Engagement</span>
                <span className="insight-value">
                  {Object.values(analytics.postsPerUser).filter(count => count > 0).length > Object.keys(analytics.postsPerUser).length * 0.7 ? 'High' : 'Moderate'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="analytics-summary card">
        <h3>
          <FileText className="header-icon" size={20} />
          Summary
        </h3>
        <div className="summary-content">
          {analytics.totalUsers === 0 ? (
            <p>
              <Rocket className="header-icon" size={16} />
              No users registered yet. Start by adding some users!
            </p>
          ) : analytics.totalPosts === 0 ? (
            <p>
              <Users className="header-icon" size={16} />
              Users are registered but no posts created yet. Encourage users to create content!
            </p>
          ) : (
            <div>
              <p>
                Your platform has <strong>{analytics.totalUsers}</strong> active users 
                with an average age of <strong>{analytics.averageUserAge.toFixed(1)}</strong> years.
              </p>
              <p>
                They have created a total of <strong>{analytics.totalPosts}</strong> posts, 
                averaging <strong>{(analytics.totalPosts / analytics.totalUsers).toFixed(1)}</strong> posts per user.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
