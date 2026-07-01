"use client";
import { motion } from 'framer-motion';
import { Upload, Send } from 'lucide-react';
import styles from './Contact.module.css';

export default function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("تم استلام طلبك بنجاح! سنتواصل معك قريباً.");
  };

  return (
    <div className={styles.contactSection}>
      <div className={styles.header}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          طلب تصميم جديد
        </motion.h1>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          أدخل بياناتك وسنقوم بالتواصل معك لتحديد موعد لمعاينة المساحة ومناقشة التفاصيل.
        </motion.p>
      </div>

      <motion.div 
        className={styles.formCard}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>الاسم الكامل</label>
            <input type="text" className={styles.input} required placeholder="أدخل اسمك الكامل" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>رقم الهاتف</label>
            <input type="tel" className={styles.input} required placeholder="أدخل رقم هاتفك" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>مساحة المطبخ (تقريباً)</label>
            <input type="text" className={styles.input} placeholder="مثال: 4x3 متر" />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>الستايل المفضل</label>
            <select className={styles.select} required defaultValue="">
              <option value="" disabled>اختر الستايل</option>
              <option value="modern">مودرن (Modern)</option>
              <option value="classic">كلاسيك (Classic)</option>
              <option value="neo-classic">نيو كلاسيك (Neo-Classic)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>إرفاق ملفات (مخطط أو صور استرشادية)</label>
            <div className={styles.fileInputContainer}>
              <div className={styles.fileBtn}>
                <Upload size={20} />
                <span>اختر ملفاً لرفعه</span>
              </div>
              <input type="file" className={styles.fileInput} multiple />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              إرسال الطلب <Send size={20} />
            </span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
