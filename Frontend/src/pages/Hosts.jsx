import React, { useState, useEffect } from 'react';
import { hostAPI, handleApiError } from '../services/api';
import { useToast } from '../context/ToastContext';
import AddHostModal from '../components/AddHostModal';

export default function Hosts() {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    try {
      setLoading(true);
      const response = await hostAPI.getAll();
      setHosts(response.data || []);
    } catch (error) {
      showToast(handleApiError(error, 'Failed to load hosts'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this host?')) return;
    try {
      await hostAPI.delete(id);
      showToast('Host deleted successfully', 'success');
      loadHosts();
    } catch (error) {
      showToast(handleApiError(error, 'Failed to delete host'), 'error');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Hosts Management</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Add Host
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Type</th>
              <th>Roll Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center"><span className="loading"></span> Loading...</td></tr>
            ) : hosts.length === 0 ? (
              <tr><td colSpan="8" className="text-center">No hosts found</td></tr>
            ) : (
              hosts.map(host => (
                <tr key={host.host_id}>
                  <td>{host.host_id}</td>
                  <td>{host.full_name}</td>
                  <td>{host.department || '-'}</td>
                  <td>{host.phone_no || '-'}</td>
                  <td>{host.email || '-'}</td>
                  <td><span className="status-badge status-approved">{host.host_type}</span></td>
                  <td>{host.roll_number || '-'}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(host.host_id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && <AddHostModal onClose={() => setShowModal(false)} onSuccess={loadHosts} />}
    </div>
  );
}