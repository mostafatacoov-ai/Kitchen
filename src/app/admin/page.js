"use client";
import { useState, useEffect } from 'react';
import { Loader2, Key, LogOut, LayoutDashboard, Briefcase, Users, Wrench, DollarSign, MessageSquare } from 'lucide-react';
import styles from './Admin.module.css';

// Import Components
import RequestsTab from '@/components/admin/RequestsTab';
import ProjectsTab from '@/components/admin/ProjectsTab';
import CRMTab from '@/components/admin/CRMTab';
import ManufacturingTab from '@/components/admin/ManufacturingTab';
import HRTab from '@/components/admin/HRTab';
import AccountingTab from '@/components/admin/AccountingTab';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('requests');
  
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Projects Tab State
  const [uploading, setUploading] = useState(false);
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

  const navItems = [
    { id: 'requests', label: 'الطلبات الواردة', icon: MessageSquare },
    { id: 'crm', label: 'إدارة العملاء (CRM)', icon: Users },
    { id: 'projects', label: 'معرض المشاريع', icon: Briefcase },
    { id: 'manufacturing', label: 'إدارة التصنيع', icon: Wrench },
    { id: 'hr', label: 'شؤون الموظفين (HR)', icon: LayoutDashboard },
    { id: 'accounting', label: 'الحسابات والتكاليف', icon: DollarSign },
  ];

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>The Kitchen</h1>
          <p>نظام الإدارة المتكامل</p>
        </div>
        
        <nav className={styles.sidebarNav}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeTab === item.id ? styles.activeNavItem : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {activeTab === 'requests' && (
          <div className={styles.tabContentPanel}>
            <div className={styles.panelHeader}>
              <h2>الطلبات الواردة من الموقع</h2>
            </div>
            <RequestsTab 
              requests={requests} 
              loading={loading} 
              deletingId={deletingId} 
              handleDeleteRequest={handleDeleteRequest} 
            />
          </div>
        )}

        {activeTab === 'crm' && <CRMTab />}

        {activeTab === 'projects' && (
          <div className={styles.tabContentPanel}>
            <div className={styles.panelHeader}>
              <h2>معرض المشاريع</h2>
            </div>
            <ProjectsTab 
              projects={projects}
              handleDeleteProject={handleDeleteProject}
              deletingId={deletingId}
              handleProjectSubmit={handleProjectSubmit}
              newProject={newProject}
              setNewProject={setNewProject}
              setImages={setImages}
              uploading={uploading}
            />
          </div>
        )}

        {activeTab === 'manufacturing' && <ManufacturingTab />}
        
        {activeTab === 'hr' && <HRTab />}
        
        {activeTab === 'accounting' && <AccountingTab />}

      </main>
    </div>
  );
}
