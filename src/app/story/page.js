"use client";
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Story.module.css';

export default function StoryPage() {
  const { t } = useLanguage();

  const steps = [
    {
      title: t('story.steps.0.title'),
      text: t('story.steps.0.text'),
      side: "right"
    },
    {
      title: t('story.steps.1.title'),
      text: t('story.steps.1.text'),
      side: "left"
    },
    {
      title: t('story.steps.2.title'),
      text: t('story.steps.2.text'),
      side: "right"
    }
  ];

  return (
    <div className={styles.storySection}>
      <div className={styles.header}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t('story.title')}
        </motion.h1>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t('story.subtitle')}
        </motion.p>
        <div className={styles.divider}></div>
      </div>

      <motion.div 
        className={styles.ceoSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className={styles.ceoImageContainer}>
          <img src="/ceo.jpg" alt="Mohamed Tahoun - CEO" className={styles.ceoImage} />
        </div>
        <div className={styles.ceoContent}>
          <h2 className={styles.ceoName}>{t('story.ceoName')}</h2>
          <h3 className={styles.ceoTitle}>{t('story.ceoTitle')}</h3>
          <p className={styles.ceoBio}>
            {t('story.ceoBio')}
          </p>
        </div>
      </motion.div>

      <div className={styles.timeline}>
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            className={`${styles.timelineItem} ${step.side === 'left' ? styles.timelineItemLeft : styles.timelineItemRight}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: index * 0.15 }}
          >
            <div className={styles.timelineItemContent}>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </div>
            <div className={styles.dot}></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


