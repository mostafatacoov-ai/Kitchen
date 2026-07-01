"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Portfolio.module.css';

const projects = [
  { id: 1, category: "Modern", image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?q=80&w=2070&auto=format&fit=crop" },
  { id: 2, category: "Modern", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" },
  { id: 3, category: "Semi-Modern", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop" },
  { id: 4, category: "Modern", image: "https://images.unsplash.com/photo-1556912998-c57cc6b63ce7?q=80&w=2070&auto=format&fit=crop" },
  { id: 5, category: "Semi-Modern", image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?q=80&w=2070&auto=format&fit=crop" },
  { id: 6, category: "Semi-Modern", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2070&auto=format&fit=crop" },
];

const categories = ["All", "Modern", "Semi-Modern"];

function PortfolioContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const [activeFilter, setActiveFilter] = useState("All");
  const { t } = useLanguage();

  useEffect(() => {
    if (filterParam && categories.includes(filterParam)) {
      setActiveFilter(filterParam);
    }
  }, [filterParam]);

  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  return (
    <div className={styles.portfolioSection}>
      <div className={styles.header}>
        <span className={styles.tagline}>{t('portfolio.tagline')}</span>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t('portfolio.title')}
        </motion.h1>
        <div className={styles.divider}></div>
      </div>

      <div className={styles.filters}>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`${styles.filterBtn} ${activeFilter === cat ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat === "All" ? t('portfolio.all') : cat === "Modern" ? t('portfolio.modernFilter') : t('portfolio.semiModernFilter')}
          </button>
        ))}
      </div>

      <motion.div layout className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {filteredProjects.map(project => (
            <motion.div 
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className={styles.gridItem}
            >
              <div className={styles.imageWrapper}>
                <img src={project.image} alt={t(`portfolio.projects.${project.id}`)} className={styles.image} />
                <div className={styles.overlay}>
                  <span className={styles.overlayCategory}>
                    {project.category === "Modern" ? t('portfolio.modernFilter') : t('portfolio.semiModernFilter')}
                  </span>
                  <h3 className={styles.overlayTitle}>{t(`portfolio.projects.${project.id}`)}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function PortfolioPage() {
  const { t } = useLanguage();

  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--orange)' }}>
        {t('portfolio.loading')}
      </div>
    }>
      <PortfolioContent />
    </Suspense>
  );
}


