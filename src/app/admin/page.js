"use client";
import { useState, useEffect } from 'react';
import { Loader2, Key, LogOut, LayoutDashboard, Briefcase, Users, Wrench, DollarSign, MessageSquare, UserPlus } from 'lucide-react';
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
  const [user, setUser] = useState(null); // { username, role }
  const [token, setToken] = useState('');
  
  // Auth Form State
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('');
  
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  
  // Projects Tab State
  const [uploading, setUploading] = useState(false);
  const [newProject, setNewProject] = useState({ titleEn: '', titleAr: '', descEn: '', descAr: '', category: 'Modern' });
  const [images, setImages] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      // Determine default tab
      determineDefaultTab(JSON.parse(savedUser).role);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && token) {
      if (activeTab === 'requests') fetchRequests();
      if (activeTab === 'projects') fetchProjects();
    }
  }, [isLoggedIn, token, activeTab]);

  const determineDefaultTab = (role) => {
    if (role === 'Admin' || role === 'Sales') setActiveTab('requests');
    else if (role === 'Accounting') setActiveTab('accounting');
    else if (role === 'AccountManager') setActiveTab('projects');
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests', { headers: { 'x-auth-token': token } });
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (err) { console.error(err); }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (err) { console.error(err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setLoginError('');

    try {
      const endpoint = isSetupMode ? '/api/auth/setup' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        if (isSetupMode) {
          alert('تم إنشاء المسؤول بنجاح! الرجاء تسجيل الدخول.');
          setIsSetupMode(false);
          setPassword('');
        } else {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
          setToken(data.token);
          setUser(data.user);
          setIsLoggedIn(true);
          determineDefaultTab(data.user.role);
        }
      } else {
        setLoginError(data.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      setLoginError('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setIsLoggedIn(false);
    setToken('');
    setUser(null);
    setUsername('');
    setPassword('');
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.loginContainer}>
        <form onSubmit={handleLogin} className={styles.loginCard}>
          <div className={styles.loginIcon}>
            {isSetupMode ? <UserPlus size={32} /> : <Key size={32} />}
          </div>
          <h2>{isSetupMode ? 'إعداد حساب مسؤول' : 'تسجيل الدخول'}</h2>
          <p>{isSetupMode ? 'إنشاء أول حساب مسؤول (Admin)' : 'أدخل بيانات الاعتماد للمتابعة'}</p>
          
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="اسم المستخدم (Username)"
            className={styles.loginInput}
            required
            style={{ marginBottom: '1rem' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور (Password)"
            className={styles.loginInput}
            required
          />
          
          {loginError && <p className={styles.errorMessage}>{loginError}</p>}
          
          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isSetupMode ? 'إنشاء حساب' : 'دخول / Login')}
          </button>

          <button 
            type="button" 
            onClick={() => setIsSetupMode(!isSetupMode)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSetupMode ? 'العودة لتسجيل الدخول' : 'إعداد حساب مسؤول لأول مرة؟'}
          </button>
        </form>
      </div>
    );
  }

  // RBAC Navigation Configuration
  const allNavItems = [
    { id: 'requests', label: 'الطلبات الواردة', icon: MessageSquare, roles: ['Admin', 'Sales'] },
    { id: 'crm', label: 'إدارة العملاء (CRM)', icon: Users, roles: ['Admin', 'Sales'] },
    { id: 'projects', label: 'معرض المشاريع', icon: Briefcase, roles: ['Admin', 'AccountManager'] },
    { id: 'manufacturing', label: 'إدارة التصنيع', icon: Wrench, roles: ['Admin', 'AccountManager', 'Sales'] },
    { id: 'hr', label: 'شؤون الموظفين (HR)', icon: LayoutDashboard, roles: ['Admin'] },
    { id: 'accounting', label: 'الحسابات والتكاليف', icon: DollarSign, roles: ['Admin', 'Accounting'] },
  ];

  const allowedNavItems = allNavItems.filter(item => item.roles.includes(user.role));

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1>The Kitchen</h1>
          <p>مرحباً، {user.username}</p>
          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '0.5rem', display: 'inline-block' }}>
            {user.role}
          </span>
        </div>
        
        <nav className={styles.sidebarNav}>
          {allowedNavItems.map(item => {
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
              handleDeleteRequest={async (id) => {
                if(user.role !== 'Admin') return alert('غير مصرح لك بالحذف');
                // Deletion logic... (Simplified for RBAC demo, usually moved inside the component or handled safely)
              }} 
            />
          </div>
        )}

        {activeTab === 'crm' && <CRMTab userRole={user.role} token={token} />}

        {activeTab === 'projects' && (
          <div className={styles.tabContentPanel}>
            <div className={styles.panelHeader}>
              <h2>معرض المشاريع</h2>
            </div>
            <ProjectsTab 
              projects={projects}
              handleDeleteProject={() => {}}
              deletingId={deletingId}
              handleProjectSubmit={async () => {}}
              newProject={newProject}
              setNewProject={setNewProject}
              setImages={setImages}
              uploading={uploading}
            />
          </div>
        )}

        {activeTab === 'manufacturing' && <ManufacturingTab userRole={user.role} token={token} />}
        {activeTab === 'hr' && <HRTab userRole={user.role} token={token} />}
        {activeTab === 'accounting' && <AccountingTab userRole={user.role} token={token} />}
      </main>
    </div>
  );
}
