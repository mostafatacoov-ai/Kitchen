"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Hero from '../components/Hero';
import { Shield, Sparkles, LayoutGrid, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
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
            <span className={styles.tagline}>فلسفتنا في العمل</span>
            <h2 className={styles.sectionTitle}>لماذا تختار مطابخنا؟</h2>
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
              <h3>جودة تدوم طويلاً</h3>
              <p>نعتمد على أجود أنواع الأخشاب الطبيعية، الإكسسوارات المقاومة للرطوبة، والمفصلات النمساوية (مثل Blum) لضمان عمر افتراضي ممتد.</p>
            </motion.div>

            <motion.div className={styles.valueCard} variants={itemVariants}>
              <div className={styles.iconWrapper}>
                <LayoutGrid size={32} className={styles.valueIcon} />
              </div>
              <h3>تصاميم ذكية وعصرية</h3>
              <p>نستغل كل سنتيمتر في مطبخك بتصاميم ذكية تحقق مثلث الحركة المثالي، وتوفر مساحات تخزين مخفية ومريحة للغاية.</p>
            </motion.div>

            <motion.div className={styles.valueCard} variants={itemVariants}>
              <div className={styles.iconWrapper}>
                <Sparkles size={32} className={styles.valueIcon} />
              </div>
              <h3>لمسة جمالية راقية</h3>
              <p>كل تفصيل يتم تصميمه بعناية فائقة ليعكس هويتك الشخصية، ويخلق توازناً فنياً متكاملاً بين الخامات والألوان والإضاءة.</p>
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
            <span className={styles.tagline}>تخصصاتنا الفريدة</span>
            <h2 className={styles.sectionTitle}>اختر طراز مطبخك المفضل</h2>
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
                <h3>المطابخ المودرن (Modern)</h3>
                <p>تتميز بالبساطة والخطوط النظيفة، الأسطح الملساء، واستخدام التكنولوجيا المدمجة وتفاصيل الإضاءة المخفية، لتمنحك مساحة عمل عملية وفائقة الأناقة.</p>
                <Link href="/portfolio?filter=Modern" className={styles.specialtyLink}>
                  <span>استكشف تصاميم المودرن</span> <ArrowLeft size={16} />
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
                <h3>نيو كلاسيك / سيمي مودرن</h3>
                <p>المزيج المثالي بين فخامة الكلاسيك ودفئه، وعملية المودرن وحيويته. نستخدم كرانيش وتفاصيل خشبية ناعمة مع أحدث الإكسسوارات الداخلية المريحة.</p>
                <Link href="/portfolio?filter=Semi-Modern" className={styles.specialtyLink}>
                  <span>استكشف تصاميم النيو كلاسيك</span> <ArrowLeft size={16} />
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
            <h2>هل ترغب في تصميم مطبخ أحلامك؟</h2>
            <p>فريقنا من المهندسين والحرفيين مستعد لمساعدتك في تخطيط وتصميم مطبخك بالتفصيل ودراسة المساحة مجاناً.</p>
            <div className={styles.ctaButtons}>
              <Link href="/contact" className="btn-premium">
                ابدأ رحلة تصميمك الآن
              </Link>
              <Link href="/story" className="btn-outline" style={{ border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                تعرف على قصتنا ورؤيتنا
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

