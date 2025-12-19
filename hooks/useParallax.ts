import { useEffect, useRef, useState } from 'react';

/**
 * Hook for scroll-reactive parallax on service card images
 * Uses progress-based calculation: progress = clamp((viewportCenter - cardCenter) / viewportHeight, -1, 1)
 * Respects prefers-reduced-motion and uses IntersectionObserver for performance
 */
export const useScrollParallax = (options?: { translateYRange?: number; enableZoom?: boolean }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translate3d(0, 0, 0) scale(1.05)');
  const isVisibleRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const translateYRange = options?.translateYRange ?? 14;
  const enableZoom = options?.enableZoom ?? true;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const image = imageRef.current;
    const card = cardRef.current;
    if (!image || !card) return;

    const updateParallax = () => {
      if (!isVisibleRef.current) {
        rafIdRef.current = null;
        return;
      }

      const cardRect = card.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      const cardCenter = cardRect.top + cardRect.height / 2;

      // Calculate progress: clamp((viewportCenter - cardCenter) / viewportHeight, -1, 1)
      const rawProgress = (viewportCenter - cardCenter) / viewportHeight;
      const progress = Math.max(-1, Math.min(1, rawProgress));

      // TranslateY: progress * translateYRange
      const translateY = progress * translateYRange;

      // Optional zoom: scale = 1.05 + (1 - abs(progress)) * 0.02
      // This creates a subtle Ken Burns effect (zooms in as card approaches center)
      const scale = enableZoom ? 1.05 + (1 - Math.abs(progress)) * 0.02 : 1.05;

      // Center the scaled image: translate(-50%, -50%) to center, then apply parallax
      setTransform(`translate3d(-50%, calc(-50% + ${translateY}px), 0) scale(${scale})`);

      rafIdRef.current = requestAnimationFrame(updateParallax);
    };

    // IntersectionObserver to only animate when card is near viewport
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
      {
        rootMargin: '100px', // Start animating slightly before card enters viewport
        threshold: 0,
      }
    );

    observer.observe(card);

    const handleScroll = () => {
      if (isVisibleRef.current && !rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateParallax();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [translateYRange, enableZoom]);

  return {
    imageRef,
    cardRef,
    style: {
      transform,
      willChange: 'transform',
    },
  };
};

/**
 * Hook for subtle pointer-based parallax (tilt effect)
 * Very subtle rotation and image shift
 */
export const usePointerParallax = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ transform: 'rotateX(0deg) rotateY(0deg)' });
  const [imageStyle, setImageStyle] = useState({ transform: 'translate(0px, 0px)' });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const card = cardRef.current;
    const image = imageRef.current;
    if (!card || !image) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -2; // Max 2deg
      const rotateY = ((x - centerX) / centerX) * 2; // Max 2deg

      const imageOffsetX = ((x - centerX) / centerX) * 8; // Max 8px
      const imageOffsetY = ((y - centerY) / centerY) * 8; // Max 8px

      setStyle({
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      });
      setImageStyle({
        transform: `translate(${imageOffsetX}px, ${imageOffsetY}px)`,
      });
    };

    const handleMouseLeave = () => {
      setStyle({ transform: 'rotateX(0deg) rotateY(0deg)' });
      setImageStyle({ transform: 'translate(0px, 0px)' });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return {
    cardRef,
    imageRef,
    cardStyle: style,
    imageStyle: { ...imageStyle, transition: 'transform 0.1s ease-out' },
  };
};

/**
 * Hook for scroll parallax on full-width section backgrounds
 * Moves background image slower than scroll for subtle depth effect
 * Optimized with IntersectionObserver and requestAnimationFrame
 */
export const useParallaxSection = (options?: { translateYRange?: number }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [transform, setTransform] = useState('translate3d(0, 0, 0)');
  const isVisibleRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const translateYRange = options?.translateYRange ?? 24; // Total movement range in pixels

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return;

    const updateParallax = () => {
      if (!isVisibleRef.current) {
        rafIdRef.current = null;
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      const sectionCenter = rect.top + rect.height / 2;

      // Calculate progress: how far through viewport the section center is
      // -1 when section is above viewport, 0 when centered, +1 when below
      const rawProgress = (viewportCenter - sectionCenter) / viewportHeight;
      const progress = Math.max(-1, Math.min(1, rawProgress));

      // Parallax: image moves slower than scroll
      // When scrolling down (progress increases), image moves up (negative translateY)
      const translateY = progress * translateYRange;

      setTransform(`translate3d(0, ${translateY}px, 0)`);
      rafIdRef.current = requestAnimationFrame(updateParallax);
    };

    // IntersectionObserver to only animate when section is near viewport
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
      {
        rootMargin: '200px', // Start animating before section enters viewport
        threshold: 0,
      }
    );

    observer.observe(section);

    const handleScroll = () => {
      if (isVisibleRef.current && !rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateParallax();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [translateYRange]);

  return {
    sectionRef,
    imageRef,
    imageStyle: {
      transform,
      willChange: 'transform',
    },
  };
};

