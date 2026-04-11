import React, { useState, useEffect } from 'react';
import { visitRequestAPI, visitorAPI, hostAPI, handleApiError } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AddVisitRequestModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    visitor_id: '',
    host_id: '',
    visit_date: '',
    purpose: ''
  });
  const [visitors, setVisitors] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadVisitorsAndHosts();
  }, []);

  const loadVisitorsAndHosts = async () => {
    try {
      const [visitorsRes, hostsRes] = await Promise.all([
        visitorAPI.getAll(),
        hostAPI.getAll()
      ]);
      setVisitors(visitorsRes.data || []);
      setHosts(hostsRes.data || []);
    } catch (error) {
      showToast(handleApiError(error, 'Failed to load visitors and hosts'), 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await visitRequestAPI.create(formData);
      showToast('Visit request created successfully', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      showToast(handleApiError(error, 'Failed to create visit request'), 'error');
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
            <h3>New Visit Request</h3>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Visitor *</label>
              <select 
                required 
                value={formData.visitor_id}
                onChange={(e) => setFormData({...formData, visitor_id: e.target.value})}
              >
                <option value="">Select Visitor</option>
                {visitors.map(v => (
                  <option key={v.visitor_id} value={v.visitor_id}>{v.full_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Host *</label>
              <select 
                required 
                value={formData.host_id}
                onChange={(e) => setFormData({...formData, host_id: e.target.value})}
              >
                <option value="">Select Host</option>
                {hosts.map(h => (
                  <option key={h.host_id} value={h.host_id}>{h.full_name} ({h.host_type})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Visit Date *</label>
              <input 
                type="date" 
                required 
                value={formData.visit_date}
                onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Purpose *</label>
              <textarea 
                required 
                rows="3" 
                placeholder="Describe the purpose of visit"
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              ></textarea>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Request'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}