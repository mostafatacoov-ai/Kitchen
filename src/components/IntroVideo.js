"use client";
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import styles from './IntroVideo.module.css';

export default function IntroVideo({ onComplete }) {
  const [showPlay, setShowPlay] = useState(false);
  const videoRef = useRef(null);
  const { lang } = useLanguage();

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined' && sessionStorage.getItem('introPlayed')) {
      onComplete();
      return;
    }

    if (videoRef.current) {
      // Attempt to play with sound immediately
      videoRef.current.play().catch(e => {
        console.log("Browser blocked autoplay with sound:", e);
        setShowPlay(true);
      });
    }
  }, [onComplete]);

  const handleVideoEnd = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('introPlayed', 'true');
    }
    onComplete();
  };

  const handleSkip = () => {
    handleVideoEnd();
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.play();
      setShowPlay(false);
    }
  };

  return (
    <div className={styles.introContainer} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={styles.popupContent}>
        <video
          ref={videoRef}
          className={styles.video}
          src="/intro-video.mp4"
          onEnded={handleVideoEnd}
          autoPlay
          playsInline
        />
        
        {showPlay && (
          <div className={styles.playFallbackOverlay} onClick={handlePlayClick}>
            <button className={styles.fallbackPlayBtn}>▶</button>
          </div>
        )}

        <button 
          className={styles.closeButton} 
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
