import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Language } from '../types';
import { translations } from '../translations';

export const Header: React.FC<{ lang: Language; setLang: (l: Language) => void }> = ({
  lang,
  setLang,
}) => {
  const t = translations[lang].header;
  const shouldReduceMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 24);

      if (!shouldReduceMotion) {
        const last = lastYRef.current;
        const delta = y - last;

        // Hide on intentional scroll down; reveal on scroll up.
        if (y > 80 && delta > 8) setIsHidden(true);
        if (delta < -8) setIsHidden(false);
        if (y < 24) setIsHidden(false);

        lastYRef.current = y;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all overflow-x-hidden max-w-full ${shouldReduceMotion ? 'duration-0' : 'duration-500'} ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        isScrolled
          ? 'bg-slate-950/70 backdrop-blur-lg border-b border-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.35)] ring-1 ring-white/10 py-3'
          : 'bg-slate-950/30 backdrop-blur-lg border-b border-white/10 ring-1 ring-white/5 py-6'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-sm mr-2 shadow-lg">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="text-[#0a1d37]"
              fill="none"
            >
              <path
                d="M12 3a3 3 0 0 0-3 3c0 1.31.84 2.42 2 2.83V15a1 1 0 0 0 2 0V8.83A3.001 3.001 0 0 0 12 3Z"
                fill="currentColor"
              />
              <path
                d="M5 13a1 1 0 0 1 1 1c0 2.76 2.69 5 6 5s6-2.24 6-5a1 1 0 1 1 2 0c0 3.87-3.58 7-8 7s-8-3.13-8-7a1 1 0 0 1 1-1Z"
                fill="currentColor"
              />
              <path
                d="M4.5 14.5a1 1 0 0 1 1.41 0L7 15.59l1.09-1.09a1 1 0 1 1 1.41 1.41L7.7 17.7a1 1 0 0 1-1.41 0L4.5 15.91a1 1 0 0 1 0-1.41Z"
                fill="currentColor"
              />
              <path
                d="M19.5 14.5a1 1 0 0 1 0 1.41l-1.8 1.79a1 1 0 0 1-1.41 0l-1.8-1.79a1 1 0 1 1 1.41-1.41L17 15.59l1.09-1.09a1 1 0 0 1 1.41 0Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="text-2xl font-black tracking-tighter text-white">
            SKIP<span className="text-sky-400">MAR</span>
          </div>
        </div>

        <div className="flex lg:hidden items-center space-x-4">
          {(['EN', 'ET', 'FI'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`relative text-[10px] font-black tracking-widest px-1 py-1 transition-all ${
                lang === l ? 'text-sky-400' : 'text-white/40 hover:text-white'
              }`}
            >
              {l}
              {lang === l && <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-sky-400" />}
            </button>
          ))}
        </div>

        <nav className="hidden lg:flex space-x-8 items-center">
          {['services', 'about', 'contact'].map((item) => {
            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              const targetId = `#${item}`;
              const element = document.querySelector(targetId);
              if (element) {
                const headerHeight = isScrolled ? 64 : 88; // Approximate header height
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }
            };

            return (
              <motion.a
                key={item}
                href={`#${item}`}
                onClick={handleClick}
                className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/80 hover:text-white nav-link transition-colors relative cursor-pointer"
                whileHover={shouldReduceMotion ? undefined : { opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {t[item as keyof typeof t]}
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5 bg-sky-400"
                  initial={{ width: 0 }}
                  whileHover={shouldReduceMotion ? undefined : { width: '100%' }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.a>
            );
          })}
          <div className="flex items-center space-x-4 border-l border-white/10 pl-8 ml-4">
            {(['EN', 'ET', 'FI'] as Language[]).map((l) => (
              <motion.button
                key={l}
                onClick={() => setLang(l)}
                className={`relative text-[10px] font-black tracking-widest px-1 py-1 transition-all ${
                  lang === l ? 'text-sky-400' : 'text-white/30 hover:text-white'
                }`}
                whileHover={shouldReduceMotion ? undefined : { opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {l}
                {lang === l && (
                  <motion.span
                    className="absolute left-0 right-0 -bottom-1 h-0.5 bg-sky-400"
                    layoutId="activeLang"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </nav>
      </div>
    </motion.header>
  );
};


