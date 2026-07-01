"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, toggleLanguage, t, mounted } = useLanguage();

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/story', label: t('nav.story') },
    { href: '/portfolio', label: t('nav.portfolio') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <img src="/logo-attached.png" alt="The Kitchen Company Logo" style={{ height: '40px', width: 'auto' }} />
        </Link>

        <nav className={styles.nav}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/contact" className="btn-premium" style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}>
            {t('nav.requestQuote')}
          </Link>
          <button onClick={toggleLanguage} className={styles.langToggle} aria-label="Toggle Language">
            <Globe size={18} />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </nav>

        <div className={styles.mobileActions}>
          <button onClick={toggleLanguage} className={styles.mobileLangToggle} aria-label="Toggle Language">
            <Globe size={20} />
            <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
          </button>

          <button 
            className={styles.mobileMenuBtn} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Accordion */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className={styles.mobileDropdown}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.mobileDropdownInner}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={styles.mobileNavLink}
                      style={{
                        color: isActive ? 'var(--orange)' : 'var(--foreground)'
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link 
                  href="/contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-premium"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    textAlign: 'center',
                    marginTop: '0.5rem'
                  }}
                >
                  {t('nav.requestQuote')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


