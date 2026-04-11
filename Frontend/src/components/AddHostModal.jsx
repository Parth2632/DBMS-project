import React, { useState } from 'react';
import { hostAPI, handleApiError } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AddHostModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    department: '',
    phone_no: '',
    email: '',
    host_type: '',
    roll_number: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData };
    if (data.host_type !== 'Student') {
      delete data.roll_number;
    }
    try {
      setLoading(true);
      await hostAPI.create(data);
      showToast('Host added successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      showToast(handleApiError(error, 'Failed to add host'), 'error');
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
            <h3>Add New Host</h3>
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
              <label>Department</label>
              <input 
                type="text" 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
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
              <label>Host Type *</label>
              <select 
                required 
                value={formData.host_type}
                onChange={(e) => setFormData({...formData, host_type: e.target.value})}
              >
                <option value="">Select Host Type</option>
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            {formData.host_type === 'Student' && (
              <div className="form-group">
                <label>Roll Number *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.roll_number}
                  onChange={(e) => setFormData({...formData, roll_number: e.target.value})}
                />
              </div>
            )}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Host'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}