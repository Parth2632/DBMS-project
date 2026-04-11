import React, { useState, useEffect } from 'react';
import { visitRequestAPI, handleApiError } from '../services/api';
import { useToast } from '../context/ToastContext';
import AddVisitRequestModal from '../components/AddVisitRequestModal';
import { formatDate, formatDateOnly, getStatusBadgeClass } from '../services/api';

export default function VisitRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadVisitRequests();
  }, [filter]);

  const loadVisitRequests = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await visitRequestAPI.getAll(params);
      setRequests(response.data || []);
    } catch (error) {
      showToast(handleApiError(error, 'Failed to load visit requests'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await visitRequestAPI.approve(id, 1);
      showToast('Request approved successfully', 'success');
      loadVisitRequests();
    } catch (error) {
      showToast(handleApiError(error, 'Failed to approve request'), 'error');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Please enter rejection reason:');
    if (!reason) return;
    try {
      await visitRequestAPI.reject(id, 1, reason);
      showToast('Request rejected successfully', 'success');
      loadVisitRequests();
    } catch (error) {
      showToast(handleApiError(error, 'Failed to reject request'), 'error');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Visit Requests</h2>
        <div className="filter-buttons">
          <button className={`btn btn-outline ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`btn btn-outline ${filter === 'Pending' ? 'active' : ''}`} onClick={() => setFilter('Pending')}>Pending</button>
          <button className={`btn btn-outline ${filter === 'Approved' ? 'active' : ''}`} onClick={() => setFilter('Approved')}>Approved</button>
          <button className={`btn btn-outline ${filter === 'Rejected' ? 'active' : ''}`} onClick={() => setFilter('Rejected')}>Rejected</button>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> New Request
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Visitor</th>
              <th>Host</th>
              <th>Visit Date</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Requested At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center"><span className="loading"></span> Loading...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan="8" className="text-center">No visit requests found</td></tr>
            ) : (
              requests.map(request => (
                <tr key={request.request_id}>
                  <td>{request.request_id}</td>
                  <td>{request.visitor_name}</td>
                  <td>{request.host_name}</td>
                  <td>{formatDateOnly(request.visit_date)}</td>
                  <td>{request.purpose}</td>
                  <td><span className={`status-badge ${getStatusBadgeClass(request.approval_status)}`}>{request.approval_status}</span></td>
                  <td>{formatDate(request.requested_at)}</td>
                  <td>
                    <div className="btn-group">
                      {request.approval_status === 'Pending' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(request.request_id)}>Approve</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleReject(request.request_id)}>Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && <AddVisitRequestModal onClose={() => setShowModal(false)} onSuccess={loadVisitRequests} />}
    </div>
  );
}