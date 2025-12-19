import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { Language } from './types';
import { translations } from './translations';
import { initKommoWidget, sendToKommo } from './services/kommoService';
import { Header } from './services/Header';
import { Hero } from './Hero';
import { Preloader } from './Preloader';
import { useScrollParallax, usePointerParallax, useParallaxSection } from './hooks/useParallax';

/**
 * Global motion presets for premium, consistent animations
 * All animations use slow/soft timing and consistent easing: [0.16, 1, 0.3, 1]
 */
const motionPresets = {
  // Premium easing - consistent across all animations
  easing: [0.16, 1, 0.3, 1] as const,
  
  // Duration presets - slowed down for premium feel
  durations: {
    enter: 1.2,      // Main section reveals
    enterSoft: 1.0, // Softer reveals
    enterStrong: 1.4, // Stronger reveals
    micro: 0.4,     // Micro-interactions
    hover: 0.35,    // Hover states
  },
  
  // Viewport settings
  viewport: {
    once: true,
    amount: 0.25,
  },
  
  // Reveal animations with blur-to-sharp effect
  reveal: {
    initial: { opacity: 0, y: 28, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  },
  revealSoft: {
    initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
  },
  revealStrong: {
    initial: { opacity: 0, y: 32, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
  
  // Stagger containers - reduced delay steps
  staggerContainer: {
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true, amount: 0.25 },
    transition: { staggerChildren: 0.06, delayChildren: 0.03 },
  },
  staggerContainerTight: {
    initial: 'hidden',
    whileInView: 'show',
    viewport: { once: true, amount: 0.25 },
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] } 
    },
  },
  staggerItemSoft: {
    hidden: { opacity: 0, y: 16, filter: 'blur(3px)' },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } 
    },
  },
  
  // Line reveal (for dividers, underlines)
  lineReveal: {
    initial: { scaleX: 0 },
    whileInView: { scaleX: 1 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
  
  // Hover effects
  hoverLift: {
    y: -2,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  hoverLiftStrong: {
    y: -4,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  hoverScale: {
    scale: 1.01,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  hoverShadow: {
    boxShadow: '0 12px 40px rgba(10,29,55,0.15)',
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  
  // Button interactions
  buttonHover: {
    y: -2,
    scale: 1.01,
    boxShadow: '0 8px 24px rgba(10,29,55,0.2)',
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  buttonTap: {
    scale: 0.98,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  
  // Viewport-based reveals with blur
  viewportReveal: (delay = 0) => ({
    initial: { opacity: 0, y: 28, filter: 'blur(6px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] },
  }),
  viewportRevealSoft: (delay = 0) => ({
    initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

/**
 * Standardized Media Frame for consistent visual language.
 * Normalizes aspect ratios, overlays, and color treatment.
 */
const MediaFrame: React.FC<{
  src: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
  overlayOpacity?: string;
  showOverlay?: boolean;
}> = ({ 
  src, 
  alt, 
  aspectRatio = "aspect-square", 
  className = "", 
  overlayOpacity = "opacity-80",
  showOverlay = true 
}) => (
  <div className={`relative overflow-hidden ${aspectRatio} ${className} bg-[#0a1d37]`}>
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover grayscale-[10%] saturate-[0.9] hue-rotate-[-6deg] contrast-[1.08] brightness-[0.92] transition-transform duration-1000 group-hover:scale-105"
    />
    {showOverlay && (
      <div className={`absolute inset-0 bg-gradient-to-t from-[#0a1d37] via-[#0a1d37]/22 to-transparent pointer-events-none ${overlayOpacity}`} />
    )}
    {/* Subtle noise layer for premium texture */}
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
  </div>
);

const ServiceCard: React.FC<{
  card: { id: string; img: string; data: { title: string; desc: string } };
  index: number;
}> = ({ card, index }) => {
  const scrollParallax = useScrollParallax({ translateYRange: 14, enableZoom: true });
  const pointerParallax = usePointerParallax();
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ 
        duration: 1.0, 
        delay: index * 0.06, 
        ease: motionPresets.easing 
      }}
      whileHover={shouldReduceMotion ? undefined : {
        y: -4,
        transition: { duration: 0.4, ease: motionPresets.easing }
      }}
      className="relative group bg-white border border-white/20 shadow-[0_4px_24px_rgba(10,29,55,0.08)] hover:shadow-[0_8px_32px_rgba(10,29,55,0.12)] cursor-pointer overflow-hidden rounded-[var(--radius-lg)] focus-within:outline-2 focus-within:outline-sky-500 focus-within:outline-offset-2"
      ref={pointerParallax.cardRef}
      style={prefersReducedMotion ? undefined : { ...pointerParallax.cardStyle, transformStyle: 'preserve-3d' }}
    >
      {/* Image container with scroll-reactive parallax */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-[#0a1d37]"
        ref={scrollParallax.cardRef}
      >
        <div
          ref={pointerParallax.imageRef}
          style={pointerParallax.imageStyle}
          className="absolute inset-0"
        >
          <img
            ref={scrollParallax.imageRef}
            src={card.img}
            alt={card.data.title}
            style={scrollParallax.style}
            className="absolute top-1/2 left-1/2 w-full md:w-[120%] h-[120%] object-cover object-center grayscale-[8%] saturate-[0.92] contrast-[1.06] brightness-[0.88] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] max-w-full -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        {/* Dark overlay + vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1d37]/75 via-[#0a1d37]/25 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1d37]/40 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-8 lg:p-10">
        <h3 className="text-2xl lg:text-[28px] font-black mb-4 uppercase tracking-[-0.02em] leading-[1.1] text-[#0a1d37] group-hover:text-sky-600 transition-colors duration-300">
          {card.data.title}
        </h3>
        <p className="text-[#0a1d37]/70 text-sm lg:text-base mb-8 line-clamp-3 font-medium leading-relaxed">
          {card.data.desc}
        </p>
        <div className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.35em] uppercase text-[#0a1d37] group-hover:text-sky-600 transition-colors duration-300">
          <span className="border-b border-[#0a1d37]/20 group-hover:border-sky-600 pb-1 transition-colors duration-300">
            VIEW DETAILS
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            className="opacity-60 group-hover:opacity-100 md:group-hover:translate-x-1 transition-all duration-300"
            aria-hidden="true"
          >
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

const ServicesGrid: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].services;
  const shouldReduceMotion = useReducedMotion();
  const cards = [
    { id: 'workforce', img: '/services/workforce.jpg', data: t.workforce },
    { id: 'supplies', img: '/services/supplies.jpg', data: t.supplies },
    { id: 'welding', img: '/services/welding.jpg', data: t.welding },
  ];

  return (
    <section id="services" className="py-32 bg-white overflow-hidden scroll-mt-24 max-w-full">
      <motion.div
        initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.2, ease: motionPresets.easing }}
        className="container mx-auto px-6 lg:px-12"
      >
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.1, ease: motionPresets.easing }}
        >
          <h2 className="text-5xl font-black text-[#0a1d37] uppercase tracking-tighter leading-none">{t.title}</h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          {cards.map((card, i) => (
            <ServiceCard key={card.id} card={card} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const About: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].about;
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // keep subtle scroll-reactive background movement, but make the section feel premium/minimal
  const parallax = useParallaxSection({ translateYRange: 18 });

  // Key figures (keep all 6, but present in a cleaner system)
  const allMetrics = useMemo(
    () => [
      { val: 10, suffix: '+', label: 'YEARS OF EXPERIENCE' },
      { val: 24, suffix: '/7', label: 'SUPPORT NETWORK' },
      { val: 12, suffix: '', label: 'OPERATIONAL PORTS' },
      { val: 450, suffix: '+', label: 'VESSELS SERVICED' },
      { val: 24, suffix: '/7', label: 'TECHNICAL SUPPORT' },
      { val: 100, suffix: '%', label: 'QUALITY COMPLIANCE' },
    ],
    []
  );

  // Shorten the about copy to 2 lines max, remove links
  const aboutShort = useMemo(() => {
    const txt = (t.text ?? '').trim();
    if (!txt) return '';
    // Remove any links/HTML tags
    const cleanText = txt.replace(/<[^>]*>/g, '');
    // Take first 2 sentences max
    const parts = cleanText.split(/(?<=[.!?])\s+/);
    const pick = parts.slice(0, 2).join(' ').trim();
    return (pick.length > 0 ? pick : cleanText).slice(0, 180);
  }, [t.text]);

  // Video ref for parallax
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);

  // Apply subtle parallax to video on scroll
  useEffect(() => {
    if (prefersReducedMotion || !videoRef.current) return;

    const video = videoRef.current;
    const section = parallax.sectionRef.current;
    if (!section) return;

    const updateParallax = () => {
      if (!isVisibleRef.current) {
        rafIdRef.current = null;
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      const sectionCenter = rect.top + rect.height / 2;
      const rawProgress = (viewportCenter - sectionCenter) / viewportHeight;
      const progress = Math.max(-1, Math.min(1, rawProgress));
      const translateY = progress * 16; // Max 16px movement

      video.style.transform = `translate3d(0, ${translateY}px, 0)`;
      rafIdRef.current = requestAnimationFrame(updateParallax);
    };

    // IntersectionObserver to only animate when section is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            if (!rafIdRef.current) {
              rafIdRef.current = requestAnimationFrame(updateParallax);
            }
          } else {
            if (rafIdRef.current) {
              cancelAnimationFrame(rafIdRef.current);
              rafIdRef.current = null;
            }
          }
        });
      },
      { rootMargin: '100px', threshold: 0 }
    );

    observer.observe(section);
    updateParallax();

    const handleScroll = () => {
      if (isVisibleRef.current && !rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [prefersReducedMotion, parallax.sectionRef]);

  return (
    <section
      id="about"
      ref={parallax.sectionRef}
      className="relative overflow-hidden bg-[#0a1d37] min-h-[90vh] scroll-mt-24 max-w-full"
    >
      {/* Video background */}
      {!prefersReducedMotion ? (
        <div className="absolute inset-0 z-0 overflow-hidden max-w-full">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover will-change-transform max-w-full"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            aria-hidden="true"
          >
            <source src="https://drive.usercontent.google.com/download?id=1-2rA8tG3X7vls10hLhUm0tQycLMgsjUi&export=download&confirm=t" type="video/mp4" />
          </video>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-[#0a1d37] max-w-full" />
      )}

      {/* Dark navy overlay with gradient - stronger at bottom for metrics readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[rgba(10,29,55,0.75)] via-[rgba(10,29,55,0.85)] to-[rgba(10,29,55,0.92)] pointer-events-none" />
      
      {/* Soft vignette on edges */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(10,29,55,0.3) 100%)'
        }}
      />

      {/* Subtle animated noise/grain overlay */}
      <div 
        className="absolute inset-0 z-[1] opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
          animation: prefersReducedMotion ? 'none' : 'grain 8s steps(10) infinite'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.2, ease: motionPresets.easing }}
        className="relative z-10 container mx-auto px-6 lg:px-12 py-24 lg:py-32"
      >
        {/* Header with pre-label */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: motionPresets.easing }}
          className="mb-20 lg:mb-24"
        >
          {/* Pre-label */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-10 bg-[#38bdf8]" />
            <div className="text-[10px] font-black tracking-[0.5em] uppercase text-white/45">
              MARITIME GROUP • BALTIC REGION
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-[-0.04em] leading-[0.95] text-white mb-8 normal-case">
            {t.title}
          </h2>
          
          {/* Short paragraph - fade only, no movement */}
          <motion.p
            initial={{ opacity: 0, filter: 'blur(3px)' }}
            whileInView={{ opacity: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.08, ease: motionPresets.easing }}
            className="text-[rgba(255,255,255,0.72)] text-lg lg:text-xl leading-relaxed max-w-3xl"
          >
            {aboutShort}
          </motion.p>
        </motion.div>

        {/* Key Figures */}
        <motion.div
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.15, ease: motionPresets.easing }}
          className="mt-16 lg:mt-20 overflow-x-hidden"
        >
          {/* Responsive grid: 2 cols mobile, 3 cols sm, 6 cols lg */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10 sm:gap-x-12 lg:gap-x-16"
          >
            {allMetrics.map((m, i) => {
              // Alternating color logic: white, #38bdf8, white, #38bdf8, white, #38bdf8
              const numberColor = i % 2 === 0 ? '#FFFFFF' : '#38bdf8';
              
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.0, delay: i * 0.06, ease: motionPresets.easing }}
                  className="min-w-0 w-full cursor-default group"
                  whileHover={prefersReducedMotion ? undefined : {
                    y: -2,
                    opacity: 1,
                    transition: { duration: 0.4, ease: motionPresets.easing }
                  }}
                >
                    {/* value + suffix - normalized sizing, same font properties, only color changes */}
                    <div className="inline-flex items-baseline whitespace-nowrap">
                      {prefersReducedMotion ? (
                        <>
                          <span 
                            className="text-[44px] sm:text-[52px] lg:text-[56px] font-black tracking-[-0.03em] sm:tracking-[-0.04em] leading-[0.95] sm:leading-none" 
                            style={{ color: numberColor }}
                          >
                            {m.val}
                          </span>
                          <span 
                            className="text-[44px] sm:text-[52px] lg:text-[56px] font-black leading-[0.95] sm:leading-none text-[0.7em] relative -top-[0.05em]"
                            style={{ color: numberColor }}
                          >
                            {m.suffix}
                          </span>
                        </>
                      ) : (
                        <>
                          <span
                            className="text-[44px] sm:text-[52px] lg:text-[56px] font-black tracking-[-0.03em] sm:tracking-[-0.04em] leading-[0.95] sm:leading-none"
                            style={{ color: numberColor }}
                          >
                            <CountUp
                              value={m.val}
                              suffix=""
                              textColor="white"
                              as="span"
                              className="text-[44px] sm:text-[52px] lg:text-[56px] font-black tracking-[-0.03em] sm:tracking-[-0.04em] leading-[0.95] sm:leading-none"
                              styleOverride={{ color: numberColor }}
                            />
                          </span>
                          <span 
                            className="text-[44px] sm:text-[52px] lg:text-[56px] font-black leading-[0.95] sm:leading-none text-[0.7em] relative -top-[0.05em]"
                            style={{ color: numberColor }}
                          >
                            {m.suffix}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Label - improved readability with better contrast */}
                    <motion.div
                      className="mt-5 text-[10px] font-black tracking-[0.3em] uppercase text-white/70 leading-relaxed break-words transition-colors duration-300"
                      whileHover={prefersReducedMotion ? undefined : {
                        color: 'rgba(255,255,255,0.9)',
                        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
                      }}
                    >
                      {m.label}
                    </motion.div>

                    {/* Thin line under each metric - thinner on mobile */}
                    <motion.div
                      className="mt-5 sm:mt-6 h-px w-full bg-white/14 sm:bg-white/20"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.08 + 0.35, ease: motionPresets.easing }}
                    />
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};


const CountUp: React.FC<{
  value: number;
  suffix?: string;
  textColor?: 'dark' | 'white';
  as?: 'div' | 'span';
  className?: string;
  styleOverride?: React.CSSProperties;
}> = ({ value, suffix = '', textColor = 'dark', as = 'div', className, styleOverride }) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!ref) return;
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (media?.matches) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    let started = false;
    const durationMs = 1200;

    const start = () => {
      if (started) return;
      started = true;
      const startT = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - startT) / durationMs);
        // Smoothstep easing (slow-in/slow-out)
        const eased = t * t * (3 - 2 * t);
        setDisplay(Math.round(value * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
      },
      { threshold: 0.35 }
    );
    io.observe(ref);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [ref, value]);

  const defaultClass =
    textColor === 'white'
      ? 'text-4xl lg:text-5xl font-black text-white leading-none'
      : 'text-4xl font-black text-[#0a1d37] tracking-tighter';

  const defaultStyle =
    textColor === 'white'
      ? ({ textShadow: '0 2px 16px rgba(0, 0, 0, 0.4)' } as React.CSSProperties)
      : undefined;

  const Comp: any = as;

  return (
    <Comp ref={setRef} className={className ?? defaultClass} style={styleOverride ?? defaultStyle}>
      {display}
      {suffix}
    </Comp>
  );
};

