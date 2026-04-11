import React, { useState } from 'react';
import { visitorAPI, handleApiError } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AddVisitorModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_no: '',
    email: '',
    id_proof_type: '',
    id_proof_number: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await visitorAPI.create(formData);
      showToast('Visitor added successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      showToast(handleApiError(error, 'Failed to add visitor'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay active" onClick={onClose}></div>
      <div className="modal active">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Add New Visitor</h3>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                required 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input 
                type="tel" 
                required 
                value={formData.phone_no}
                onChange={(e) => setFormData({...formData, phone_no: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>ID Proof Type *</label>
              <select 
                required 
                value={formData.id_proof_type}
                onChange={(e) => setFormData({...formData, id_proof_type: e.target.value})}
              >
                <option value="">Select ID Proof Type</option>
                <option value="Aadhar">Aadhar</option>
                <option value="PAN">PAN</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>
            <div className="form-group">
              <label>ID Proof Number *</label>
              <input 
                type="text" 
                required 
                value={formData.id_proof_number}
                onChange={(e) => setFormData({...formData, id_proof_number: e.target.value})}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Visitor'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}