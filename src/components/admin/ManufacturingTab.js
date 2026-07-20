import { useState, useEffect } from 'react';
import { Loader2, Trash2, Edit, Plus, Wrench, ChevronDown, ChevronUp, Save, DollarSign, Printer, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import styles from '@/app/admin/Admin.module.css';

export default function ManufacturingTab({ userRole, token }) {
  const [projects, setProjects] = useState([]);
  const [publicProjects, setPublicProjects] = useState([]);
  const [approvedLeads, setApprovedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const emptyFormData = { 
    kitchenName: '', 
    clientName: '', 
    phone: '', 
    linkedProject: '',
    woodenBulks: [],
    accessories: {
      hinges: [],
      drawerRunners: [],
      skirting: false
    }
  };

  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    fetchProjects();
    fetchPublicProjects();
    fetchApprovedLeads();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/manufacturing', { headers: { 'x-auth-token': token } });
      const data = await res.json();
      if (data.success) setProjects(data.projects);
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
      if (data.success) setPublicProjects(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApprovedLeads = async () => {
    try {
      const key = localStorage.getItem('admin_passkey');
      const res = await fetch('/api/crm', { headers: { 'x-admin-passkey': key || token } });
      const data = await res.json();
      if (data.success) {
        const approved = data.leads.filter(l => l.downPaymentConfirmed);
        setApprovedLeads(approved);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProject = async () => {
    const payload = { ...formData };
    if (!payload.linkedProject) delete payload.linkedProject;

    try {
      const method = editingId ? 'PUT' : 'POST';
      if (editingId) payload.id = editingId;
      
      const res = await fetch('/api/manufacturing', {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchProjects();
        setShowAddForm(false);
        setEditingId(null);
        setFormData(emptyFormData);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditForm = (proj) => {
    setFormData({
      kitchenName: proj.kitchenName,
      clientName: proj.clientName,
      phone: proj.phone || '',
      linkedProject: proj.linkedProject?._id || '',
      woodenBulks: proj.woodenBulks || [],
      accessories: proj.accessories || { hinges: [], drawerRunners: [], skirting: false }
    });
    setEditingId(proj.id);
    setShowAddForm(true);
    window.scrollTo(0, 0);
  };

  const handleUpdateStage = async (projectId, stageIndex, stageData) => {
    const project = projects.find(p => p.id === projectId);
    const updatedStagesData = [...project.stagesData];
    updatedStagesData[stageIndex] = { ...updatedStagesData[stageIndex], ...stageData };

    if (stageData.status === 'Completed') {
      // Intercept 'Completed' and push to 'Pending Approval' instead
      updatedStagesData[stageIndex].status = 'Pending Approval';
      updatedStagesData[stageIndex].approvalStatus = 'Pending Approval';
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

  const handleApproveStage = async (projectId, stageIndex, isApproved) => {
    const project = projects.find(p => p.id === projectId);
    const updatedStagesData = [...project.stagesData];
    
    if (isApproved) {
      updatedStagesData[stageIndex].status = 'Completed';
      updatedStagesData[stageIndex].approvalStatus = 'Approved';
      updatedStagesData[stageIndex].approvedBy = userRole;
      updatedStagesData[stageIndex].completedAt = new Date();
    } else {
      updatedStagesData[stageIndex].status = 'In Progress';
      updatedStagesData[stageIndex].approvalStatus = 'Rejected';
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

  const handleGeneratePO = async (proj) => {
    try {
      const res = await fetch('/api/purchasing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          jobOrderId: proj.id,
          kitchenName: proj.kitchenName,
          clientName: proj.clientName,
          materials: {
            woodenBulks: proj.woodenBulks,
            accessories: proj.accessories
          }
        })
      });
      if (res.ok) {
        alert('تم إنشاء طلب الشراء بنجاح وإرساله لقسم المشتريات!');
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const printJobOrder = (proj) => {
    const printWindow = window.open('', '_blank');
    const stagesHtml = proj.stagesData.map(s => `<tr><td>${s.name}</td><td>${s.status}</td><td>${s.completedAt ? new Date(s.completedAt).toLocaleDateString() : '-'}</td></tr>`).join('');
    const woodHtml = proj.woodenBulks?.map(w => `<li>${w.bulkType} - ${w.color} - عدد ${w.numberOfBoards} (${w.purpose})</li>`).join('') || 'لا يوجد';
    const hingesHtml = proj.accessories?.hinges?.map(h => `<li>مفصلة ${h.hingeType} (${h.brand}) - الكمية: ${h.quantity}</li>`).join('') || 'لا يوجد';
    const runnersHtml = proj.accessories?.drawerRunners?.map(r => `<li>مجرى ${r.mountType} مقاس ${r.size} (${r.brand}) - الكمية: ${r.quantity}</li>`).join('') || 'لا يوجد';
    
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>أمر تشغيل - ${proj.kitchenName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body onload="window.print();">
          <div class="header">
            <h1>أمر تشغيل (Job Order)</h1>
            <p><strong>اسم المشروع:</strong> ${proj.kitchenName}</p>
            <p><strong>اسم العميل:</strong> ${proj.clientName}</p>
            <p><strong>رقم الهاتف:</strong> ${proj.phone || '-'}</p>
          </div>
          
          <h3>المواد المطلوبة:</h3>
          <h4>الأخشاب:</h4>
          <ul>${woodHtml}</ul>
          <h4>الإكسسوارات:</h4>
          <ul>${hingesHtml}</ul>
          <ul>${runnersHtml}</ul>
          ${proj.accessories?.skirting ? '<p><strong>ملاحظة:</strong> يوجد سكلو (Skirting)</p>' : ''}
          
          <h3>مراحل التصنيع:</h3>
          <table>
            <tr><th>المرحلة</th><th>الحالة</th><th>تاريخ الانتهاء</th></tr>
            ${stagesHtml}
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isSales = userRole === 'Sales';

  return (
    <div className={styles.tabContentPanel}>
      <div className={styles.panelHeader}>
        <h2>أوامر التشغيل (Job Orders)</h2>
        {!isSales && (
          <button className={styles.submitBtn} onClick={() => {
            setFormData(emptyFormData);
            setEditingId(null);
            setShowAddForm(!showAddForm);
          }} style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0 }}>
            <Plus size={18} /> إضافة أمر تشغيل يدوي
          </button>
        )}
      </div>

      {showAddForm && !isSales && (
        <div className={styles.projectFormCard} style={{ marginBottom: '2rem' }}>
          <h3>{editingId ? 'تعديل أمر التشغيل' : 'أمر تشغيل جديد'}</h3>
          <div className={styles.formGrid}>
            {!editingId && (
              <div className={styles.formGroup}>
                <label>العميل (من المبيعات - تم التأكيد المالي) *</label>
                <select className={styles.formInput} onChange={e => {
                  const lead = approvedLeads.find(l => l.id === e.target.value);
                  if (lead) setFormData({...formData, clientName: lead.clientName, phone: lead.phone, kitchenName: `مطبخ ${lead.clientName}`});
                }}>
                  <option value="">-- اختر العميل --</option>
                  {approvedLeads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.clientName} - {lead.phone}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className={styles.formGroup}>
              <label>اسم المطبخ / المشروع *</label>
              <input type="text" className={styles.formInput} value={formData.kitchenName} onChange={e => setFormData({...formData, kitchenName: e.target.value})} required />
            </div>

            <div className={styles.formGroup}>
              <label>ربط بمشروع في المعرض (اختياري)</label>
              <select className={styles.formInput} value={formData.linkedProject} onChange={e => setFormData({...formData, linkedProject: e.target.value})}>
                <option value="">بدون ربط</option>
                {publicProjects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
              <label style={{ color: 'var(--orange)', fontSize: '1.2rem', marginBottom: '1rem', display: 'block' }}>أنواع الخشب المستخدم (Wooden Bulks)</label>
              
              {formData.woodenBulks.map((bulk, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="النوع (Type)" className={styles.formInput} value={bulk.bulkType} onChange={e => {
                    const newBulks = [...formData.woodenBulks];
                    newBulks[idx].bulkType = e.target.value;
                    setFormData({...formData, woodenBulks: newBulks});
                  }} style={{ flex: 1, minWidth: '120px' }} />
                  <input type="number" placeholder="عدد الألواح" className={styles.formInput} value={bulk.numberOfBoards} onChange={e => {
                    const newBulks = [...formData.woodenBulks];
                    newBulks[idx].numberOfBoards = Number(e.target.value);
                    setFormData({...formData, woodenBulks: newBulks});
                  }} style={{ flex: 1, minWidth: '100px' }} />
                  <select className={styles.formInput} value={bulk.color} onChange={e => {
                    const newBulks = [...formData.woodenBulks];
                    newBulks[idx].color = e.target.value;
                    setFormData({...formData, woodenBulks: newBulks});
                  }} style={{ flex: 1, minWidth: '100px' }}>
                    <option value="">اللون</option>
                    <option value="white">أبيض</option>
                    <option value="wooden">خشبي</option>
                    <option value="laminated">لامينيت</option>
                  </select>
                  <select className={styles.formInput} value={bulk.purpose} onChange={e => {
                    const newBulks = [...formData.woodenBulks];
                    newBulks[idx].purpose = e.target.value;
                    setFormData({...formData, woodenBulks: newBulks});
                  }} style={{ flex: 1, minWidth: '100px' }}>
                    <option value="">الاستخدام</option>
                    <option value="ضلفة">ضلفة</option>
                    <option value="جسم">جسم</option>
                    <option value="ضهر">ضهر</option>
                  </select>
                  <button className={styles.deleteBtn} onClick={() => {
                    const newBulks = formData.woodenBulks.filter((_, i) => i !== idx);
                    setFormData({...formData, woodenBulks: newBulks});
                  }}><Trash2 size={16} /></button>
                </div>
              ))}
              <button className={styles.submitBtn} style={{ width: 'auto', background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => {
                setFormData({...formData, woodenBulks: [...formData.woodenBulks, { bulkType: '', numberOfBoards: 0, color: '', purpose: '' }]})
              }}>
                <Plus size={16} /> إضافة خشب
              </button>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
              <label style={{ color: 'var(--orange)', fontSize: '1.2rem', marginBottom: '1rem', display: 'block' }}>الإكسسوارات (Accessories)</label>
              
              {/* Skirting */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="skirting" checked={formData.accessories.skirting} onChange={e => {
                  setFormData({...formData, accessories: {...formData.accessories, skirting: e.target.checked}})
                }} />
                <label htmlFor="skirting" style={{ margin: 0 }}>يوجد سكلو (Skirting)</label>
              </div>

              {/* Hinges */}
              <label style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>المفصلات (Hinges)</label>
              {formData.accessories.hinges.map((hinge, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', flexWrap: 'wrap' }}>
                  <select className={styles.formInput} value={hinge.hingeType} onChange={e => {
                    const newHinges = [...formData.accessories.hinges];
                    newHinges[idx].hingeType = e.target.value;
                    setFormData({...formData, accessories: {...formData.accessories, hinges: newHinges}});
                  }} style={{ flex: 1, minWidth: '120px' }}>
                    <option value="">النوع</option>
                    <option value="عدلة">عدلة</option>
                    <option value="نص ركبة">نص ركبة</option>
                    <option value="ركبة">ركبة</option>
                    <option value="عقربة">عقربة</option>
                    <option value="مشتركه">مشتركه</option>
                    <option value="بلايند كورنر">بلايند كورنر</option>
                  </select>
                  <select className={styles.formInput} value={hinge.brand} onChange={e => {
                    const newHinges = [...formData.accessories.hinges];
                    newHinges[idx].brand = e.target.value;
                    setFormData({...formData, accessories: {...formData.accessories, hinges: newHinges}});
                  }} style={{ flex: 1, minWidth: '100px' }}>
                    <option value="">الماركة</option>
                    <option value="بلومو">بلومو</option>
                    <option value="تاتيوس">تاتيوس</option>
                    <option value="اندكس">اندكس</option>
                  </select>
                  <input type="number" placeholder="الكمية" className={styles.formInput} value={hinge.quantity} onChange={e => {
                    const newHinges = [...formData.accessories.hinges];
                    newHinges[idx].quantity = Number(e.target.value);
                    setFormData({...formData, accessories: {...formData.accessories, hinges: newHinges}});
                  }} style={{ flex: 1, minWidth: '80px' }} />
                  <input type="number" placeholder="التكلفة (Cost)" className={styles.formInput} value={hinge.cost} onChange={e => {
                    const newHinges = [...formData.accessories.hinges];
                    newHinges[idx].cost = Number(e.target.value);
                    setFormData({...formData, accessories: {...formData.accessories, hinges: newHinges}});
                  }} style={{ flex: 1, minWidth: '100px' }} />
                  <button className={styles.deleteBtn} onClick={() => {
                    const newHinges = formData.accessories.hinges.filter((_, i) => i !== idx);
                    setFormData({...formData, accessories: {...formData.accessories, hinges: newHinges}});
                  }}><Trash2 size={16} /></button>
                </div>
              ))}
              <button className={styles.submitBtn} style={{ width: 'auto', background: 'rgba(255,255,255,0.1)', color: '#fff', marginBottom: '1.5rem' }} onClick={() => {
                setFormData({...formData, accessories: {...formData.accessories, hinges: [...formData.accessories.hinges, { hingeType: '', brand: '', quantity: 1, cost: 0 }]}})
              }}>
                <Plus size={16} /> إضافة مفصلة
              </button>

              {/* Drawer Runners */}
              <label style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'block' }}>مجر الأدراج (Drawer Runners)</label>
              {formData.accessories.drawerRunners.map((runner, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', flexWrap: 'wrap' }}>
                  <select className={styles.formInput} value={runner.mountType} onChange={e => {
                    const newRunners = [...formData.accessories.drawerRunners];
                    newRunners[idx].mountType = e.target.value;
                    setFormData({...formData, accessories: {...formData.accessories, drawerRunners: newRunners}});
                  }} style={{ flex: 1, minWidth: '100px' }}>
                    <option value="">التركيب</option>
                    <option value="سفلية">سفلية</option>
                    <option value="جانبية">جانبية</option>
                  </select>
                  <select className={styles.formInput} value={runner.size} onChange={e => {
                    const newRunners = [...formData.accessories.drawerRunners];
                    newRunners[idx].size = e.target.value;
                    setFormData({...formData, accessories: {...formData.accessories, drawerRunners: newRunners}});
                  }} style={{ flex: 1, minWidth: '100px' }}>
                    <option value="">المقاس</option>
                    <option value="35">35</option>
                    <option value="40">40</option>
                    <option value="45">45</option>
                    <option value="50">50</option>
                  </select>
                  <select className={styles.formInput} value={runner.brand} onChange={e => {
                    const newRunners = [...formData.accessories.drawerRunners];
                    newRunners[idx].brand = e.target.value;
                    setFormData({...formData, accessories: {...formData.accessories, drawerRunners: newRunners}});
                  }} style={{ flex: 1, minWidth: '100px' }}>
                    <option value="">الماركة</option>
                    <option value="بلوم">بلوم</option>
                    <option value="تاتيوس">تاتيوس</option>
                    <option value="اراي">اراي</option>
                    <option value="هيتش">هيتش</option>
                    <option value="ساميت">ساميت</option>
                    <option value="اندكس">اندكس</option>
                  </select>
                  <input type="number" placeholder="الكمية" className={styles.formInput} value={runner.quantity} onChange={e => {
                    const newRunners = [...formData.accessories.drawerRunners];
                    newRunners[idx].quantity = Number(e.target.value);
                    setFormData({...formData, accessories: {...formData.accessories, drawerRunners: newRunners}});
                  }} style={{ flex: 1, minWidth: '80px' }} />
                  <input type="number" placeholder="التكلفة (Cost)" className={styles.formInput} value={runner.cost} onChange={e => {
                    const newRunners = [...formData.accessories.drawerRunners];
                    newRunners[idx].cost = Number(e.target.value);
                    setFormData({...formData, accessories: {...formData.accessories, drawerRunners: newRunners}});
                  }} style={{ flex: 1, minWidth: '100px' }} />
                  <button className={styles.deleteBtn} onClick={() => {
                    const newRunners = formData.accessories.drawerRunners.filter((_, i) => i !== idx);
                    setFormData({...formData, accessories: {...formData.accessories, drawerRunners: newRunners}});
                  }}><Trash2 size={16} /></button>
                </div>
              ))}
              <button className={styles.submitBtn} style={{ width: 'auto', background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => {
                setFormData({...formData, accessories: {...formData.accessories, drawerRunners: [...formData.accessories.drawerRunners, { mountType: '', size: '', brand: '', quantity: 1, cost: 0 }]}})
              }}>
                <Plus size={16} /> إضافة مجرى درج
              </button>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <button className={styles.submitBtn} onClick={handleSaveProject} disabled={!formData.clientName || !formData.kitchenName}>
                {editingId ? 'حفظ التعديلات' : 'إنشاء أمر التشغيل'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loaderWrapper}><Loader2 className="animate-spin" size={40} /></div>
        ) : projects.length === 0 ? (
          <div className={styles.emptyState}>لا توجد أوامر تشغيل حالياً.</div>
        ) : (
          <table className={styles.requestsTable}>
            <thead>
              <tr>
                <th>أمر التشغيل / Job Order</th>
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
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', flexWrap: 'wrap', gap: '1rem' }}>
                      <div className={styles.clientName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
                        <Wrench size={16} style={{ color: 'var(--orange)' }} />
                        {proj.kitchenName}
                      </div>
                      <div style={{ minWidth: '150px' }}>{proj.clientName}</div>
                      <div style={{ minWidth: '150px', color: '#ef4444', fontWeight: 'bold' }}>{proj.totalCost?.toLocaleString()} EGP</div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setExpandedId(expandedId === proj.id ? null : proj.id)} className={styles.submitBtn} style={{ padding: '0.4rem 1rem', width: 'auto', margin: 0, background: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--foreground)' }}>
                          {expandedId === proj.id ? <><ChevronUp size={16}/> إخفاء</> : <><ChevronDown size={16}/> تفاصيل ومراحل</>}
                        </button>

                        <button onClick={() => printJobOrder(proj)} className={styles.submitBtn} style={{ padding: '0.4rem 1rem', width: 'auto', margin: 0, background: '#475569' }}>
                          <Printer size={16} /> طباعة
                        </button>
                        
                        {(userRole === 'Admin' || userRole === 'AccountManager') && (
                          <button onClick={() => openEditForm(proj)} className={styles.submitBtn} style={{ padding: '0.4rem 1rem', width: 'auto', margin: 0, background: '#3b82f6' }}>
                            <Edit size={16} /> تعديل
                          </button>
                        )}

                        {(userRole === 'Admin' || userRole === 'Purchasing') && (
                          <button onClick={() => handleGeneratePO(proj)} className={styles.submitBtn} style={{ padding: '0.4rem 1rem', width: 'auto', margin: 0, background: '#10b981' }}>
                            <ShoppingCart size={16} /> إصدار طلب شراء
                          </button>
                        )}
                        
                        {userRole === 'Admin' && <button onClick={() => handleDelete(proj.id)} className={styles.deleteBtn} style={{ margin: 0 }}><Trash2 size={16} /></button>}
                      </div>
                    </div>

                    {expandedId === proj.id && (
                      <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        
                        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                          <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', flex: '1 1 300px' }}>
                            <strong style={{ color: 'var(--orange)', display: 'block', marginBottom: '0.5rem' }}>الخشب المستخدم:</strong>
                            {proj.woodenBulks?.length > 0 ? proj.woodenBulks.map((b, i) => (
                              <div key={i}>- {b.bulkType} (عدد: {b.numberOfBoards}, لون: {b.color}, استخدام: {b.purpose})</div>
                            )) : 'لم يتم تحديد الخشب'}
                          </div>
                          
                          <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', flex: '1 1 300px' }}>
                            <strong style={{ color: 'var(--orange)', display: 'block', marginBottom: '0.5rem' }}>الإكسسوارات:</strong>
                            {proj.accessories?.skirting && <div>- يوجد سكلو</div>}
                            {proj.accessories?.hinges?.map((h, i) => (
                              <div key={i}>- مفصلة {h.hingeType} ({h.brand}) - الكمية: {h.quantity}</div>
                            ))}
                            {proj.accessories?.drawerRunners?.map((r, i) => (
                              <div key={i}>- مجرى درج {r.mountType} مقاس {r.size} ({r.brand}) - الكمية: {r.quantity}</div>
                            ))}
                          </div>
                          {proj.linkedProject && <div style={{ flex: '1 1 100%' }}><strong>مشروع مرتبط:</strong> {proj.linkedProject.title}</div>}
                        </div>

                        <h4>مراحل التصنيع (Production Stages & Approvals)</h4>
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
                                  disabled={isSales || stage.status === 'Completed' || stage.approvalStatus === 'Pending Approval'}
                                >
                                  <option value="Pending">قيد الانتظار (Pending)</option>
                                  <option value="In Progress">جاري العمل (In Progress)</option>
                                  <option value="Completed">طلب اعتماد (Complete Stage)</option>
                                </select>
                                
                                {stage.status === 'Completed' && (
                                  <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>معتمد بواسطة: {stage.approvedBy || 'Admin'}</span>
                                )}

                                {stage.approvalStatus === 'Pending Approval' && (
                                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', border: '1px solid var(--orange)', borderRadius: '4px', fontSize: '0.8rem' }}>
                                    <div>مطلوب الاعتماد من: {stage.approvalRoleRequired}</div>
                                    {(userRole === 'Admin' || userRole === stage.approvalRoleRequired) ? (
                                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button onClick={() => handleApproveStage(proj.id, idx, true)} style={{ flex: 1, background: '#22c55e', color: '#fff', border: 'none', padding: '0.2rem', borderRadius: '4px', cursor: 'pointer' }}><CheckCircle size={14} /></button>
                                        <button onClick={() => handleApproveStage(proj.id, idx, false)} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '0.2rem', borderRadius: '4px', cursor: 'pointer' }}><XCircle size={14} /></button>
                                      </div>
                                    ) : (
                                      <div style={{ color: '#ef4444', marginTop: '0.2rem' }}>لا تملك صلاحية الاعتماد</div>
                                    )}
                                  </div>
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
