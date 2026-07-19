import { useState, useEffect } from 'react';
import { Loader2, Trash2, Phone, Save, Edit, Plus } from 'lucide-react';
import styles from '@/app/admin/Admin.module.css';

export default function CRMTab() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ clientName: '', phone: '', status: 'New', source: 'Website', notes: '', expectedValue: 0 });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const key = localStorage.getItem('admin_passkey');
      const res = await fetch('/api/crm', { headers: { 'x-admin-passkey': key } });
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id, updatedLead) => {
    const key = localStorage.getItem('admin_passkey');
    try {
      if (id) {
        // Update
        const res = await fetch('/api/crm', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-passkey': key },
          body: JSON.stringify({ id, ...updatedLead })
        });
        if (res.ok) fetchLeads();
        setEditingId(null);
      } else {
        // Create
        const res = await fetch('/api/crm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-passkey': key },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          fetchLeads();
          setShowAddForm(false);
          setFormData({ clientName: '', phone: '', status: 'New', source: 'Website', notes: '', expectedValue: 0 });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    const key = localStorage.getItem('admin_passkey');
    try {
      const res = await fetch(`/api/crm?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': key }
      });
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.tabContentPanel}>
      <div className={styles.panelHeader}>
        <h2>نظام إدارة العملاء (CRM)</h2>
        <button className={styles.submitBtn} onClick={() => setShowAddForm(!showAddForm)} style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0 }}>
          <Plus size={18} /> إضافة عميل جديد
        </button>
      </div>

      {showAddForm && (
        <div className={styles.projectFormCard} style={{ marginBottom: '2rem' }}>
          <h3>عميل جديد</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>الاسم</label>
              <input type="text" className={styles.formInput} value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label>الهاتف</label>
              <input type="text" className={styles.formInput} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label>الحالة</label>
              <select className={styles.formInput} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="New">جديد (New)</option>
                <option value="Contacted">تم التواصل (Contacted)</option>
                <option value="Meeting Scheduled">موعد محدد (Meeting Scheduled)</option>
                <option value="Qualified">مؤهل (Qualified)</option>
                <option value="Lost">مفقود (Lost)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>المصدر</label>
              <input type="text" className={styles.formInput} value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>القيمة المتوقعة (EGP)</label>
              <input type="number" className={styles.formInput} value={formData.expectedValue} onChange={e => setFormData({...formData, expectedValue: Number(e.target.value)})} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>ملاحظات</label>
              <textarea className={styles.formInput} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <button className={styles.submitBtn} onClick={() => handleSave(null, null)}>حفظ العميل</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loaderWrapper}><Loader2 className="animate-spin" size={40} /></div>
        ) : leads.length === 0 ? (
          <div className={styles.emptyState}>لا يوجد عملاء حالياً.</div>
        ) : (
          <table className={styles.requestsTable}>
            <thead>
              <tr>
                <th>الاسم / Name</th>
                <th>الهاتف / Phone</th>
                <th>الحالة / Status</th>
                <th>المصدر / Source</th>
                <th>القيمة / Value</th>
                <th>الإجراءات / Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id}>
                  {editingId === lead.id ? (
                    <td colSpan="6" style={{ padding: '1rem' }}>
                      <div className={styles.formGrid}>
                         <input type="text" className={styles.formInput} defaultValue={lead.clientName} id={`name-${lead.id}`} />
                         <input type="text" className={styles.formInput} defaultValue={lead.phone} id={`phone-${lead.id}`} />
                         <select className={styles.formInput} defaultValue={lead.status} id={`status-${lead.id}`}>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Meeting Scheduled">Meeting Scheduled</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Lost">Lost</option>
                         </select>
                         <button className={styles.submitBtn} onClick={() => {
                            const updated = {
                              clientName: document.getElementById(`name-${lead.id}`).value,
                              phone: document.getElementById(`phone-${lead.id}`).value,
                              status: document.getElementById(`status-${lead.id}`).value,
                            };
                            handleSave(lead.id, updated);
                         }}>حفظ التعديل</button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className={styles.clientName}>{lead.clientName}</td>
                      <td>
                        <div className={styles.phoneGroup}>
                          <span dir="ltr">{lead.phone}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.styleBadge}>{lead.status}</span>
                      </td>
                      <td>{lead.source}</td>
                      <td>{lead.expectedValue} EGP</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => setEditingId(lead.id)} className={styles.actionIcon}><Edit size={16} /></button>
                          <button onClick={() => handleDelete(lead.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
