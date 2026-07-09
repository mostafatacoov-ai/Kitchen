"use client";
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Portfolio.module.css';

function PortfolioContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const [activeFilter, setActiveFilter] = useState("All");
  const { t, language } = useLanguage();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category));
    return ["All", ...Array.from(cats)];
  }, [projects]);

  useEffect(() => {
    if (filterParam && categories.includes(filterParam)) {
      setActiveFilter(filterParam);
    }
  }, [filterParam, categories]);

  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  const openModal = (project) => {
    setSelectedProject(project);
    setActiveImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedProject(null);
    document.body.style.overflow = 'auto';
  };

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

      {!loading && (
        <div className={styles.filters}>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`${styles.filterBtn} ${activeFilter === cat ? styles.activeFilter : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat === "All" ? t('portfolio.all') : cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', color: 'var(--orange)' }}>
          {t('portfolio.loading')}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          لا توجد مشاريع مضافة حتى الآن / No projects added yet
        </div>
      ) : (
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
                onClick={() => openModal(project)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.imageWrapper}>
                  <img src={project.images[0]} alt={project.title[language]} className={styles.image} />
                  <div className={styles.overlay}>
                    <span className={styles.overlayCategory}>
                      {project.category}
                    </span>
                    <h3 className={styles.overlayTitle}>{project.title[language]}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Gallery Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div 
              className={styles.modalContent}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeBtn} onClick={closeModal}>
                <X size={24} />
              </button>
              
              <img 
                src={selectedProject.images[activeImageIndex]} 
                alt={`${selectedProject.title[language]} - Image ${activeImageIndex + 1}`} 
                className={styles.modalMainImage}
              />
              
              {selectedProject.images.length > 1 && (
                <div className={styles.thumbnailContainer}>
                  {selectedProject.images.map((img, index) => (
                    <img 
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className={`${styles.thumbnail} ${index === activeImageIndex ? styles.activeThumbnail : ''}`}
                      onClick={() => setActiveImageIndex(index)}
                    />
                  ))}
                </div>
              )}

              <div className={styles.modalInfo}>
                <span className={styles.modalCategory}>{selectedProject.category}</span>
                <h2>{selectedProject.title[language]}</h2>
                <p className={styles.modalDesc}>{selectedProject.description[language]}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
