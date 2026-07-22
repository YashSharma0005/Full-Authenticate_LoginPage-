import React, { useState, useEffect } from 'react';
import './LiveTracking.css';

const LiveTracking = () => {
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrackingData();
    // हर 5 seconds में update करेगा
    const interval = setInterval(fetchTrackingData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrackingData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tracking/live');
      const result = await response.json();
      
      if (result.success) {
        setTrackingData(result.data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch tracking data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'in_transit':
        return '#4CAF50';
      case 'delivered':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ Pending';
      case 'in_transit':
        return '🚚 In Transit';
      case 'delivered':
        return '✅ Delivered';
      default:
        return status;
    }
  };

  if (loading && trackingData.length === 0) {
    return (
      <div className="tracking-container">
        <div className="loading">⏳ Loading tracking data...</div>
      </div>
    );
  }

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h2>🗺️ Live Tracking Dashboard</h2>
        <span className="update-time">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tracking-grid">
        {trackingData.length > 0 ? (
          trackingData.map((track) => (
            <div key={track._id} className="tracking-card">
              <div className="card-header">
                <div>
                  <h3>📦 Booking: {track.orderId?._id}</h3>
                  <p className="user-info">👤 {track.userId?.name}</p>
                </div>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(track.status) }}
                >
                  {getStatusText(track.status)}
                </span>
              </div>

              <div className="card-body">
                <div className="location-info">
                  <div className="info-item">
                    <span className="label">📍 Location:</span>
                    <span className="value">{track.address || 'Updating...'}</span>
                  </div>
                  
                  <div className="coordinates">
                    <span>Lat: {track.latitude?.toFixed(4)}</span>
                    <span>Long: {track.longitude?.toFixed(4)}</span>
                  </div>

                  <div className="info-row">
                    <div className="info-item">
                      <span className="label">💨 Speed:</span>
                      <span className="value">{track.speed} km/h</span>
                    </div>
                    <div className="info-item">
                      <span className="label">🧭 Direction:</span>
                      <span className="value">{track.direction}</span>
                    </div>
                  </div>
                </div>

                <div className="time-info">
                  <span className="label">⏰ Time:</span>
                  <span className="value">
                    {new Date(track.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <button className="btn-view">📱 View on Map</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">No tracking data available</div>
        )}
      </div>
    </div>
  );
};

export default LiveTracking;