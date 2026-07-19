"use client";
import { useState } from 'react';
import { Loader2, Briefcase, Send, CheckCircle } from 'lucide-react';
import styles from './Careers.module.css';

export default function CareersPage() {
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', email: '', portfolioLink: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const roles = [
    'مصمم مطابخ (Kitchen Designer)',
    'نجار (Carpenter)',
    'فني تركيبات (Installation Technician)',
    'سائق (Driver)',
    'محاسب (Accountant)',
    'مبيعات (Sales Rep)',
    'أخرى (Other)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', role: '', phone: '', email: '', portfolioLink: '', notes: '' });
      } else {
        alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      alert('خطأ في الاتصال بالسيرفر.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <CheckCircle size={64} className={styles.successIcon} />
          <h2>تم إرسال طلبك بنجاح!</h2>
          <p>شكراً لاهتمامك بالانضمام إلى فريق The Kitchen. سنقوم بمراجعة طلبك والتواصل معك قريباً.</p>
          <button className={styles.btnPrimary} onClick={() => setSuccess(false)}>إرسال طلب آخر</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <Briefcase size={40} className={styles.headerIcon} />
          <h1>انضم إلى فريقنا</h1>
          <p>نحن نبحث دائماً عن مواهب جديدة ومبدعة للانضمام إلى عائلة The Kitchen.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>الاسم الكامل / Full Name *</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div className={styles.formGroup}>
            <label>الوظيفة المطلوبة / Desired Role *</label>
            <select 
              required 
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="" disabled>اختر الوظيفة...</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>رقم الهاتف / Phone *</label>
              <input 
                type="tel" 
                required 
                dir="ltr"
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>

            <div className={styles.formGroup}>
              <label>البريد الإلكتروني / Email</label>
              <input 
                type="email" 
                dir="ltr"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>رابط سابقة الأعمال (Portfolio) / CV Link</label>
            <input 
              type="url" 
              dir="ltr"
              placeholder="https://..."
              value={formData.portfolioLink} 
              onChange={e => setFormData({...formData, portfolioLink: e.target.value})} 
            />
          </div>

          <div className={styles.formGroup}>
            <label>نبذة عنك (اختياري) / Notes</label>
            <textarea 
              rows="4" 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
            ></textarea>
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            {loading ? 'جاري الإرسال...' : 'إرسال طلب التوظيف'}
          </button>
        </form>
      </div>
    </div>
  );
}
