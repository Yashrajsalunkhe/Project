import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, Users } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-animation">
          <div className="floating-icon">
            <Search size={48} />
          </div>
          <div className="error-code">404</div>
        </div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-description">
          The page you're looking for seems to have vanished into the digital void.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            <Home className="header-icon" size={16} /> Go Home
          </Link>
          <Link to="/users" className="btn btn-secondary">
            <Users className="header-icon" size={16} /> View Users
          </Link>
        </div>
      </div>
      <div className="not-found-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
