import React, { useState } from 'react';
import { entryExitAPI, handleApiError, formatDateOnly, formatTime, getStatusBadgeClass } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { showToast } = useToast();

  const loadHistory = async () => {
    if (!startDate || !endDate) {
      showToast('Please select both start and end dates', 'error');
      return;
    }
    try {
      setLoading(true);
      const response = await entryExitAPI.getVisitHistory({ start_date: startDate, end_date: endDate });
      setHistory(response.data || []);
    } catch (error) {
      showToast(handleApiError(error, 'Failed to load visit history'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Visit History</h2>
        <div className="date-filters">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="btn btn-primary" onClick={loadHistory}>Filter</button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Visitor Name</th>
              <th>Host Name</th>
              <th>Visit Date</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Duration (min)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="text-center"><span className="loading"></span> Loading...</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan="9" className="text-center">Select date range and click Filter</td></tr>
            ) : (
              history.map(item => (
                <tr key={item.request_id}>
                  <td>{item.request_id}</td>
                  <td>{item.visitor_name}</td>
                  <td>{item.host_name}</td>
                  <td>{formatDateOnly(item.visit_date)}</td>
                  <td>{item.purpose}</td>
                  <td><span className={`status-badge ${getStatusBadgeClass(item.approval_status)}`}>{item.approval_status}</span></td>
                  <td>{item.entry_time ? formatTime(item.entry_time) : '-'}</td>
                  <td>{item.exit_time ? formatTime(item.exit_time) : '-'}</td>
                  <td>{item.total_visit_minutes || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}