"use client";
import { useState, useEffect } from 'react';
import { Loader2, Trash2, Calendar, Phone, MapPin, Sparkles, Key, LogOut, Upload, Image as ImageIcon } from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'projects'
  
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    titleEn: '', titleAr: '', descEn: '', descAr: '', category: 'Modern'
  });
  const [images, setImages] = useState(null);

  useEffect(() => {
    const savedPasskey = localStorage.getItem('admin_passkey');
    if (savedPasskey) {
      verifyAndFetch(savedPasskey);
    }
  }, []);

  const verifyAndFetch = async (key) => {
    setLoading(true);
    setLoginError('');
    try {
      const [reqRes, projRes] = await Promise.all([
        fetch('/api/requests', { headers: { 'x-admin-passkey': key } }),
        fetch('/api/projects', { headers: { 'x-admin-passkey': key } })
      ]);

      const reqData = await reqRes.json();
      const projData = await projRes.json();

      if (reqRes.ok && reqData.success) {
        setRequests(reqData.requests);
        if (projRes.ok && projData.success) {
          setProjects(projData.projects);
        }
        localStorage.setItem('admin_passkey', key);
        setIsLoggedIn(true);
      } else {
        setLoginError('رمز المرور غير صحيح / Invalid Passkey');
        localStorage.removeItem('admin_passkey');
      }
    } catch (err) {
      console.error(err);
      setLoginError('خطأ في الاتصال بالسيرفر / Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!passkey.trim()) return;
    verifyAndFetch(passkey);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_passkey');
    setIsLoggedIn(false);
    setRequests([]);
    setProjects([]);
    setPasskey('');
  };

  const handleDeleteRequest = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟ Are you sure?')) return;
    setDeletingId(id);
    const key = localStorage.getItem('admin_passkey');

    try {
      const response = await fetch(`/api/requests?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': key },
      });

      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        alert('فشل الحذف / Delete failed');
      }
    } catch (err) {
      alert('خطأ في الشبكة / Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟ Are you sure?')) return;
    setDeletingId(id);
    const key = localStorage.getItem('admin_passkey');

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passkey': key },
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      } else {
        alert('فشل الحذف / Delete failed');
      }
    } catch (err) {
      alert('خطأ في الشبكة / Network error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!images || images.length === 0) {
      alert('الرجاء اختيار صورة واحدة على الأقل / Please select at least one image');
      return;
    }

    setUploading(true);
    const key = localStorage.getItem('admin_passkey');
    const formData = new FormData();
    formData.append('titleEn', newProject.titleEn);
    formData.append('titleAr', newProject.titleAr);
    formData.append('descEn', newProject.descEn);
    formData.append('descAr', newProject.descAr);
    
    // Check if custom category is selected
    if (newProject.category === 'custom') {
      if (!newProject.customCategory) {
        alert('الرجاء كتابة التصنيف / Please type the custom category');
        setUploading(false);
        return;
      }
      formData.append('category', newProject.customCategory);
    } else {
      formData.append('category', newProject.category);
    }

    Array.from(images).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'x-admin-passkey': key },
        body: formData
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProjects([data.project, ...projects]);
        setNewProject({ titleEn: '', titleAr: '', descEn: '', descAr: '', category: 'Modern' });
        setImages(null);
        e.target.reset();
        alert('تم رفع المشروع بنجاح / Project uploaded successfully');
      } else {
        alert('فشل الرفع: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('خطأ في الشبكة / Network error');
    } finally {
      setUploading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.loginContainer}>
        <form onSubmit={handleLogin} className={styles.loginCard}>
          <div className={styles.loginIcon}>
            <Key size={32} />
          </div>
          <h2>لوحة التحكم | Admin Login</h2>
          <p>أدخل رمز المرور للمتابعة / Enter passkey to proceed</p>
          <input
            type="password"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="رمز المرور / Passkey"
            className={styles.loginInput}
            required
          />
          {loginError && <p className={styles.errorMessage}>{loginError}</p>}
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'دخول / Login'}
          </button>
        </form>
      </div>
    );
  }

  const stats = {
    total: requests.length,
    modern: requests.filter(r => r.style === 'modern').length,
    classic: requests.filter(r => r.style === 'classic').length,
    neoClassic: requests.filter(r => r.style === 'neo-classic').length,
  };

  return (
    <div className={styles.adminDashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <h1>لوحة التحكم</h1>
          <p>إدارة الطلبات والمشاريع</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} />
          <span>خروج / Logout</span>
        </button>
      </header>

      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'requests' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          الطلبات / Requests
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'projects' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          المشاريع / Projects
        </button>
      </div>

      {activeTab === 'requests' && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>إجمالي الطلبات</h3>
              <div className={styles.statNumber}>{stats.total}</div>
            </div>
            <div className={styles.statCard}>
              <h3>مطابخ مودرن</h3>
              <div className={styles.statNumber} style={{ color: 'var(--orange)' }}>{stats.modern}</div>
            </div>
            <div className={styles.statCard}>
              <h3>مطابخ كلاسيك</h3>
              <div className={styles.statNumber} style={{ color: 'var(--gold)' }}>{stats.classic}</div>
            </div>
            <div className={styles.statCard}>
              <h3>نيو كلاسيك</h3>
              <div className={styles.statNumber} style={{ color: '#5b89ba' }}>{stats.neoClassic}</div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loaderWrapper}>
                <Loader2 className="animate-spin" size={40} />
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className={styles.emptyState}>
                <p>لا توجد طلبات تصميم حتى الآن.</p>
              </div>
            ) : (
              <table className={styles.requestsTable}>
                <thead>
                  <tr>
                    <th>الاسم الكامل / Name</th>
                    <th>الهاتف / Phone</th>
                    <th>المساحة / Area</th>
                    <th>الستايل / Style</th>
                    <th>تاريخ الطلب / Date</th>
                    <th>إجراءات / Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td className={styles.clientName}>{req.name}</td>
                      <td>
                        <div className={styles.phoneGroup}>
                          <span dir="ltr">{req.phone}</span>
                          <a href={`tel:${req.phone}`} className={styles.actionIcon} title="اتصال هاتفي">
                            <Phone size={16} />
                          </a>
                          <a 
                            href={`https://wa.me/${req.phone.replace(/[\s\+]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.actionIcon} 
                            style={{ color: '#25D366' }}
                          >
                            WS
                          </a>
                        </div>
                      </td>
                      <td>
                        <div className={styles.iconCell}>
                          <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
                          <span>{req.area}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.iconCell}>
                          <Sparkles size={16} style={{ color: 'var(--gold)' }} />
                          <span className={styles.styleBadge}>
                            {req.style === 'modern' ? 'مودرن' : req.style === 'classic' ? 'كلاسيك' : req.style === 'neo-classic' ? 'نيو كلاسيك' : req.style}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.iconCell}>
                          <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                          <span>{new Date(req.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          className={styles.deleteBtn}
                          disabled={deletingId === req.id}
                        >
                          {deletingId === req.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'projects' && (
        <div className={styles.projectsManager}>
          <div className={styles.projectFormCard}>
            <h2>إضافة مشروع جديد / Add New Project</h2>
            <form onSubmit={handleProjectSubmit} className={styles.formGrid}>
              
              <div className={styles.formGroup}>
                <label>اسم المشروع (عربي)</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  required
                  value={newProject.titleAr}
                  onChange={e => setNewProject({...newProject, titleAr: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Project Name (English)</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  required
                  value={newProject.titleEn}
                  onChange={e => setNewProject({...newProject, titleEn: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label>التصنيف / Category</label>
                <select 
                  className={styles.formInput}
                  value={newProject.category}
                  onChange={e => setNewProject({...newProject, category: e.target.value})}
                >
                  <option value="Modern">Modern / مودرن</option>
                  <option value="Classic">Classic / كلاسيك</option>
                  <option value="Semi-Classic">Semi-Classic / نيو كلاسيك</option>
                  <option value="custom">إضافة تصنيف جديد / Add Custom</option>
                </select>
              </div>

              {newProject.category === 'custom' && (
                <div className={styles.formGroup}>
                  <label>التصنيف الجديد / Custom Category</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    placeholder="e.g. Minimalist"
                    value={newProject.customCategory || ''}
                    onChange={e => setNewProject({...newProject, customCategory: e.target.value})}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>الوصف (عربي)</label>
                <textarea 
                  className={styles.formInput}
                  value={newProject.descAr}
                  onChange={e => setNewProject({...newProject, descAr: e.target.value})}
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label>Description (English)</label>
                <textarea 
                  className={styles.formInput}
                  value={newProject.descEn}
                  onChange={e => setNewProject({...newProject, descEn: e.target.value})}
                ></textarea>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>صور المشروع / Project Images</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  className={styles.formInput}
                  onChange={e => setImages(e.target.files)}
                  required
                />
                <small style={{ color: 'var(--text-secondary)' }}>
                  يمكنك تحديد عدة صور مرة واحدة. الصورة الأولى ستكون الغلاف.
                </small>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <button type="submit" className={styles.submitBtn} disabled={uploading}>
                  {uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={20} />}
                  <span>{uploading ? 'جاري الرفع...' : 'رفع المشروع / Upload Project'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className={styles.projectList}>
            {projects.map(project => (
              <div key={project.id} className={styles.projectCard}>
                <img src={project.images[0]} alt={project.title.en} className={styles.projectImage} />
                <button 
                  className={styles.deleteProjectBtn}
                  onClick={() => handleDeleteProject(project.id)}
                  disabled={deletingId === project.id}
                >
                  {deletingId === project.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                </button>
                <div className={styles.projectInfo}>
                  <span className={styles.projectCategory}>{project.category}</span>
                  <h3>{project.title.ar} / {project.title.en}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', alignItems: 'center' }}>
                    <ImageIcon size={14} />
                    <span>{project.images.length} صور / Photos</span>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                لا توجد مشاريع مضافة بعد / No projects added yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
