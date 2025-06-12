import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, FileText, BarChart3, Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import UsersComponent from './components/Users';
import Posts from './components/Posts';
import Analytics from './components/Analytics';
import NotFound from './components/NotFound';
import HealthCheck from './components/HealthCheck';
import { ToastProvider } from './components/Toast';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [cssLoaded, setCssLoaded] = useState(false);

  // Ensure CSS is fully loaded to prevent layout shifts
  useEffect(() => {
    const timer = setTimeout(() => {
      setCssLoaded(true);
    }, 100); // Small delay to ensure CSS is applied
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastProvider>
      <Router>
        <div className={`app ${cssLoaded ? 'css-loaded' : 'css-loading'}`}>
          <header className="app-header">
            <div className="header-content">
              <h1 className="app-title">
                <Zap className="title-icon" size={24} />
                Management Dashboard
              </h1>
              <div className="connection-status">
                <HealthCheck onStatusChange={setIsConnected} />
              </div>
            </div>
          
          <nav className="app-nav">
            <Link 
              to="/" 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Home className="nav-icon" size={18} />
              <span>Dashboard</span>
            </Link>
            <Link 
              to="/users" 
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="nav-icon" size={18} />
              <span>Users</span>
            </Link>
            <Link 
              to="/posts" 
              className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <FileText className="nav-icon" size={18} />
              <span>Posts</span>
            </Link>
            <Link 
              to="/analytics" 
              className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="nav-icon" size={18} />
              <span>Analytics</span>
            </Link>
          </nav>
        </header>

        <main className="app-main">
          {!isConnected && isConnected !== null && (
            <div className="connection-error">
              <div className="error-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="error-content">
                <h3>Connection Error</h3>
                <p>Unable to connect to the backend server. Please make sure the server is running on port 3001.</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersComponent />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2025 Management Dashboard. Built with React & Express.</p>
        </footer>
      </div>
    </Router>
    </ToastProvider>
  );
}

export default App
