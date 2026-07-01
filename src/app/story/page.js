"use client";
import { motion } from 'framer-motion';
import styles from './Story.module.css';

export default function StoryPage() {
  const steps = [
    {
      title: "البداية والشغف",
      text: "بدأ المؤسس محمد طاحون رحلته بشغف خالص وحب عميق لتفاصيل الأخشاب، في ورشة صغيرة تضم عاملين فقط.",
      side: "right"
    },
    {
      title: "النمو والتطور",
      text: "مع الالتزام بالجودة والدقة، بدأت الورشة في جذب المزيد من العملاء، مما تطلب توسيع المساحة وزيادة العمالة والمعدات.",
      side: "left"
    },
    {
      title: "الكيان المتكامل",
      text: "اليوم، تحولت الورشة الصغيرة إلى مصنع متكامل ومزود بأحدث التقنيات، ليصبح 'The Kitchen Company' اسماً رائداً في عالم المطابخ.",
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
          قصتنا
        </motion.h1>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          شغف بالخشب، ورحلة من ورشة صغيرة إلى كيان متكامل
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
          <h2 className={styles.ceoName}>محمد طاحون</h2>
          <h3 className={styles.ceoTitle}>المؤسس والمدير التنفيذي</h3>
          <p className={styles.ceoBio}>
            "نؤمن بأن المطبخ ليس مجرد مساحة للطهي، بل هو قلب المنزل النابض بالحياة. انطلقنا من شغف عميق بتفاصيل الأخشاب لتقديم تصاميم تجمع بين الجودة العالية والجماليات العصرية، لنصنع بيئة تعكس شخصية كل عائلة."
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

