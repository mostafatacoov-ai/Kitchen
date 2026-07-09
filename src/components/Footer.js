"use client";
import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div>
          <Link href="/" className={styles.logo}>
            <img src="/logo-attached.png" alt="The Kitchen Company Logo" style={{ height: '45px', width: 'auto', marginBottom: '1rem' }} />
          </Link>
          <p className={styles.description}>
            {t('footer.desc')}
          </p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialLink} aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className={styles.socialLink} aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className={styles.title}>{t('footer.quickLinks')}</h3>
          <ul className={styles.linksList}>
            <li><Link href="/">{t('nav.home')}</Link></li>
            <li><Link href="/about">{t('nav.about')}</Link></li>
            <li><Link href="/story">{t('nav.story')}</Link></li>
            <li><Link href="/portfolio">{t('nav.portfolio')}</Link></li>
            <li><Link href="/contact">{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className={styles.title}>{t('footer.contactInfo')}</h3>
          <div className={styles.contactItem}>
            <MapPin className={styles.contactIcon} size={20} />
            <span>
              {t('footer.showroom')}
              <br />
              {t('footer.cairoEgypt')}
            </span>
          </div>
          <div className={styles.contactItem}>
            <Phone className={styles.contactIcon} size={20} />
            <span dir="ltr">01125777222</span>
          </div>
          <div className={styles.contactItem}>
            <Mail className={styles.contactIcon} size={20} />
            <span>info@thekitchen-company.com</span>
          </div>
        </div>
      </div>
      
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} The Kitchen Company. {t('footer.copyright')}</p>
      </div>
    </footer>
  );
}

