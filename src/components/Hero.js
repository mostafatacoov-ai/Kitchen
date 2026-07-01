"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import styles from './Hero.module.css';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        <img 
          src="/hero-attached.jpg" 
          alt="Luxury Kitchen" 
          className={styles.bgImage}
        />
        <div className={styles.colorOverlay}></div>
      </div>
      
      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={styles.logoContainer}
        >
          <img 
            src="/logo-attached.png" 
            alt="The Kitchen Company" 
            className={styles.heroLogo} 
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className={styles.ctaGroup}
        >
          <Link href="/contact" className="btn-premium">
            {t('hero.requestDesign')}
          </Link>
          <Link href="/portfolio" className="btn-outline" style={{ border: '1px solid rgba(255, 255, 255, 0.4)', color: '#fff' }}>
            {t('hero.previousWorks')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

