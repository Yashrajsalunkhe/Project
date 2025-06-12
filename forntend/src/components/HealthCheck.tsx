import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { healthCheck } from '../api';

interface HealthCheckProps {
  onStatusChange?: (isConnected: boolean) => void;
}

const HealthCheck: React.FC<HealthCheckProps> = ({ onStatusChange }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      const connected = await healthCheck();
      setIsConnected(connected);
      setLastChecked(new Date());
      onStatusChange?.(connected);
    } catch (error) {
      setIsConnected(false);
      setLastChecked(new Date());
      onStatusChange?.(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusText = () => {
    if (isConnected === null) return 'Checking...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const getStatusIcon = () => {
    if (isConnected === null) return <Clock size={16} className="spinning" />;
    return isConnected ? <CheckCircle size={16} /> : <XCircle size={16} />;
  };

  return (
    <div className="health-check-container">
      <div className="status-indicator">
        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}>
          {getStatusIcon()}
        </span>
        <div className="status-info">
          <span className="status-text">{getStatusText()}</span>
          {lastChecked && (
            <span className="status-time">
              {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      <button 
        onClick={checkHealth}
        className={`refresh-button ${isConnected === null ? 'loading' : ''}`}
        title="Check connection"
        disabled={isConnected === null}
      >
        <span className={isConnected === null ? 'spinning' : ''}>
          <RefreshCw size={16} />
        </span>
      </button>
    </div>
  );
};

export default HealthCheck;
