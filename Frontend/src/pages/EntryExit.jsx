import React, { useState, useEffect } from 'react';
import { entryExitAPI, handleApiError, formatDate } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function EntryExit() {
  const [currentVisitors, setCurrentVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickRequestId, setQuickRequestId] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadCurrentVisitors();
  }, []);

  const loadCurrentVisitors = async () => {
    try {
      setLoading(true);
      const response = await entryExitAPI.getCurrentVisitors();
      setCurrentVisitors(response.data || []);
    } catch (error) {
      showToast(handleApiError(error, 'Failed to load current visitors'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!quickRequestId) {
      showToast('Please enter a request ID', 'error');
      return;
    }
    try {
      await entryExitAPI.checkIn(quickRequestId);
      showToast('Visitor checked in successfully', 'success');
      setQuickRequestId('');
      loadCurrentVisitors();
    } catch (error) {
      showToast(handleApiError(error, 'Failed to check in visitor'), 'error');
    }
  };

  const handleCheckOut = async () => {
    if (!quickRequestId) {
      showToast('Please enter a request ID', 'error');
      return;
    }
    try {
      await entryExitAPI.checkOut(quickRequestId);
      showToast('Visitor checked out successfully', 'success');
      setQuickRequestId('');
      loadCurrentVisitors();
    } catch (error) {
      showToast(handleApiError(error, 'Failed to check out visitor'), 'error');
    }
  };

  const handleCheckOutVisitor = async (requestId) => {
    if (!window.confirm('Are you sure you want to check out this visitor?')) return;
    try {
      await entryExitAPI.checkOut(requestId);
      showToast('Visitor checked out successfully', 'success');
      loadCurrentVisitors();
    } catch (error) {
      showToast(handleApiError(error, 'Failed to check out visitor'), 'error');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Entry/Exit Management</h2>
      </div>
      
      <div className="section">
        <h3>Current Visitors Inside Campus</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Visitor Name</th>
                <th>Visitor Phone</th>
                <th>Host Name</th>
                <th>Host Department</th>
                <th>Purpose</th>
                <th>Entry Time</th>
                <th>Minutes Inside</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="text-center"><span className="loading"></span> Loading...</td></tr>
              ) : currentVisitors.length === 0 ? (
                <tr><td colSpan="9" className="text-center">No visitors currently inside campus</td></tr>
              ) : (
                currentVisitors.map(visitor => (
                  <tr key={visitor.request_id}>
                    <td>{visitor.request_id}</td>
                    <td>{visitor.visitor_name}</td>
                    <td>{visitor.visitor_phone}</td>
                    <td>{visitor.host_name}</td>
                    <td>{visitor.host_department || '-'}</td>
                    <td>{visitor.purpose}</td>
                    <td>{formatDate(visitor.entry_time)}</td>
                    <td>{visitor.minutes_inside || 0}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => handleCheckOutVisitor(visitor.request_id)}>Check Out</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h3>Quick Check-In/Out</h3>
        <div className="quick-check">
          <input 
            type="number" 
            placeholder="Enter Request ID"
            value={quickRequestId}
            onChange={(e) => setQuickRequestId(e.target.value)}
          />
          <button className="btn btn-success" onClick={handleCheckIn}>Check In</button>
          <button className="btn btn-danger" onClick={handleCheckOut}>Check Out</button>
        </div>
      </div>
    </div>
  );
}