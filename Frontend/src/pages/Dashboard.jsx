import React, { useState, useEffect } from 'react';
import { dashboardAPI, formatDate } from '../services/api';
import { useToast } from '../context/ToastContext';
import AddVisitorModal from '../components/AddVisitorModal';
import AddHostModal from '../components/AddHostModal';
import AddVisitRequestModal from '../components/AddVisitRequestModal';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalHosts: 0,
    pendingRequests: 0,
    currentVisitors: 0
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivity(10)
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data || []);
    } catch (error) {
      showToast(handleApiError(error, 'Failed to load dashboard'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error, customMessage = 'Operation failed') => {
    console.error('API Error:', error);
    return error.message || customMessage;
  };

  return (
    <div className="page-content active">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalVisitors}</h3>
            <p>Total Visitors</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fas fa-user-tie"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalHosts}</h3>
            <p>Total Hosts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <i className="fas fa-door-open"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.currentVisitors}</h3>
            <p>Current Visitors</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h3>Recent Activity</h3>
          {loading ? (
            <div className="text-center"><span className="loading"></span> Loading...</div>
          ) : activity.length === 0 ? (
            <div className="empty-state">No recent activity</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Host</th>
                    <th>Activity</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.visitor_name}</td>
                      <td>{item.host_name}</td>
                      <td><span className={`status-badge ${getStatusBadgeClass(item.approval_status)}`}>{item.activity_type}</span></td>
                      <td>{formatDate(item.requested_at || item.entry_time || item.approval_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={() => setShowVisitorModal(true)}>
              <i className="fas fa-user-plus"></i> Add Visitor
            </button>
            <button className="btn btn-success" onClick={() => setShowHostModal(true)}>
              <i className="fas fa-user-plus"></i> Add Host
            </button>
            <button className="btn btn-info" onClick={() => setShowRequestModal(true)}>
              <i className="fas fa-plus"></i> New Visit Request
            </button>
          </div>
        </div>
      </div>

      {showVisitorModal && <AddVisitorModal onClose={() => setShowVisitorModal(false)} onSuccess={loadDashboard} />}
      {showHostModal && <AddHostModal onClose={() => setShowHostModal(false)} onSuccess={loadDashboard} />}
      {showRequestModal && <AddVisitRequestModal onClose={() => setShowRequestModal(false)} onSuccess={loadDashboard} />}
    </div>
  );
}

function getStatusBadgeClass(status) {
  const classes = {
    'Pending': 'status-pending',
    'Approved': 'status-approved',
    'Rejected': 'status-rejected',
    'Completed': 'status-completed'
  };
  return classes[status] || '';
}