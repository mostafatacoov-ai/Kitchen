import { useState, useEffect } from 'react';
import { Loader2, Trash2, Edit, Plus, Users } from 'lucide-react';
import styles from '@/app/admin/Admin.module.css';

export default function HRTab() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Designer', phone: '', salary: 0, status: 'Active' });

  const roles = ['Designer', 'Carpenter', 'Driver', 'Accountant', 'Manager', 'Other'];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const key = localStorage.getItem('admin_passkey');
      const res = await fetch('/api/personnel', { headers: { 'x-admin-passkey': key } });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
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
      const res = await fetch('/api/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-passkey': key },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchEmployees();
        setShowAddForm(false);
        setFormData({ name: '', role: 'Designer', phone: '', salary: 0, status: 'Active' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    const key = localStorage.getItem('admin_passkey');
    try {
      const res = await fetch(`/api/personnel?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': key }
      });
      if (res.ok) fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.tabContentPanel}>
      <div className={styles.panelHeader}>
        <h2>شؤون الموظفين (HR)</h2>
        <button className={styles.submitBtn} onClick={() => setShowAddForm(!showAddForm)} style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0 }}>
          <Plus size={18} /> إضافة موظف
        </button>
      </div>

      {showAddForm && (
        <div className={styles.projectFormCard} style={{ marginBottom: '2rem' }}>
          <h3>موظف جديد</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>اسم الموظف</label>
              <input type="text" className={styles.formInput} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label>الدور / الوظيفة</label>
              <select className={styles.formInput} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>رقم الهاتف</label>
              <input type="text" className={styles.formInput} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>الراتب الأساسي (EGP)</label>
              <input type="number" className={styles.formInput} value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <button className={styles.submitBtn} onClick={handleSave}>حفظ الموظف</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loaderWrapper}><Loader2 className="animate-spin" size={40} /></div>
        ) : employees.length === 0 ? (
          <div className={styles.emptyState}>لا يوجد موظفين مسجلين.</div>
        ) : (
          <table className={styles.requestsTable}>
            <thead>
              <tr>
                <th>الاسم / Name</th>
                <th>الوظيفة / Role</th>
                <th>الهاتف / Phone</th>
                <th>الراتب / Salary</th>
                <th>الحالة / Status</th>
                <th>الإجراءات / Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td className={styles.clientName}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} style={{ color: 'var(--text-secondary)' }} />
                      {emp.name}
                    </div>
                  </td>
                  <td>{emp.role}</td>
                  <td><span dir="ltr">{emp.phone}</span></td>
                  <td>{emp.salary} EGP</td>
                  <td>
                    <span className={styles.styleBadge} style={{ background: emp.status === 'Active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: emp.status === 'Active' ? '#22c55e' : '#ef4444' }}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(emp.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
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
