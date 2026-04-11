import React, { useState, useEffect } from 'react';
import { visitorAPI, handleApiError } from '../services/api';
import { useToast } from '../context/ToastContext';
import AddVisitorModal from '../components/AddVisitorModal';

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    try {
      setLoading(true);
      const response = await visitorAPI.getAll();
      setVisitors(response.data || []);
    } catch (error) {
      showToast(handleApiError(error, 'Failed to load visitors'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this visitor?')) return;
    try {
      await visitorAPI.delete(id);
      showToast('Visitor deleted successfully', 'success');
      loadVisitors();
    } catch (error) {
      showToast(handleApiError(error, 'Failed to delete visitor'), 'error');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Visitors Management</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Add Visitor
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>ID Proof Type</th>
              <th>ID Proof Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center"><span className="loading"></span> Loading...</td></tr>
            ) : visitors.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No visitors found</td></tr>
            ) : (
              visitors.map(visitor => (
                <tr key={visitor.visitor_id}>
                  <td>{visitor.visitor_id}</td>
                  <td>{visitor.full_name}</td>
                  <td>{visitor.phone_no}</td>
                  <td>{visitor.email || '-'}</td>
                  <td>{visitor.id_proof_type}</td>
                  <td>{visitor.id_proof_number || '-'}</td>
                  <td>
                    <div className="btn-group">
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(visitor.visitor_id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && <AddVisitorModal onClose={() => setShowModal(false)} onSuccess={loadVisitors} />}
    </div>
  );
}