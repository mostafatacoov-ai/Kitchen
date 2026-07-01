"use client";
import { useState, useEffect } from 'react';
import { Loader2, Trash2, Calendar, Phone, MapPin, Sparkles, Key, LogOut } from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [loginError, setLoginError] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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
      const response = await fetch('/api/requests', {
        headers: {
          'x-admin-passkey': key,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setRequests(data.requests);
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
    setPasskey('');
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟ Are you sure?')) return;
    setDeletingId(id);
    const key = localStorage.getItem('admin_passkey');

    try {
      const response = await fetch(`/api/requests?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-passkey': key,
        },
      });

      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        alert('فشل الحذف / Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الشبكة / Network error');
    } finally {
      setDeletingId(null);
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

  // Calculate statistics
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
          <h1>لوحة تحكم الطلبات</h1>
          <p>متابعة طلبات التصميم المقدمة من العملاء</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={18} />
          <span>خروج / Logout</span>
        </button>
      </header>

      {/* Analytics widgets */}
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

      {/* Requests table/list */}
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
                        title="محادثة واتساب"
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
                      onClick={() => handleDelete(req.id)}
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
    </div>
  );
}
