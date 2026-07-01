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
            <a href="#" className={styles.socialLink} aria-label="Facebook">FB</a>
            <a href="#" className={styles.socialLink} aria-label="Instagram">IG</a>
            <a href="#" className={styles.socialLink} aria-label="Twitter">X</a>
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
            <span dir="ltr">+20 123 456 7890</span>
          </div>
          <div className={styles.contactItem}>
            <Mail className={styles.contactIcon} size={20} />
            <span>info@thekitchencompany.com</span>
          </div>
        </div>
      </div>
      
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} The Kitchen Company. {t('footer.copyright')}</p>
      </div>
    </footer>
  );
}

