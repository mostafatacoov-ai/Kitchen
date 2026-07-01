"use client";
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div>
          <Link href="/" className={styles.logo}>
            <img src="/logo-attached.png" alt="The Kitchen Company Logo" style={{ height: '45px', width: 'auto', marginBottom: '1rem' }} />
          </Link>
          <p className={styles.description}>
            نصنع قلب المنزل بجودة لا تقبل المساومة. رحلة من ورشة صغيرة إلى كيان متكامل لتصميم وتصنيع المطابخ بأرقى المعايير العالمية.
          </p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">FB</a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">IG</a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">X</a>
          </div>
        </div>

        <div>
          <h3 className={styles.title}>روابط سريعة</h3>
          <ul className={styles.linksList}>
            <li><Link href="/">الرئيسية</Link></li>
            <li><Link href="/about">من نحن</Link></li>
            <li><Link href="/story">قصتنا</Link></li>
            <li><Link href="/portfolio">أعمالنا</Link></li>
            <li><Link href="/contact">تواصل معنا</Link></li>
          </ul>
        </div>

        <div>
          <h3 className={styles.title}>معلومات التواصل</h3>
          <div className={styles.contactItem}>
            <MapPin className={styles.contactIcon} size={20} />
            <span>المعرض الرئيسي والمصنع<br />القاهرة، مصر</span>
          </div>
          <div className={styles.contactItem}>
            <Phone className={styles.contactIcon} size={20} />
            <span dir="ltr">+20 123 456 7890</span>
          </div>
          <div className={styles.contactItem}>
            <Mail className={styles.contactIcon} size={20} />
            <span>info@thekitchencompany.com</span>
          </div>
        </div>
      </div>
      
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} The Kitchen Company. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
}
