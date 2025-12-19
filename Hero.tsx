import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Language } from './types';
import { translations } from './translations';

export const Hero: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang].hero;
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  // Double-video crossfade loop (fixes visible jump between end/start frames)
  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);
  const wrapARef = useRef<HTMLDivElement | null>(null);
  const wrapBRef = useRef<HTMLDivElement | null>(null);

  const activeIdxRef = useRef<0 | 1>(0);
  const isFadingRef = useRef(false);
  const fadeStartRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const a = videoARef.current;
    const b = videoBRef.current;
    const wa = wrapARef.current;
    const wb = wrapBRef.current;
    if (!a || !b || !wa || !wb) return;

    // Settings
    const playbackRate = 0.75; // slow video
    const fadeSeconds = 1.4; // crossfade duration (longer = smoother)

    // Initialize
    a.muted = true;
    b.muted = true;
    a.playsInline = true;
    b.playsInline = true;

    // Respect reduced motion: keep a single looping layer (no crossfade / RAF work)
    if (shouldReduceMotion) {
      a.loop = true;
      b.loop = false;
      wa.style.opacity = '1';
      wb.style.opacity = '0';
      a.playbackRate = playbackRate;
      void a.play().catch(() => {});
      return;
    }

    // We manage looping manually to avoid the hard jump
    a.loop = false;
    b.loop = false;

    const applyRate = (v: HTMLVideoElement) => {
      v.playbackRate = playbackRate;
    };

    const setInitialVis = () => {
      // A is visible, B hidden
      wa.style.opacity = '1';
      wb.style.opacity = '0';
    };

    const safePlay = async (v: HTMLVideoElement) => {
      try {
        const p = v.play();
        if (p && typeof (p as Promise<void>).then === 'function') await p;
      } catch {
        // Autoplay can be blocked in some contexts; ignore.
      }
    };

    const resetVideo = (v: HTMLVideoElement) => {
      try {
        v.pause();
        v.currentTime = 0;
      } catch {
        // ignore
      }
    };

    const startOther = async (other: HTMLVideoElement) => {
      resetVideo(other);
      await safePlay(other);
    };

    // Apply playback rate now + when metadata loads
    const onMetaA = () => applyRate(a);
    const onMetaB = () => applyRate(b);
    applyRate(a);
    applyRate(b);
    a.addEventListener('loadedmetadata', onMetaA);
    b.addEventListener('loadedmetadata', onMetaB);

    // Start state
    setInitialVis();
    resetVideo(b);
    safePlay(a);

    const tick = () => {
      const idx = activeIdxRef.current;
      const active = idx === 0 ? a : b;
      const other = idx === 0 ? b : a;
      const wActive = idx === 0 ? wa : wb;
      const wOther = idx === 0 ? wb : wa;

      const dur = active.duration;
      const ct = active.currentTime;

      // Crossfade trigger
      if (!isFadingRef.current && Number.isFinite(dur) && dur > 0) {
        const triggerAt = Math.max(0, dur - fadeSeconds);
        if (ct >= triggerAt) {
          isFadingRef.current = true;
          fadeStartRef.current = performance.now();
          // Start the other video from the beginning without blocking the RAF loop
          void startOther(other);
        }
      }

      // Crossfade progress
      if (isFadingRef.current) {
        const t = (performance.now() - fadeStartRef.current) / (fadeSeconds * 1000);
        const p = Math.min(1, Math.max(0, t));
        // Ease-in-out (smoothstep)
        const eased = p * p * (3 - 2 * p);
        wActive.style.opacity = String(1 - eased);
        wOther.style.opacity = String(eased);

        if (p >= 1) {
          // Swap roles
          resetVideo(active);
          activeIdxRef.current = idx === 0 ? 1 : 0;
          isFadingRef.current = false;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      a.removeEventListener('loadedmetadata', onMetaA);
      b.removeEventListener('loadedmetadata', onMetaB);
    };
  }, [shouldReduceMotion]);

  // Very subtle parallax drift (calm, low amplitude)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : -18]);

  const content = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  } as const;

  const stack = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  } as const;

  const renderHeadline = () => {
    const lines = {
      EN: {
        line1: 'Ship Supplies',
        line2: 'Workforce Solutions',
        line3: 'In Baltic Ports',
      },
      ET: {
        line1: 'Laevade Varustamine',
        line2: 'Tööjõu Koordineerimine',
        line3: 'Balti Sadamates',
      },
      FI: {
        line1: 'Laivatarvikkeet',
        line2: 'Työvoiman Koordinointi',
        line3: 'Itämeren Satamissa',
      },
    };

    const currentLines = lines[lang as keyof typeof lines] || lines.EN;

    return (
      <>
        <span className="block text-white">
          {currentLines.line1} <span className="text-white">&</span> <span className="text-sky-400">{currentLines.line2}</span>
        </span>
        <span className="block text-white/75 text-[0.45em] tracking-[0.08em] mt-5 hero-text-shadow-sm leading-[1.6]">{currentLines.line3}</span>
      </>
    );
  };

  const featureCards = {
    EN: [
      { label: '24/7 Availability', icon: 'clock' },
      { label: 'Fast Response', icon: 'bolt' },
      { label: 'Baltic Ports', icon: 'pin' },
      { label: 'Reliable Delivery', icon: 'shield' },
    ],
    ET: [
      { label: '24/7 Kättesaadavus', icon: 'clock' },
      { label: 'Kiire Reageerimine', icon: 'bolt' },
      { label: 'Balti Sadamad', icon: 'pin' },
      { label: 'Usaldusväärne Tarne', icon: 'shield' },
    ],
    FI: [
      { label: '24/7 Saatavilla', icon: 'clock' },
      { label: 'Nopea Vaste', icon: 'bolt' },
      { label: 'Itämeren Satamat', icon: 'pin' },
      { label: 'Luotettava Toimitus', icon: 'shield' },
    ],
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center bg-[#0a1d37] overflow-hidden pt-24 max-w-full">
      {/* Full-bleed maritime background + stable overlay */}
      <motion.div className="absolute inset-0 z-0 overflow-hidden max-w-full" style={{ y: bgY }}>
        {/* Double-layer video (crossfade loop to hide end/start jump) */}
        <div
          ref={wrapARef}
          className="absolute inset-0"
          style={{ opacity: 1 }}
          aria-hidden="true"
        >
          <video
            ref={videoARef}
            className="absolute w-full md:w-[130%] h-[130%] inset-y-0 left-0 object-cover saturate-[0.9] contrast-[1.05] brightness-[0.88] hue-rotate-[-6deg] translate-x-0 md:translate-x-[-0%] translate-y-[7%] will-change-transform max-w-full"
            autoPlay
            muted
            playsInline
            preload="metadata"
          >
            <source src="https://drive.google.com/uc?export=download&id=1H0WwUMHwAzhCUntQg0e0ec-4xKmFT1Xh" type="video/mp4" />
          </video>
        </div>

        <div
          ref={wrapBRef}
          className="absolute inset-0"
          style={{ opacity: 0 }}
          aria-hidden="true"
        >
          <video
            ref={videoBRef}
            className="absolute w-full md:w-[130%] h-[130%] inset-y-0 left-0 object-cover saturate-[0.9] contrast-[1.05] brightness-[0.88] hue-rotate-[-6deg] translate-x-0 md:translate-x-[-0%] translate-y-[7%] will-change-transform max-w-full"
            autoPlay
            muted
            playsInline
            preload="metadata"
          >
            <source src="https://drive.google.com/uc?export=download&id=1H0WwUMHwAzhCUntQg0e0ec-4xKmFT1Xh" type="video/mp4" />
          </video>
        </div>

        {/* Stable dark navy overlay stack (calm + readable) */}
        <div className="absolute inset-0 bg-[#0b1f3a]/42" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f3a]/65 via-[#0b1f3a]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1d37]/55 via-transparent to-[#0a1d37]/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1d37]/92 via-[#0a1d37]/25 to-transparent" />
        {/* Soft radial glows (very low opacity) */}
        <div className="absolute -top-48 -left-48 w-[44rem] h-[44rem] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-56 -right-56 w-[48rem] h-[48rem] rounded-full bg-white/5 blur-3xl" />
        {/* Subtle grain/noise */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </motion.div>

      <div className="container mx-auto px-6 lg:px-12 relative z-30 py-16 lg:py-20">
        <motion.div
          className="max-w-4xl"
          variants={stack}
          initial={shouldReduceMotion ? 'show' : 'hidden'}
          animate="show"
        >
          <motion.div variants={content} className="flex items-center space-x-4 mb-10">
            <div className="h-0.5 w-10 bg-sky-500 flex-shrink-0"></div>
            <span className="text-sky-300 text-[10px] font-black tracking-[0.5em] uppercase">
              MARITIME GROUP • BALTIC REGION
            </span>
          </motion.div>

          <motion.h1
            variants={content}
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.92] mb-12 tracking-tight hero-text-shadow"
            style={{ maxWidth: 'min(100%, 90ch)' }}
          >
            {renderHeadline()}
          </motion.h1>

          <motion.div
            variants={content}
            className="mb-16"
          >
            <motion.a
              href="#contact"
              whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="bg-sky-500 text-[#0a1d37] px-14 py-5 text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl relative overflow-hidden group rounded-[var(--radius-md)] inline-block"
            >
              <span className="relative z-10">{t.cta}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500" />
            </motion.a>
          </motion.div>

          {/* Benefits row (single row on desktop, premium glass blocks) */}
          <motion.div variants={content} className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(300px,1fr))] gap-5 lg:gap-5">
              {(featureCards[lang as keyof typeof featureCards] || featureCards.EN).map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { y: -2, backgroundColor: 'rgba(255,255,255,0.08)' }
                  }
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-[var(--radius-lg)] border border-white/10 bg-white/5 backdrop-blur-md px-7 py-6 text-white/85 overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm border border-white/10 bg-black/10 flex-shrink-0">
                      {item.icon === 'clock' && (
                        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="text-white/80">
                          <path
                            d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-18a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm1 4a1 1 0 0 0-2 0v4.4c0 .27.1.52.3.71l2.4 2.4a1 1 0 1 0 1.4-1.42L13 11.99V8Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                      {item.icon === 'bolt' && (
                        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="text-white/80">
                          <path
                            d="M13 2 3 14h8l-1 8 11-14h-8l0-6Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                      {item.icon === 'pin' && (
                        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="text-white/80">
                          <path
                            d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                      {item.icon === 'shield' && (
                        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="text-white/80">
                          <path
                            d="M12 2 20 6v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </span>
                    <div className="text-sm font-black uppercase tracking-[0.24em] leading-[1.25] text-white/90 whitespace-normal break-words min-w-0 flex-1">
                      {item.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
