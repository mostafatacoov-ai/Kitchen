import { useState, useEffect } from 'react';
import { Loader2, Trash2, CheckCircle, XCircle, Plus, Users, FileText } from 'lucide-react';
import styles from '@/app/admin/Admin.module.css';

export default function HRTab() {
  const [employees, setEmployees] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('employees'); // 'employees' or 'applications'
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Designer', phone: '', salary: 0, status: 'Active' });

  const roles = ['Designer', 'Carpenter', 'Driver', 'Accountant', 'Manager', 'Other'];

  useEffect(() => {
    fetchEmployees();
    fetchApplications();
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

  const fetchApplications = async () => {
    try {
      const key = localStorage.getItem('admin_passkey');
      const res = await fetch('/api/careers', { headers: { 'x-admin-passkey': key } });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEmployee = async () => {
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

  const handleDeleteEmployee = async (id) => {
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

  const handleUpdateAppStatus = async (app, newStatus) => {
    const key = localStorage.getItem('admin_passkey');
    try {
      // Update app status
      await fetch('/api/careers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-passkey': key },
        body: JSON.stringify({ id: app.id, status: newStatus })
      });
      
      fetchApplications();

      // If accepted, move to employees
      if (newStatus === 'Accepted') {
        const empPayload = {
          name: app.name,
          role: app.role,
          phone: app.phone,
          salary: 0,
          status: 'Active'
        };
        await fetch('/api/personnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-passkey': key },
          body: JSON.stringify(empPayload)
        });
        fetchEmployees();
        alert('تم نقل المتقدم إلى قائمة الموظفين بنجاح!');
      }

    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = applications.filter(a => a.status === 'Pending').length;

  return (
    <div className={styles.tabContentPanel}>
      <div className={styles.panelHeader} style={{ marginBottom: '1.5rem' }}>
        <h2>شؤون الموظفين والتوظيف (HR & Careers)</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={styles.submitBtn} onClick={() => setShowAddForm(!showAddForm)} style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0 }}>
            <Plus size={18} /> إضافة موظف
          </button>
        </div>
      </div>

      <div className={styles.tabsContainer} style={{ borderBottom: 'none', marginBottom: '2rem' }}>
        <button 
          className={`${styles.tabBtn} ${view === 'employees' ? styles.activeTab : ''}`}
          onClick={() => setView('employees')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Users size={18} /> الموظفين الحاليين ({employees.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${view === 'applications' ? styles.activeTab : ''}`}
          onClick={() => setView('applications')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FileText size={18} /> طلبات التوظيف 
          {pendingCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '0.1rem 0.5rem', fontSize: '0.8rem' }}>{pendingCount}</span>}
        </button>
      </div>

      {showAddForm && view === 'employees' && (
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
              <button className={styles.submitBtn} onClick={handleSaveEmployee}>حفظ الموظف</button>
            </div>
          </div>
        </div>
      )}

      {view === 'employees' && (
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
                    <td>{emp.salary?.toLocaleString()} EGP</td>
                    <td>
                      <span className={styles.styleBadge} style={{ background: emp.status === 'Active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: emp.status === 'Active' ? '#22c55e' : '#ef4444' }}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteEmployee(emp.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {view === 'applications' && (
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loaderWrapper}><Loader2 className="animate-spin" size={40} /></div>
          ) : applications.length === 0 ? (
            <div className={styles.emptyState}>لا توجد طلبات توظيف حالياً.</div>
          ) : (
            <table className={styles.requestsTable}>
              <thead>
                <tr>
                  <th>الاسم / Name</th>
                  <th>الوظيفة المطلوبة / Role</th>
                  <th>التواصل / Contact</th>
                  <th>التفاصيل / Details</th>
                  <th>تاريخ الطلب / Date</th>
                  <th>الحالة والإجراء / Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
                    <td className={styles.clientName}>{app.name}</td>
                    <td>{app.role}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span dir="ltr" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{app.phone}</span>
                        {app.email && <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{app.email}</span>}
                      </div>
                    </td>
                    <td>
                      {app.portfolioLink && <a href={app.portfolioLink} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)', textDecoration: 'underline', display: 'block', marginBottom: '0.25rem' }}>رابط الأعمال</a>}
                      {app.notes && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '200px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.notes}>{app.notes}</span>}
                    </td>
                    <td>{new Date(app.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                      {app.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleUpdateAppStatus(app, 'Accepted')} title="قبول ونقل للموظفين" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid #22c55e', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={14} /> قبول
                          </button>
                          <button onClick={() => handleUpdateAppStatus(app, 'Rejected')} title="رفض" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <XCircle size={14} /> رفض
                          </button>
                        </div>
                      ) : (
                        <span className={styles.styleBadge} style={{ 
                          background: app.status === 'Accepted' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                          color: app.status === 'Accepted' ? '#22c55e' : '#ef4444' 
                        }}>
                          {app.status === 'Accepted' ? 'مقبول (موظف)' : 'مرفوض'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
