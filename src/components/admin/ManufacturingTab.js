import { useState, useEffect } from 'react';
import { Loader2, Trash2, Edit, Plus, Wrench, ChevronDown, ChevronUp, Save, DollarSign } from 'lucide-react';
import styles from '@/app/admin/Admin.module.css';

export default function ManufacturingTab({ userRole, token }) {
  const [projects, setProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [formData, setFormData] = useState({ 
    kitchenName: '', 
    clientName: '', 
    phone: '', 
    woodenType: '', 
    accessories: '', 
    linkedProject: '' 
  });

  const stages = ['Measurement', 'Design', 'Contract', 'Cutting', 'Assembling', 'Finishing', 'Delivery', 'Installation'];

  useEffect(() => {
    fetchProjects();
    fetchPublicProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/manufacturing', { headers: { 'x-auth-token': token } });
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

  const fetchPublicProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setPublicProjects(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProject = async () => {
    const payload = { ...formData };
    if (!payload.linkedProject) delete payload.linkedProject;

    try {
      const res = await fetch('/api/manufacturing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchProjects();
        setShowAddForm(false);
        setFormData({ kitchenName: '', clientName: '', phone: '', woodenType: '', accessories: '', linkedProject: '' });
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStage = async (projectId, stageIndex, stageData) => {
    const project = projects.find(p => p.id === projectId);
    const updatedStagesData = [...project.stagesData];
    updatedStagesData[stageIndex] = { ...updatedStagesData[stageIndex], ...stageData };

    if (stageData.status === 'Completed') {
      updatedStagesData[stageIndex].completedAt = new Date();
    }

    try {
      const res = await fetch('/api/manufacturing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ id: projectId, stagesData: updatedStagesData })
      });
      if (res.ok) fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCost = async (projectId, stageIndex, amount, desc) => {
    if (!amount || amount <= 0) return;
    const project = projects.find(p => p.id === projectId);
    
    const updatedStagesData = [...project.stagesData];
    updatedStagesData[stageIndex].costIncurred = (updatedStagesData[stageIndex].costIncurred || 0) + Number(amount);

    try {
      const res = await fetch('/api/manufacturing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ 
          id: projectId, 
          stagesData: updatedStagesData,
          totalCost: (project.totalCost || 0) + Number(amount),
          newExpense: { amount: Number(amount), description: desc || `Cost for stage: ${updatedStagesData[stageIndex].name}` }
        })
      });
      if (res.ok) {
        alert('تم إضافة التكلفة وتحويلها لقسم الحسابات بنجاح!');
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (userRole !== 'Admin') return alert('غير مصرح لك بالحذف');
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/manufacturing?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (res.ok) fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const isSales = userRole === 'Sales';

  return (
    <div className={styles.tabContentPanel}>
      <div className={styles.panelHeader}>
        <h2>إدارة التصنيع (Manufacturing)</h2>
        {!isSales && (
          <button className={styles.submitBtn} onClick={() => setShowAddForm(!showAddForm)} style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0 }}>
            <Plus size={18} /> إضافة مشروع تصنيع
          </button>
        )}
      </div>

      {showAddForm && !isSales && (
        <div className={styles.projectFormCard} style={{ marginBottom: '2rem' }}>
          <h3>مشروع جديد</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>اسم المطبخ / المشروع *</label>
              <input type="text" className={styles.formInput} value={formData.kitchenName} onChange={e => setFormData({...formData, kitchenName: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label>اسم العميل *</label>
              <input type="text" className={styles.formInput} value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} required />
            </div>
            <div className={styles.formGroup}>
              <label>رقم الهاتف</label>
              <input type="text" className={styles.formInput} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>ربط بمشروع في المعرض (اختياري)</label>
              <select className={styles.formInput} value={formData.linkedProject} onChange={e => setFormData({...formData, linkedProject: e.target.value})}>
                <option value="">بدون ربط</option>
                {publicProjects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>نوع الخشب</label>
              <input type="text" className={styles.formInput} value={formData.woodenType} onChange={e => setFormData({...formData, woodenType: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>الاكسسوارات</label>
              <input type="text" className={styles.formInput} value={formData.accessories} onChange={e => setFormData({...formData, accessories: e.target.value})} />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <button className={styles.submitBtn} onClick={handleSaveProject}>بدء التصنيع</button>
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
                <th>التكلفة الحالية / Cost</th>
                <th>تفاصيل الصنع / Details</th>
                <th>الإجراءات / Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(proj => (
                <tr key={proj.id} style={{ display: 'table-row' }}>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <div className={styles.clientName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
                        <Wrench size={16} style={{ color: 'var(--orange)' }} />
                        {proj.kitchenName}
                      </div>
                      <div style={{ minWidth: '150px' }}>{proj.clientName}</div>
                      <div style={{ minWidth: '150px', color: '#ef4444', fontWeight: 'bold' }}>{proj.totalCost?.toLocaleString()} EGP</div>
                      
                      <button 
                        onClick={() => setExpandedId(expandedId === proj.id ? null : proj.id)}
                        className={styles.submitBtn} 
                        style={{ padding: '0.4rem 1rem', width: 'auto', margin: 0, background: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}
                      >
                        {expandedId === proj.id ? <><ChevronUp size={16}/> إخفاء المراحل</> : <><ChevronDown size={16}/> عرض تفاصيل المراحل</>}
                      </button>

                      <div style={{ marginLeft: '1rem' }}>
                        {userRole === 'Admin' && <button onClick={() => handleDelete(proj.id)} className={styles.deleteBtn}><Trash2 size={16} /></button>}
                      </div>
                    </div>

                    {expandedId === proj.id && (
                      <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          <div><strong>نوع الخشب:</strong> {proj.woodenType || 'غير محدد'}</div>
                          <div><strong>الاكسسوارات:</strong> {proj.accessories || 'غير محدد'}</div>
                          {proj.linkedProject && <div><strong>مشروع مرتبط:</strong> {proj.linkedProject.title}</div>}
                        </div>

                        <h4>مراحل التصنيع (Production Stages)</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                          {proj.stagesData?.map((stage, idx) => (
                            <div key={stage._id || idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1fr', gap: '1rem', alignItems: 'flex-start' }}>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <strong style={{ color: 'var(--orange)', fontSize: '1.1rem' }}>{stage.name}</strong>
                                <select 
                                  className={styles.formInput} 
                                  value={stage.status} 
                                  onChange={e => handleUpdateStage(proj.id, idx, { status: e.target.value })}
                                  style={{ padding: '0.4rem', fontSize: '0.9rem' }}
                                  disabled={isSales}
                                >
                                  <option value="Pending">قيد الانتظار (Pending)</option>
                                  <option value="In Progress">جاري العمل (In Progress)</option>
                                  <option value="Completed">مكتمل (Completed)</option>
                                </select>
                                {stage.status === 'Completed' && stage.completedAt && (
                                  <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>اكتمل: {new Date(stage.completedAt).toLocaleDateString('ar-EG')}</span>
                                )}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>موعد التسليم</label>
                                <input 
                                  type="date" 
                                  className={styles.formInput} 
                                  value={stage.deadline ? new Date(stage.deadline).toISOString().split('T')[0] : ''} 
                                  onChange={e => handleUpdateStage(proj.id, idx, { deadline: e.target.value })}
                                  style={{ padding: '0.4rem' }}
                                  disabled={isSales}
                                />
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ملاحظات / نواقص</label>
                                <textarea 
                                  className={styles.formInput} 
                                  defaultValue={stage.notes} 
                                  onBlur={e => handleUpdateStage(proj.id, idx, { notes: e.target.value })}
                                  placeholder="أضف تعليق..."
                                  style={{ padding: '0.4rem', minHeight: '60px', resize: 'vertical' }}
                                  disabled={isSales}
                                />
                              </div>

                              {!isSales && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>تكلفة المرحلة (Cost: {stage.costIncurred || 0})</label>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input 
                                      type="number" 
                                      id={`cost-${proj.id}-${idx}`}
                                      className={styles.formInput} 
                                      placeholder="مبلغ"
                                      style={{ padding: '0.4rem', width: '100px' }}
                                    />
                                    <button 
                                      onClick={() => {
                                        const input = document.getElementById(`cost-${proj.id}-${idx}`);
                                        handleAddCost(proj.id, idx, input.value, `مصروفات مرحلة ${stage.name}`);
                                        input.value = '';
                                      }}
                                      style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem', cursor: 'pointer' }}
                                    >
                                      <DollarSign size={16} />
                                    </button>
                                  </div>
                                </div>
                              )}

                            </div>
                          ))}
                        </div>

                      </div>
                    )}
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
