"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Hero from '../components/Hero';
import { Shield, Sparkles, LayoutGrid, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import styles from './page.module.css';

export default function Home() {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div style={{ overflow: 'hidden' }}>
      <Hero />

      {/* Luxury Intro & Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.tagline}>{t('home.philosophy')}</span>
            <h2 className={styles.sectionTitle}>{t('home.whyChooseUs')}</h2>
            <div className={styles.divider}></div>
          </motion.div>

          <motion.div 
            className={styles.grid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div className={styles.valueCard} variants={itemVariants}>
              <div className={styles.iconWrapper}>
                <Shield size={32} className={styles.valueIcon} />
              </div>
              <h3>{t('home.qualityTitle')}</h3>
              <p>{t('home.qualityDesc')}</p>
            </motion.div>

            <motion.div className={styles.valueCard} variants={itemVariants}>
              <div className={styles.iconWrapper}>
                <LayoutGrid size={32} className={styles.valueIcon} />
              </div>
              <h3>{t('home.smartDesignTitle')}</h3>
              <p>{t('home.smartDesignDesc')}</p>
            </motion.div>

            <motion.div className={styles.valueCard} variants={itemVariants}>
              <div className={styles.iconWrapper}>
                <Sparkles size={32} className={styles.valueIcon} />
              </div>
              <h3>{t('home.aestheticTitle')}</h3>
              <p>{t('home.aestheticDesc')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Specialities Section */}
      <section className={styles.specialtiesSection}>
        <div className={styles.container}>
          <motion.div 
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.tagline}>{t('home.specialtiesTagline')}</span>
            <h2 className={styles.sectionTitle}>{t('home.specialtiesTitle')}</h2>
            <div className={styles.divider}></div>
          </motion.div>

          <div className={styles.specialtiesGrid}>
            {/* Category 1: Modern */}
            <motion.div 
              className={styles.specialtyCard}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.specialtyImageContainer}>
                <img 
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" 
                  alt="Modern Kitchen" 
                  className={styles.specialtyImage}
                />
                <div className={styles.specialtyOverlay}></div>
              </div>
              <div className={styles.specialtyContent}>
                <h3>{t('home.modernKitchen')}</h3>
                <p>{t('home.modernDesc')}</p>
                <Link href="/portfolio?filter=Modern" className={styles.specialtyLink}>
                  <span>{t('home.exploreModern')}</span> <ArrowLeft size={16} style={{ transform: t('dir') === 'ltr' ? 'rotate(180deg)' : 'none' }} />
                </Link>
              </div>
            </motion.div>

            {/* Category 2: Neo-Classic / Semi-Modern */}
            <motion.div 
              className={styles.specialtyCard}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className={styles.specialtyImageContainer}>
                <img 
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop" 
                  alt="Neo-Classic Kitchen" 
                  className={styles.specialtyImage}
                />
                <div className={styles.specialtyOverlay}></div>
              </div>
              <div className={styles.specialtyContent}>
                <h3>{t('home.neoClassic')}</h3>
                <p>{t('home.neoClassicDesc')}</p>
                <Link href="/portfolio?filter=Semi-Modern" className={styles.specialtyLink}>
                  <span>{t('home.exploreNeoClassic')}</span> <ArrowLeft size={16} style={{ transform: t('dir') === 'ltr' ? 'rotate(180deg)' : 'none' }} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA / Quick Request Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaOverlay}></div>
        <div className={styles.ctaContainer}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ zIndex: 2, position: 'relative' }}
          >
            <h2>{t('home.dreamKitchenTitle')}</h2>
            <p>{t('home.dreamKitchenDesc')}</p>
            <div className={styles.ctaButtons}>
              <Link href="/contact" className="btn-premium">
                {t('home.startDesignNow')}
              </Link>
              <Link href="/story" className="btn-outline" style={{ border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                {t('home.learnOurStory')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}


