"use client";
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import styles from './About.module.css';

export default function AboutPage() {
  const { t } = useLanguage();
  const textContent = t('about.text');
  const words = textContent.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className={styles.aboutSection}>
      <motion.div 
        className={styles.imageContainer}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <img 
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop" 
          alt="Kitchen Details" 
          className={styles.image}
        />
      </motion.div>
      
      <div className={styles.contentContainer}>
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t('about.title') === "About Us" ? (
            <>
              About <span className={styles.highlight}>Us</span>
            </>
          ) : (
            <>
              من <span className={styles.highlight}>نحن</span>
            </>
          )}
        </motion.h1>
        
        <motion.p 
          className={styles.text}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {words.map((word, index) => (
            <motion.span key={index} variants={wordVariants} style={{ display: "inline-block", marginRight: "0.25em" }}>
              {word}
            </motion.span>
          ))}
        </motion.p>
      </div>
    </div>
  );
}

