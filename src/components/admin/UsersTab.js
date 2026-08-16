"use client";
import { useState, useEffect } from 'react';
import { Loader2, Trash2, Edit2, Check, X, Shield } from 'lucide-react';
import styles from './UsersTab.module.css';

export default function UsersTab({ userRole, token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Sales');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const roles = ['Admin', 'Sales', 'AccountManager', 'Accounting', 'Purchasing'];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        setErrorMsg(data.error || 'فشل جلب المستخدمين');
      }
    } catch (err) {
      setErrorMsg('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'Admin') {
      fetchUsers();
    }
  }, [userRole, token]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccessMsg('تم إنشاء المستخدم بنجاح');
        setNewUsername('');
        setNewPassword('');
        setNewRole('Sales');
        fetchUsers();
      } else {
        setErrorMsg(data.error || 'حدث خطأ أثناء الإنشاء');
      }
    } catch (err) {
      setErrorMsg('خطأ في الاتصال');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || 'فشل الحذف');
      }
    } catch (err) {
      alert('خطأ في الاتصال');
    }
  };

  const handleStartEdit = (user) => {
    setEditingId(user._id);
    setEditRole(user.role);
    setEditPassword('');
  };

  const handleSaveEdit = async (id) => {
    try {
      const body = { role: editRole };
      if (editPassword) body.password = editPassword;
      
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        fetchUsers();
      } else {
        alert(data.error || 'فشل التحديث');
      }
    } catch (err) {
      alert('خطأ في الاتصال');
    }
  };

  if (userRole !== 'Admin') {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>غير مصرح لك بالوصول لهذه الصفحة</div>;
  }

  return (
    <div className={styles.usersTab}>
      <div className={styles.topSection}>
        <div className={styles.createCard}>
          <h3><Shield size={20} /> إضافة مستخدم جديد</h3>
          <form onSubmit={handleCreateUser} className={styles.createForm}>
            <input 
              type="text" 
              placeholder="اسم المستخدم" 
              value={newUsername} 
              onChange={(e) => setNewUsername(e.target.value)} 
              required
              className={styles.inputField}
            />
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required
              minLength="6"
              className={styles.inputField}
            />
            <select 
              value={newRole} 
              onChange={(e) => setNewRole(e.target.value)}
              className={styles.selectField}
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'إنشاء المستخدم'}
            </button>
          </form>
          {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}
          {successMsg && <p className={styles.successText}>{successMsg}</p>}
        </div>
      </div>

      <div className={styles.listSection}>
        <h3>قائمة المستخدمين</h3>
        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>اسم المستخدم</th>
                  <th>الصلاحية (Role)</th>
                  <th>تاريخ الإنشاء</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>
                      {editingId === user._id ? (
                        <div className={styles.editControls}>
                          <select 
                            value={editRole} 
                            onChange={(e) => setEditRole(e.target.value)}
                            className={styles.selectFieldSmall}
                          >
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <input 
                            type="password" 
                            placeholder="تغيير الباسورد؟" 
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className={styles.inputFieldSmall}
                          />
                        </div>
                      ) : (
                        <span className={styles.roleBadge}>{user.role}</span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td>
                      <div className={styles.actions}>
                        {editingId === user._id ? (
                          <>
                            <button onClick={() => handleSaveEdit(user._id)} className={styles.iconBtnSuccess} title="حفظ">
                              <Check size={18} />
                            </button>
                            <button onClick={() => setEditingId(null)} className={styles.iconBtnCancel} title="إلغاء">
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleStartEdit(user)} className={styles.iconBtn} title="تعديل">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDeleteUser(user._id)} className={styles.iconBtnDanger} title="حذف">
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>لا يوجد مستخدمين بعد</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
