import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

function setupGsap() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

function shouldReduceMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const premiumEase = "expo.out";
const premiumShadow = "0 26px 80px rgba(0, 0, 0, 0.18), 0 1px 0 rgba(255, 255, 255, 0.08) inset";

export function useGsapPage<T extends HTMLElement>(scope: RefObject<T | null>) {
  useEffect(() => {
    if (typeof window === "undefined" || !scope.current || shouldReduceMotion()) return;

    setupGsap();
    const cleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      const entrance = gsap.timeline({
        defaults: {
          ease: premiumEase,
          duration: 1.15,
        },
      });

      entrance
        .from("[data-gsap-hero]", {
          autoAlpha: 0,
          y: 42,
          filter: "blur(14px)",
        })
        .from(
          "[data-gsap-word]",
          {
            autoAlpha: 0,
            yPercent: 82,
            rotateX: -16,
            filter: "blur(8px)",
            transformOrigin: "50% 100%",
            duration: 0.95,
            stagger: 0.045,
          },
          "-=0.82",
        )
        .from(
          "[data-gsap-hero-visual]",
          {
            autoAlpha: 0,
            y: 58,
            scale: 0.94,
            rotateX: 3,
            filter: "blur(18px)",
            transformPerspective: 1200,
          },
          "-=0.72",
        );

      gsap.utils.toArray<HTMLElement>("[data-gsap-parallax]").forEach((element) => {
        gsap.to(element, {
          y: -42,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-drift]").forEach((element) => {
        gsap.to(element, {
          y: -10,
          duration: 4.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-reveal]").forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 38,
          filter: "blur(12px)",
          duration: 1.05,
          ease: premiumEase,
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-stagger]").forEach((group) => {
        const cards = group.querySelectorAll("[data-gsap-card]");
        if (!cards.length) return;

        gsap.from(cards, {
          autoAlpha: 0,
          y: 34,
          scale: 0.985,
          filter: "blur(10px)",
          duration: 0.95,
          stagger: 0.075,
          ease: premiumEase,
          scrollTrigger: {
            trigger: group,
            start: "top 86%",
            once: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-hover]").forEach((element) => {
        const enter = () => {
          gsap.set(element, { transformPerspective: 1000, transformOrigin: "50% 50%" });
          gsap.to(element, {
            scale: 1.025,
            y: -7,
            boxShadow: premiumShadow,
            duration: 0.42,
            ease: "power3.out",
            overwrite: "auto",
          });
        };
        const move = (event: PointerEvent) => {
          const rect = element.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(element, {
            rotateY: x * 3.2,
            rotateX: y * -3.2,
            duration: 0.38,
            ease: "power2.out",
            overwrite: "auto",
          });
        };
        const leave = () =>
          gsap.to(element, {
            scale: 1,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });

        element.addEventListener("pointerenter", enter);
        element.addEventListener("pointermove", move);
        element.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          element.removeEventListener("pointerenter", enter);
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerleave", leave);
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-button]").forEach((element) => {
        const enter = () =>
          gsap.to(element, {
            scale: 1.025,
            y: -2,
            filter: "drop-shadow(0 14px 26px rgba(0, 0, 0, 0.16))",
            duration: 0.3,
            ease: "power3.out",
            overwrite: "auto",
          });
        const leave = () =>
          gsap.to(element, {
            scale: 1,
            y: 0,
            filter: "drop-shadow(0 0 0 rgba(0, 0, 0, 0))",
            duration: 0.36,
            ease: "power3.out",
            overwrite: "auto",
          });

        element.addEventListener("pointerenter", enter);
        element.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          element.removeEventListener("pointerenter", enter);
          element.removeEventListener("pointerleave", leave);
        });
      });
    }, scope);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, [scope]);
}

export function useGsapNavbar<T extends HTMLElement>(scope: RefObject<T | null>) {
  useEffect(() => {
    if (typeof window === "undefined" || !scope.current || shouldReduceMotion()) return;

    setupGsap();
    const header = scope.current;
    const ctx = gsap.context(() => {
      gsap.from(header, {
        autoAlpha: 0,
        y: -34,
        filter: "blur(12px)",
        duration: 1,
        ease: premiumEase,
      });
    }, scope);

    let lastScroll = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      const shouldHide = current > lastScroll && current > 120;

      gsap.to(header, {
        y: shouldHide ? -92 : 0,
        autoAlpha: shouldHide ? 0.92 : 1,
        duration: 0.46,
        ease: "power3.out",
        overwrite: "auto",
      });
      lastScroll = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      ctx.revert();
    };
  }, [scope]);
}
