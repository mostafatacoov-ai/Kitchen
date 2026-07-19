import { useState, useEffect } from 'react';
import { Loader2, Trash2, Edit, Plus, Wrench } from 'lucide-react';
import styles from '@/app/admin/Admin.module.css';

export default function ManufacturingTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ kitchenName: '', clientName: '', phone: '', stage: 'Measurement' });

  const stages = ['Measurement', 'Design', 'Contract', 'Cutting', 'Assembling', 'Finishing', 'Delivery', 'Installation'];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const key = localStorage.getItem('admin_passkey');
      const res = await fetch('/api/manufacturing', { headers: { 'x-admin-passkey': key } });
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const key = localStorage.getItem('admin_passkey');
    try {
      const res = await fetch('/api/manufacturing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-passkey': key },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchProjects();
        setShowAddForm(false);
        setFormData({ kitchenName: '', clientName: '', phone: '', stage: 'Measurement' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStage = async (id, newStage) => {
    const key = localStorage.getItem('admin_passkey');
    try {
      const res = await fetch('/api/manufacturing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-passkey': key },
        body: JSON.stringify({ id, stage: newStage })
      });
      if (res.ok) fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    const key = localStorage.getItem('admin_passkey');
    try {
      const res = await fetch(`/api/manufacturing?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': key }
      });
      if (res.ok) fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.tabContentPanel}>
      <div className={styles.panelHeader}>
        <h2>إدارة التصنيع (Manufacturing)</h2>
        <button className={styles.submitBtn} onClick={() => setShowAddForm(!showAddForm)} style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0 }}>
          <Plus size={18} /> إضافة مشروع تصنيع
        </button>
      </div>

      {showAddForm && (
        <div className={styles.projectFormCard} style={{ marginBottom: '2rem' }}>
          <h3>مشروع جديد</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>اسم المطبخ / المشروع</label>
              <input type="text" className={styles.formInput} value={formData.kitchenName} onChange={e => setFormData({...formData, kitchenName: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label>اسم العميل</label>
              <input type="text" className={styles.formInput} value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label>المرحلة الحالية</label>
              <select className={styles.formInput} value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <button className={styles.submitBtn} onClick={handleSave}>بدء التصنيع</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loaderWrapper}><Loader2 className="animate-spin" size={40} /></div>
        ) : projects.length === 0 ? (
          <div className={styles.emptyState}>لا توجد مشاريع في المصنع حالياً.</div>
        ) : (
          <table className={styles.requestsTable}>
            <thead>
              <tr>
                <th>المشروع / Project</th>
                <th>العميل / Client</th>
                <th>المرحلة / Stage</th>
                <th>تحديث المرحلة / Update</th>
                <th>الإجراءات / Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(proj => (
                <tr key={proj.id}>
                  <td className={styles.clientName}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Wrench size={16} style={{ color: 'var(--text-secondary)' }} />
                      {proj.kitchenName}
                    </div>
                  </td>
                  <td>{proj.clientName}</td>
                  <td>
                    <span className={styles.styleBadge} style={{ background: 'rgba(224, 90, 22, 0.15)', color: 'var(--orange)' }}>
                      {proj.stage}
                    </span>
                  </td>
                  <td>
                    <select className={styles.formInput} value={proj.stage} onChange={e => updateStage(proj.id, e.target.value)} style={{ padding: '0.4rem' }}>
                      {stages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(proj.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
