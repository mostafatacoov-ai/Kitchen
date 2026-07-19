import { useState, useEffect } from 'react';
import { Loader2, Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from '@/app/admin/Admin.module.css';

const EXPENSE_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#64748b'];

export default function AccountingTab() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [projects, setProjects] = useState([]);
  
  const [formData, setFormData] = useState({ 
    type: 'Income', 
    category: 'Project Revenue', 
    amount: 0, 
    description: '',
    relatedProject: ''
  });

  const categories = ['Project Revenue', 'Material Cost', 'Labor Cost', 'Overhead', 'Other'];

  useEffect(() => {
    fetchRecords();
    fetchProjects();
  }, []);

  const fetchRecords = async () => {
    try {
      const key = localStorage.getItem('admin_passkey');
      const res = await fetch('/api/accounting', { headers: { 'x-admin-passkey': key } });
      const data = await res.json();
      if (data.success) setRecords(data.records);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const key = localStorage.getItem('admin_passkey');
      const res = await fetch('/api/manufacturing', { headers: { 'x-admin-passkey': key } });
      const data = await res.json();
      if (data.success) setProjects(data.projects);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    const key = localStorage.getItem('admin_passkey');
    const payload = { ...formData };
    if (!payload.relatedProject) delete payload.relatedProject;

    try {
      const res = await fetch('/api/accounting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-passkey': key },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchRecords();
        setShowAddForm(false);
        setFormData({ type: 'Income', category: 'Project Revenue', amount: 0, description: '', relatedProject: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    const key = localStorage.getItem('admin_passkey');
    try {
      const res = await fetch(`/api/accounting?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': key }
      });
      if (res.ok) fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate totals
  const totalIncome = records.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'Expense').reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Chart Data
  const expenses = records.filter(r => r.type === 'Expense');
  const expenseCategories = ['Material Cost', 'Labor Cost', 'Overhead', 'Other'];
  const expenseChartData = expenseCategories.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(d => d.value > 0);

  return (
    <div className={styles.tabContentPanel}>
      <div className={styles.panelHeader}>
        <h2>الحسابات (Accounting)</h2>
        <button className={styles.submitBtn} onClick={() => setShowAddForm(!showAddForm)} style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0 }}>
          <Plus size={18} /> إضافة حركة مالية
        </button>
      </div>

      <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
        <div className={styles.statCard}>
          <h3>إجمالي الإيرادات</h3>
          <div className={styles.statNumber} style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={24} /> {totalIncome.toLocaleString()} EGP
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>إجمالي المصروفات</h3>
          <div className={styles.statNumber} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingDown size={24} /> {totalExpense.toLocaleString()} EGP
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>صافي الربح</h3>
          <div className={styles.statNumber} style={{ color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>
            {netProfit.toLocaleString()} EGP
          </div>
        </div>
      </div>

      {expenseChartData.length > 0 && (
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
            <h3>توزيع المصروفات</h3>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={expenseChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} EGP`} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className={styles.projectFormCard} style={{ marginBottom: '2rem' }}>
          <h3>حركة مالية جديدة</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>النوع</label>
              <select className={styles.formInput} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Income">إيراد (Income)</option>
                <option value="Expense">مصروف (Expense)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>التصنيف</label>
              <select className={styles.formInput} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>المبلغ (EGP)</label>
              <input type="number" className={styles.formInput} value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
            </div>
            <div className={styles.formGroup}>
              <label>ارتباط بمشروع (اختياري)</label>
              <select className={styles.formInput} value={formData.relatedProject} onChange={e => setFormData({...formData, relatedProject: e.target.value})}>
                <option value="">بدون مشروع / عام</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.kitchenName} ({p.clientName})</option>)}
              </select>
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>البيان / التفاصيل</label>
              <input type="text" className={styles.formInput} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <button className={styles.submitBtn} onClick={handleSave}>تسجيل الحركة</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loaderWrapper}><Loader2 className="animate-spin" size={40} /></div>
        ) : records.length === 0 ? (
          <div className={styles.emptyState}>لا توجد حركات مالية مسجلة.</div>
        ) : (
          <table className={styles.requestsTable}>
            <thead>
              <tr>
                <th>التاريخ / Date</th>
                <th>البيان / Description</th>
                <th>التصنيف / Category</th>
                <th>المشروع / Project</th>
                <th>المبلغ / Amount</th>
                <th>الإجراءات / Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(rec => (
                <tr key={rec.id}>
                  <td>{new Date(rec.date).toLocaleDateString('ar-EG')}</td>
                  <td className={styles.clientName}>{rec.description}</td>
                  <td>{rec.category}</td>
                  <td>{rec.relatedProject?.kitchenName || '-'}</td>
                  <td>
                    <span style={{ color: rec.type === 'Income' ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                      {rec.type === 'Income' ? '+' : '-'}{rec.amount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(rec.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>
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