const Contact: React.FC<{ lang: Language }> = ({ lang }) => {
  const ct = translations[lang].contact;
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    service: ct.services[0], 
    message: '' 
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Detect mobile to disable horizontal animations
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update service when language changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, service: ct.services[0] }));
  }, [lang, ct.services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    await sendToKommo(formData as any);
    setStatus('success');
  };

  return (
    <section id="contact" className="py-32 lg:py-40 bg-[#f7f9fc] overflow-hidden relative scroll-mt-24 max-w-full">
      {/* Soft radial gradients for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Navy accent on the left */}
        <div className="absolute left-0 md:-left-[20%] top-1/2 -translate-y-1/2 w-[80%] md:w-[60%] h-[80%] rounded-full bg-[#0a1d37] opacity-[0.08] blur-[120px]" />
        {/* Brand blue accent on the right */}
        <div className="absolute right-0 md:-right-[20%] top-1/2 -translate-y-1/2 w-[80%] md:w-[60%] h-[80%] rounded-full bg-[#38bdf8] opacity-[0.07] blur-[120px]" />
      </div>

      {/* Subtle noise/grain overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay'
        }}
      />
      
      <motion.div 
        initial={{ opacity: 0, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: motionPresets.easing }}
        className="container mx-auto px-6 lg:px-12 relative z-10 max-w-[1280px]"
      >
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-0 items-stretch">
          {/* Contact info side - dark navy anchor */}
          <motion.div 
            initial={{ opacity: 0, x: isMobile ? 0 : -20, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: motionPresets.easing }}
            className="lg:w-[42%] bg-[#0a1d37] p-10 lg:p-16 relative overflow-hidden"
          >
            {/* Gentle vertical gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d2442] via-[#0c1f3a] to-[#0a1d37] pointer-events-none" />
            
            {/* Subtle noise overlay on dark column */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay'
              }}
            />
            
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black text-white uppercase mb-6 tracking-tighter leading-[0.95]">{ct.title}</h2>
              <p className="text-[rgba(255,255,255,0.75)] mb-16 text-base lg:text-lg font-medium leading-relaxed max-w-[46ch]">{ct.subtitle}</p>
              
              <div className="space-y-12">
                {/* HQ Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.0, delay: 0.1, ease: motionPresets.easing }}
                  className="pb-10 border-b border-[rgba(255,255,255,0.08)]"
                >
                  <h4 className="text-[10px] font-black text-[#38bdf8] uppercase tracking-[0.5em] mb-6">{ct.left.hqLabel}</h4>
                  <p className="text-white font-semibold text-lg lg:text-xl leading-relaxed whitespace-pre-line">{ct.left.address}</p>
                </motion.div>
                
                {/* Direct Contact Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.0, delay: 0.15, ease: motionPresets.easing }}
                  className="space-y-4"
                >
                  <h4 className="text-[10px] font-black text-[#38bdf8] uppercase tracking-[0.5em] mb-6">{ct.left.directLabel}</h4>
                  <motion.a 
                    href={`tel:${ct.left.phone.replace(/\s/g, '')}`}
                    className="block text-white font-semibold text-lg lg:text-xl leading-relaxed group relative"
                    whileHover={shouldReduceMotion ? undefined : { opacity: 0.9 }}
                    transition={{ duration: 0.25, ease: motionPresets.easing }}
                  >
                    {ct.left.phone}
                    <motion.span
                      className="absolute bottom-0 left-0 h-[2px] bg-[#38bdf8]"
                      initial={{ width: 0 }}
                      whileHover={shouldReduceMotion ? undefined : { width: '100%' }}
                      transition={{ duration: 0.35, ease: motionPresets.easing }}
                    />
                  </motion.a>
                  <motion.a 
                    href={`mailto:${ct.left.email}`}
                    className="block text-white font-semibold text-lg lg:text-xl leading-relaxed group relative"
                    whileHover={shouldReduceMotion ? undefined : { opacity: 0.9 }}
                    transition={{ duration: 0.25, ease: motionPresets.easing }}
                  >
                    {ct.left.email}
                    <motion.span
                      className="absolute bottom-0 left-0 h-[2px] bg-[#38bdf8]"
                      initial={{ width: 0 }}
                      whileHover={shouldReduceMotion ? undefined : { width: '100%' }}
                      transition={{ duration: 0.35, ease: motionPresets.easing }}
                    />
                  </motion.a>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          {/* Form side - premium light surface */}
          <motion.div 
            initial={{ opacity: 0, x: isMobile ? 0 : 20, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.1, ease: motionPresets.easing }}
            className="lg:w-[58%] bg-white shadow-[0_24px_80px_rgba(10,29,55,0.08),0_8px_24px_rgba(10,29,55,0.06)] p-10 lg:p-14 relative overflow-hidden"
          >
            {/* Subtle top highlight */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-[#f8fafc]/30 pointer-events-none opacity-60" />
            
            <div className="relative z-10">
              {/* Form label */}
              <div className="mb-10 pb-6 border-b border-[#0a1d37]/8">
                <div className="text-[9px] font-black text-[#0a1d37]/40 uppercase tracking-[0.5em]">{ct.form.header}</div>
              </div>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: motionPresets.easing }}
                    className="text-center py-20"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1, ease: motionPresets.easing }}
                      className="w-24 h-24 bg-[#38bdf8] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_12px_40px_rgba(56,189,248,0.25)]"
                    >
                      <i className="fa-solid fa-check text-4xl text-white"></i>
                    </motion.div>
                    <h3 className="text-3xl font-black text-[#0a1d37] uppercase mb-4">{ct.form.success}</h3>
                    <button onClick={() => setStatus('idle')} className="text-[#38bdf8] font-black uppercase tracking-widest text-[10px] underline hover:text-[#0a1d37] transition-colors">{ct.form.sendAnother}</button>
                  </motion.div>
                ) : (
                  <motion.form
                    initial="hidden"
                    animate="show"
                    variants={motionPresets.staggerContainer}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    {/* Name + Email row */}
                    <motion.div variants={motionPresets.staggerItem} className="grid lg:grid-cols-2 gap-8">
                      <div className="relative group">
                        <input 
                          required 
                          placeholder={ct.form.name} 
                          className="w-full bg-transparent border-b border-[rgba(10,29,55,0.14)] py-4 focus:border-[#38bdf8] focus-visible:outline-none font-semibold text-[#0a1d37] text-base placeholder:text-[rgba(10,29,55,0.35)] transition-all duration-300" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                        <motion.div
                          className="absolute bottom-0 left-0 h-[2px] bg-[#38bdf8]"
                          initial={{ width: 0 }}
                          whileFocus={{ width: '100%' }}
                          transition={{ duration: 0.4, ease: motionPresets.easing }}
                        />
                      </div>
                      <div className="relative group">
                        <input 
                          required 
                          type="email" 
                          placeholder={ct.form.email} 
                          className="w-full bg-transparent border-b border-[rgba(10,29,55,0.14)] py-4 focus:border-[#38bdf8] focus-visible:outline-none font-semibold text-[#0a1d37] text-base placeholder:text-[rgba(10,29,55,0.35)] transition-all duration-300" 
                          value={formData.email} 
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                        <motion.div
                          className="absolute bottom-0 left-0 h-[2px] bg-[#38bdf8]"
                          initial={{ width: 0 }}
                          whileFocus={{ width: '100%' }}
                          transition={{ duration: 0.4, ease: motionPresets.easing }}
                        />
                      </div>
                    </motion.div>

                    {/* Phone + Service row */}
                    <motion.div variants={motionPresets.staggerItem} className="grid lg:grid-cols-2 gap-8">
                      <div className="relative group">
                        <input 
                          type="tel" 
                          placeholder={ct.form.phone} 
                          className="w-full bg-transparent border-b border-[rgba(10,29,55,0.14)] py-4 focus:border-[#38bdf8] focus-visible:outline-none font-semibold text-[#0a1d37] text-base placeholder:text-[rgba(10,29,55,0.35)] transition-all duration-300" 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})} 
                        />
                        <motion.div
                          className="absolute bottom-0 left-0 h-[2px] bg-[#38bdf8]"
                          initial={{ width: 0 }}
                          whileFocus={{ width: '100%' }}
                          transition={{ duration: 0.4, ease: motionPresets.easing }}
                        />
                      </div>
                      <div className="relative group">
                        <select 
                          className="w-full bg-transparent border-b border-[rgba(10,29,55,0.14)] py-4 focus:border-[#38bdf8] focus-visible:outline-none font-semibold text-[#0a1d37] text-base appearance-none cursor-pointer transition-all duration-300"
                          value={formData.service}
                          onChange={e => setFormData({...formData, service: e.target.value})}
                        >
                          {ct.services.map((service) => (
                            <option key={service} value={service}>{service}</option>
                          ))}
                        </select>
                        <motion.div
                          className="absolute bottom-0 left-0 h-[2px] bg-[#38bdf8]"
                          initial={{ width: 0 }}
                          whileFocus={{ width: '100%' }}
                          transition={{ duration: 0.4, ease: motionPresets.easing }}
                        />
                        <div className="absolute right-0 bottom-4 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#0a1d37]/40">
                            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </motion.div>

                    {/* Message textarea */}
                    <motion.div variants={motionPresets.staggerItem} className="relative group">
                      <textarea 
                        rows={5} 
                        placeholder={ct.form.message} 
                        className="w-full bg-transparent border-b border-[rgba(10,29,55,0.14)] py-4 focus:border-[#38bdf8] focus-visible:outline-none font-semibold text-[#0a1d37] text-base placeholder:text-[rgba(10,29,55,0.35)] transition-all duration-300 resize-none" 
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})} 
                      />
                      <motion.div
                        className="absolute bottom-0 left-0 h-[2px] bg-[#38bdf8]"
                        initial={{ width: 0 }}
                        whileFocus={{ width: '100%' }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </motion.div>

                    {/* Submit button */}
                    <motion.div variants={motionPresets.staggerItem} className="pt-6">
                      <motion.button 
                        whileHover={shouldReduceMotion ? undefined : motionPresets.buttonHover}
                        whileTap={motionPresets.buttonTap}
                        type="submit" 
                        disabled={status === 'submitting'} 
                        className="bg-[#0a1d37] text-white px-14 py-5 text-[11px] font-black uppercase tracking-[0.35em] transition-all duration-300 shadow-[0_8px_24px_rgba(10,29,55,0.2)] hover:shadow-[0_12px_32px_rgba(56,189,248,0.15)] hover:bg-[#0d2442] rounded-[var(--radius-md)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 group"
                      >
                        <span>{status === 'submitting' ? ct.form.submitting : ct.form.submit}</span>
                        <motion.svg 
                          width="14" 
                          height="14" 
                          viewBox="0 0 14 14" 
                          fill="none"
                          className="text-white"
                          initial={{ x: 0 }}
                          whileHover={shouldReduceMotion ? undefined : { x: 3 }}
                          transition={{ duration: 0.3, ease: motionPresets.easing }}
                        >
                          <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </motion.svg>
                      </motion.button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

const Footer: React.FC<{ lang: Language }> = ({ lang }) => {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.footer
      initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.2, ease: motionPresets.easing }}
      className="bg-[#0a1d37] text-white pt-32 pb-16 overflow-x-hidden max-w-full"
    >
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.05 }}
          className="grid lg:grid-cols-4 gap-20 mb-32"
        >
          <motion.div variants={motionPresets.staggerItem} className="col-span-1 lg:col-span-1">
             <div className="text-4xl font-black tracking-tighter text-white mb-10 leading-none">
                SKIP<span className="text-sky-400">MAR</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-12 font-medium">
                Pioneering maritime excellence through strategic workforce placement and robust supply chain integration across the Baltic region.
              </p>
              <div className="flex space-x-6">
                {[
                  { icon: 'fa-facebook-f', href: '#' },
                  { icon: 'fa-linkedin-in', href: '#' },
                  { icon: 'fa-instagram', href: '#' }
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    className="w-11 h-11 rounded-sm border border-white/10 flex items-center justify-center"
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.05, backgroundColor: '#0ea5e9', borderColor: '#0ea5e9', color: '#0a1d37' }}
                    transition={{ duration: 0.3, ease: motionPresets.easing }}
                  >
                    <i className={`fa-brands ${social.icon}`}></i>
                  </motion.a>
                ))}
              </div>
          </motion.div>
          
          <motion.div variants={motionPresets.staggerItem} className="lg:pl-16">
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-10 text-sky-400">NAVIGATION</h4>
            <ul className="space-y-6 text-sm font-bold text-white/40">
              {[
                { href: '#', label: 'HOME BASE' },
                { href: '#about', label: 'OUR HISTORY' },
                { href: '#services', label: 'OPERATIONS' },
                { href: '#contact', label: 'CONNECT' }
              ].map((link, i) => (
                <li key={i}>
                  <motion.a
                    href={link.href}
                    className="relative inline-block"
                    whileHover={shouldReduceMotion ? undefined : { opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="relative z-10">{link.label}</span>
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 bg-white"
                      initial={{ width: 0 }}
                      whileHover={shouldReduceMotion ? undefined : { width: '100%' }}
                      transition={{ duration: 0.35, ease: motionPresets.easing }}
                    />
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={motionPresets.staggerItem}>
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-10 text-sky-400">OPERATIONAL</h4>
            <ul className="space-y-6 text-sm font-bold text-white/40">
              {[
                { href: '#', label: 'FLEET STATUS' },
                { href: '#', label: 'PORT LOGISTICS' },
                { href: '#', label: 'TECHNICAL WELDING' },
                { href: '#', label: 'CREW MANAGEMENT' }
              ].map((link, i) => (
                <li key={i}>
                  <motion.a
                    href={link.href}
                    className="relative inline-block"
                    whileHover={shouldReduceMotion ? undefined : { opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="relative z-10">{link.label}</span>
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 bg-white"
                      initial={{ width: 0 }}
                      whileHover={shouldReduceMotion ? undefined : { width: '100%' }}
                      transition={{ duration: 0.35, ease: motionPresets.easing }}
                    />
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={motionPresets.staggerItem}>
            <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-10 text-sky-400">RESOURCES</h4>
            <ul className="space-y-6 text-sm font-bold text-white/40">
              {[
                { href: '#', label: 'MEDIA CENTER' },
                { href: '#', label: 'CAREERS' },
                { href: '#', label: 'COMPLIANCE' },
                { href: '#', label: 'SUPPORT' }
              ].map((link, i) => (
                <li key={i}>
                  <motion.a
                    href={link.href}
                    className="relative inline-block"
                    whileHover={shouldReduceMotion ? undefined : { opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="relative z-10">{link.label}</span>
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 bg-white"
                      initial={{ width: 0 }}
                      whileHover={shouldReduceMotion ? undefined : { width: '100%' }}
                      transition={{ duration: 0.35, ease: motionPresets.easing }}
                    />
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.2, ease: motionPresets.easing }}
          className="relative border-t border-white/5 pt-16 flex flex-col md:flex-row justify-between items-center gap-10"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3, ease: motionPresets.easing }}
            className="absolute top-0 left-0 h-px w-full bg-white/10 origin-left"
          />
          <p className="text-white/20 text-[10px] font-black tracking-[0.5em] uppercase">© 2024 SKIPMAR OÜ — MARITIME LOGISTICS GROUP. ESTABLISHED 2008.</p>
          <div className="text-white/30 text-[10px] font-black tracking-widest uppercase flex items-center space-x-2">
            <span>ENGINEERED BY</span>
            <span className="text-white font-black hover:text-sky-400 cursor-pointer">SKIPMAR TECH</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('EN');
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    initKommoWidget();

    // Initialize Lenis smooth scrolling
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.25,
        easing: (t: number) => 1 - Math.pow(1 - t, 3), // Cubic ease out
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
      });

      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    }
  }, []);

  return (
    <>
      <Preloader />
      <div className="min-h-screen bg-white selection:bg-sky-500 selection:text-[#0a1d37] font-sans overflow-x-hidden max-w-full">
        <Header lang={lang} setLang={setLang} />
        <main className="overflow-x-hidden max-w-full">
          <Hero lang={lang} />
          <ServicesGrid lang={lang} />
          <About lang={lang} />
          <Contact lang={lang} />
        </main>
        <Footer lang={lang} />
      </div>
    </>
  );
}