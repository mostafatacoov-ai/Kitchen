"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'الرئيسية' },
    { href: '/about', label: 'من نحن' },
    { href: '/story', label: 'قصتنا' },
    { href: '/portfolio', label: 'أعمالنا' },
    { href: '/contact', label: 'تواصل معنا' },
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
            اطلب عرض سعر
          </Link>
        </nav>

        <button 
          className={styles.mobileMenuBtn} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={styles.mobileDropdown}>
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
              اطلب عرض سعر
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
