"use client";
import { motion } from 'framer-motion';
import { Upload, Send } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Contact.module.css';

export default function ContactPage() {
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t('contact.alertSuccess'));
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
          {t('contact.title')}
        </motion.h1>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t('contact.subtitle')}
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
            <label className={styles.label}>{t('contact.fullNameLabel')}</label>
            <input type="text" className={styles.input} required placeholder={t('contact.fullNamePlaceholder')} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('contact.phoneLabel')}</label>
            <input type="tel" className={styles.input} required placeholder={t('contact.phonePlaceholder')} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('contact.kitchenAreaLabel')}</label>
            <input type="text" className={styles.input} placeholder={t('contact.kitchenAreaPlaceholder')} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('contact.favStyleLabel')}</label>
            <select className={styles.select} required defaultValue="">
              <option value="" disabled>{t('contact.chooseStyleOption')}</option>
              <option value="modern">{t('contact.modernOption')}</option>
              <option value="classic">{t('contact.classicOption')}</option>
              <option value="neo-classic">{t('contact.neoClassicOption')}</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('contact.attachFilesLabel')}</label>
            <div className={styles.fileInputContainer}>
              <div className={styles.fileBtn}>
                <Upload size={20} />
                <span>{t('contact.chooseFileBtn')}</span>
              </div>
              <input type="file" className={styles.fileInput} multiple />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {t('contact.submitRequestBtn')} <Send size={20} style={{ transform: t('dir') === 'rtl' ? 'scaleX(-1)' : 'none' }} />
            </span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}

