import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { CONSENT_VERSION, SITE_KEY, getLeadsEndpoint } from "../lib/site";

declare global {
  interface Window {
    __lastLeadPayload?: Record<string, unknown>;
  }
}

export function initSite(): void {
  document.documentElement.classList.add("js");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  initNav(reduce);
  initFaq();
  initForms(reduce);
  initBentoMicro(reduce);

  if (reduce) return;

  gsap.registerPlugin(ScrollTrigger);
  initMotion(fine);
}

function initNav(reduce: boolean): void {
  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");
  if (!menu || !menuBtn || !nav) return;

  function setMenu(open: boolean): void {
    menu!.classList.toggle("open", open);
    menuBtn!.setAttribute("aria-expanded", String(open));
    menuBtn!.textContent = open ? "Close" : "Menu";
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open && !reduce) {
      gsap.from("#menu nav a", {
        y: 30,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: "power3.out",
      });
    }
  }

  menuBtn.addEventListener("click", () =>
    setMenu(!menu.classList.contains("open")),
  );
  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setMenu(false));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("#links a"),
  );
  const indicator = document.getElementById("indicator");

  function sectionForHref(href: string): Element | null {
    try {
      const url = new URL(href, location.href);
      if (url.pathname !== location.pathname) return null;
      if (!url.hash) return null;
      return document.querySelector(url.hash);
    } catch {
      return null;
    }
  }

  const sections = links.map((a) =>
    sectionForHref(a.getAttribute("href") || ""),
  );
  const hasInPageSections = sections.some(Boolean);
  let lastY = 0;

  function pathActiveIndex(): number {
    let match = -1;
    links.forEach((a, i) => {
      try {
        const url = new URL(a.getAttribute("href") || "", location.href);
        if (url.hash) return;
        if (url.pathname === location.pathname) match = i;
      } catch {
        /* ignore bad href */
      }
    });
    return match;
  }

  function spy(): void {
    const y = window.scrollY;
    const dy = y - lastY;
    if (Math.abs(dy) > 6) {
      nav!.classList.toggle(
        "hide",
        dy > 0 && y > 400 && !menu!.classList.contains("open"),
      );
      lastY = y;
    }
    let active = -1;
    if (hasInPageSections) {
      sections.forEach((s, i) => {
        if (s && s.getBoundingClientRect().top < window.innerHeight * 0.45) {
          active = i;
        }
      });
    }
    if (active === -1) active = pathActiveIndex();
    links.forEach((a, i) => a.classList.toggle("on", i === active));
    if (indicator) {
      if (active > -1) {
        const a = links[active];
        indicator.style.width = `${a.offsetWidth}px`;
        indicator.style.translate = `${a.offsetLeft}px 0`;
        indicator.style.opacity = "1";
      } else {
        indicator.style.opacity = "0";
      }
    }
  }

  // Lenis drives scroll updates when available; otherwise passive scroll.
  window.addEventListener("scroll", spy, { passive: true });
  spy();
}

function initFaq(): void {
  document.querySelectorAll<HTMLButtonElement>(".qa button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".qa");
      if (!item) return;
      const open = item.hasAttribute("data-open");
      if (open) item.removeAttribute("data-open");
      else item.setAttribute("data-open", "");
      btn.setAttribute("aria-expanded", String(!open));
    });
  });
}

function initForms(reduce: boolean): void {
  const tabs = document.getElementById("tabs");
  const tabBtns = [
    document.getElementById("tabQuote"),
    document.getElementById("tabVendor"),
  ].filter(Boolean) as HTMLElement[];
  const forms = [
    document.getElementById("formQuote"),
    document.getElementById("formVendor"),
  ].filter(Boolean) as HTMLFormElement[];
  const success = document.getElementById("success");
  if (!tabs || !success || forms.length < 2 || tabBtns.length < 2) return;

  function selectTab(i: number, focus = false): void {
    tabs!.setAttribute("data-active", String(i));
    tabBtns.forEach((b, k) => {
      b.setAttribute("aria-selected", String(k === i));
      b.tabIndex = k === i ? 0 : -1;
    });
    forms.forEach((f, k) => {
      f.hidden = k !== i;
    });
    success!.classList.remove("show");
    if (focus) tabBtns[i].focus();
  }

  tabBtns.forEach((b, i) => {
    b.addEventListener("click", () => selectTab(i));
    b.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        selectTab(i === 0 ? 1 : 0, true);
      }
    });
  });

  document.querySelectorAll("[data-vendor-link]").forEach((a) => {
    a.addEventListener("click", () => selectTab(1));
  });

  if (location.hash === "#vendor") selectTab(1);

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validate(form: HTMLFormElement): HTMLElement[] {
    const bad: HTMLElement[] = [];
    form.querySelectorAll(".field").forEach((f) => f.removeAttribute("data-error"));
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "[required]",
    ).forEach((el) => {
      let ok = true;
      if (el instanceof HTMLInputElement && el.type === "checkbox") {
        ok = el.checked;
      } else if (el instanceof HTMLInputElement && el.type === "email") {
        ok = emailRe.test(el.value.trim());
      } else {
        ok = el.value.trim() !== "";
      }
      el.setAttribute("aria-invalid", String(!ok));
      if (!ok) {
        el.closest(".field")?.setAttribute("data-error", "");
        bad.push(el);
      }
    });
    (["services", "trades"] as const).forEach((name) => {
      const boxes = form.querySelectorAll<HTMLInputElement>(
        `input[name="${name}"]`,
      );
      if (
        boxes.length &&
        !Array.from(boxes).some((b) => b.checked)
      ) {
        boxes[0].closest(".field")?.setAttribute("data-error", "");
        bad.push(boxes[0]);
      }
    });
    return bad;
  }

  function payload(form: HTMLFormElement): Record<string, unknown> {
    const fd = new FormData(form);
    const get = (k: string) => (fd.get(k) || "").toString().trim();
    const fields: Record<string, FormDataEntryValue | FormDataEntryValue[]> =
      {};
    fd.forEach((v, k) => {
      if (
        ["name", "email", "phone", "company", "consent", "website"].includes(k)
      ) {
        return;
      }
      if (k === "services" || k === "trades") fields[k] = fd.getAll(k);
      else fields[k] = v;
    });
    return {
      site_key: SITE_KEY,
      form: form.dataset.form,
      request_id:
        window.crypto?.randomUUID?.() ?? String(Date.now()),
      contact: {
        name: get("name"),
        email: get("email"),
        phone: get("phone"),
        company: get("company"),
      },
      fields,
      consent: {
        privacy: !!fd.get("consent"),
        contact_ok: !!fd.get("consent"),
        wording_version: CONSENT_VERSION,
      },
      context: {
        page: location.pathname,
        referrer: document.referrer,
        utm: { source: "", campaign: "" },
      },
      turnstile_token: "",
    };
  }

  async function submitLead(
    body: Record<string, unknown>,
  ): Promise<{ ok: boolean; leadId?: string }> {
    const endpoint = getLeadsEndpoint();
    if (!endpoint) {
      await new Promise((r) => setTimeout(r, 1300));
      return {
        ok: true,
        leadId: `TCB-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      };
    }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return { ok: false };
      const data = (await res.json()) as { lead_id?: string };
      return { ok: true, leadId: data.lead_id };
    } catch {
      return { ok: false };
    }
  }

  forms.forEach((form) => {
    form.addEventListener("input", (e) => {
      const t = e.target as HTMLElement;
      const f = t.closest(".field");
      if (f?.hasAttribute("data-error")) {
        f.removeAttribute("data-error");
        if ("setAttribute" in t) {
          (t as HTMLElement).setAttribute("aria-invalid", "false");
        }
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const honey = form.querySelector<HTMLInputElement>('input[name="website"]');
      if (honey?.value) return;

      const bad = validate(form);
      if (bad.length) {
        bad[0].focus();
        return;
      }

      const btn = form.querySelector<HTMLButtonElement>("[data-submit]");
      const label = btn?.querySelector("[data-label]");
      if (!btn || !label) return;
      const old = label.textContent || "";
      btn.disabled = true;
      label.innerHTML =
        'Sending <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>';

      const body = payload(form);
      window.__lastLeadPayload = body;

      const result = await submitLead(body);
      btn.disabled = false;
      label.textContent = old;

      const banner = form.querySelector("[data-banner]");
      if (!result.ok) {
        banner?.classList.add("show");
        return;
      }
      banner?.classList.remove("show");

      const vendor = form.dataset.form === "vendor_application";
      const title = document.getElementById("successTitle");
      const text = document.getElementById("successText");
      const refId = document.getElementById("refId");
      if (title) {
        title.textContent = vendor
          ? "Thank you for your interest in working with Titan Core Builders."
          : "Thank you. Your request has been received.";
      }
      if (text) {
        text.textContent = vendor
          ? "Our team will review your information and contact you if your services match an active market need."
          : "A member of our team will review the information and contact you about the next step.";
      }
      if (refId) {
        refId.textContent =
          result.leadId ||
          `TCB-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      }

      form.hidden = true;
      success.classList.add("show");
      success.focus();
      if (!reduce) {
        gsap.from("#success > *", {
          y: 16,
          opacity: 0,
          stagger: 0.06,
          duration: 0.5,
          ease: "power3.out",
        });
      }
      form.reset();
    });
  });

  document.getElementById("again")?.addEventListener("click", () => {
    selectTab(Number(tabs.getAttribute("data-active")));
  });
}

function initBentoMicro(reduce: boolean): void {
  const addresses = [
    "2218 Monument Ave, Richmond, VA",
    "814 Cass Ave, Detroit, MI",
    "47 Irving Pl, Brooklyn, NY",
    "1901 Pearl St, Austin, TX",
    "1201 Pike St, Seattle, WA",
  ];
  const typer = document.getElementById("typer");
  if (!typer) return;

  if (reduce) {
    typer.textContent = addresses[0];
  } else {
    const type = (ai: number, ci: number, del: boolean): void => {
      const s = addresses[ai];
      typer.textContent = s.slice(0, ci);
      if (!del && ci < s.length) {
        setTimeout(() => type(ai, ci + 1, false), 55);
        return;
      }
      if (!del) {
        setTimeout(() => type(ai, ci, true), 1600);
        return;
      }
      if (ci > 0) {
        setTimeout(() => type(ai, ci - 1, true), 22);
        return;
      }
      setTimeout(() => type((ai + 1) % addresses.length, 0, false), 300);
    };
    type(0, 0, false);
  }

  const checks = Array.from(
    document.querySelectorAll<HTMLElement>("#checks .check .tag"),
  ).slice(0, 3);

  if (reduce) {
    checks.forEach((t) => {
      t.textContent = "Done";
      t.classList.add("done");
    });
  } else {
    let ci = 0;
    setInterval(() => {
      if (ci < checks.length) {
        checks[ci].textContent = "Done";
        checks[ci].classList.add("done");
        ci++;
      } else {
        checks.forEach((t) => {
          t.textContent = "Pending";
          t.classList.remove("done");
        });
        ci = 0;
      }
    }, 1400);
  }
}

function initMotion(fine: boolean): void {
  const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);

  const spyNav = (): void => {
    window.dispatchEvent(new Event("scroll"));
  };
  lenis.on("scroll", spyNav);

  gsap.ticker.add((t) => {
    lenis.raf(t * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      let target: Element | null = null;
      try {
        const url = new URL(href, location.href);
        if (url.pathname !== location.pathname || !url.hash) return;
        target = document.querySelector(url.hash);
      } catch {
        return;
      }
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: -90 });
      }
    });
  });

  // Hero
  gsap.from("#heroKick", { y: 16, opacity: 0, duration: 0.8, ease: "power3.out" });
  gsap.from("#heroTitle", {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: "power4.out",
    delay: 0.05,
  });
  gsap.fromTo(
    "#mark",
    { "--sx": 0 },
    { "--sx": 1, duration: 0.9, delay: 0.6, ease: "power3.inOut" },
  );
  gsap.from(".hero-sub", {
    y: 20,
    opacity: 0,
    duration: 0.9,
    delay: 0.3,
    stagger: 0.1,
    ease: "power3.out",
  });
  gsap.from(".hero-frame", {
    clipPath: "inset(12% 0% 0% 30% round 34px)",
    duration: 1.4,
    ease: "power4.out",
  });
  gsap.from("#order", {
    y: 60,
    opacity: 0,
    duration: 1.1,
    delay: 0.6,
    ease: "back.out(1.4)",
  });
  gsap.to("#order", {
    y: -12,
    duration: 3.5,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    delay: 1.8,
  });
  gsap.delayedCall(2.4, () => {
    const t = document.getElementById("orderLast");
    if (t) {
      t.textContent = "Done";
      t.classList.add("done");
    }
  });
  gsap.to("#heroImg", {
    yPercent: 8,
    scale: 1.08,
    ease: "none",
    scrollTrigger: {
      trigger: "#heroImg",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  function loop(el: HTMLElement | null, dir: number): void {
    if (!el) return;
    const half = el.scrollWidth / 2;
    let x = dir > 0 ? 0 : -half;
    let speed = 0.6 * dir;
    gsap.ticker.add(() => {
      x -= speed;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      gsap.set(el, { x });
      speed += (0.6 * dir - speed) * 0.05;
    });
    ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        speed =
          dir *
          (0.6 + Math.min(Math.abs(self.getVelocity()) / 180, 14)) *
          self.direction;
      },
    });
  }
  loop(document.getElementById("r1"), 1);
  loop(document.getElementById("r2"), -1);

  // Intro word scrub
  const intro = document.getElementById("intro");
  if (intro) {
    Array.from(intro.childNodes).forEach((n) => {
      if (n.nodeType !== Node.TEXT_NODE || !n.textContent?.trim()) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = part;
        frag.appendChild(s);
      });
      n.parentNode?.replaceChild(frag, n);
    });
    gsap.to("#intro .w", {
      opacity: 1,
      stagger: 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: "#intro",
        start: "top 80%",
        end: "bottom 45%",
        scrub: true,
      },
    });
    gsap.from("#intro .inline-img", {
      scale: 0.4,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(2)",
      stagger: 0.2,
      scrollTrigger: { trigger: "#intro", start: "top 70%" },
    });
  }
  gsap.from(".fact", {
    y: 30,
    opacity: 0,
    stagger: 0.08,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: ".facts", start: "top 85%" },
  });

  const mm = gsap.matchMedia();
  mm.add("(min-width: 861px)", () => {
    // Home sticky-stack only — skip .card-flat on /services
    const cards = gsap.utils.toArray<HTMLElement>(".card:not(.card-flat)");
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      gsap.fromTo(
        card,
        { scale: 1, filter: "brightness(1)" },
        {
          scale: 0.92 - (cards.length - 2 - i) * 0.02,
          filter: "brightness(0.94)",
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: `top ${100 + i * 20}px`,
            scrub: true,
          },
        },
      );
    });

    gsap.fromTo(
      "#railFill",
      { "--p": 0 },
      {
        "--p": 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#steps",
          start: "top 60%",
          end: "bottom 60%",
          scrub: true,
        },
      },
    );
    gsap.utils.toArray<HTMLElement>(".step").forEach((s) => {
      ScrollTrigger.create({
        trigger: s,
        start: "top 62%",
        onEnter: () => s.classList.add("on"),
        onLeaveBack: () => {
          if (s !== document.querySelector(".step")) s.classList.remove("on");
        },
      });
    });
  });

  mm.add("(max-width: 860px)", () => {
    document.querySelectorAll(".step").forEach((s) => s.classList.add("on"));
  });

  mm.add("(min-width: 861px) and (pointer: fine)", () => {
    const track = document.getElementById("ptrack");
    const pinEl = document.querySelector<HTMLElement>(".proof-pin");
    if (!track || !pinEl) return;

    const dist = () => Math.max(1, track.scrollWidth - window.innerWidth);
    // Flat ease at both ends: pin engages/releases while x is still, so Lenis
    // inertia can't slam the vertical↔horizontal handoff.
    const edge = 0.14;
    const flatEdge = (t: number): number => {
      if (t <= edge) return 0;
      if (t >= 1 - edge) return 1;
      return (t - edge) / (1 - edge * 2);
    };

    const move = gsap.fromTo(
      track,
      { x: 0 },
      {
        x: () => -dist(),
        ease: flatEdge,
        immediateRender: false,
        scrollTrigger: {
          trigger: pinEl,
          start: "top top",
          end: () => `+=${dist() / (1 - edge * 2)}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      },
    );

    ScrollTrigger.create({
      trigger: "#work",
      start: "top 140%",
      once: true,
      onEnter: () => ScrollTrigger.refresh(),
    });

    gsap.utils.toArray<HTMLElement>(".shot").forEach((shot) => {
      gsap.fromTo(
        shot,
        { scale: 0.86 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: shot,
            containerAnimation: move,
            start: "left right",
            end: "center 55%",
            scrub: true,
          },
        },
      );
      const img = shot.querySelector("img");
      if (img) {
        gsap.fromTo(
          img,
          { xPercent: -8, scale: 1.18 },
          {
            xPercent: 8,
            scale: 1.18,
            ease: "none",
            scrollTrigger: {
              trigger: shot,
              containerAnimation: move,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        );
      }
    });
  });

  gsap.from(".b", {
    y: 40,
    opacity: 0,
    stagger: 0.08,
    duration: 0.9,
    ease: "power3.out",
    scrollTrigger: { trigger: ".bento", start: "top 80%" },
  });
  gsap.from("#partners", {
    clipPath: "inset(20% 10% 20% 10% round 34px)",
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: { trigger: "#partners", start: "top 80%" },
  });
  gsap.from(".req li", {
    x: 40,
    opacity: 0,
    stagger: 0.08,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: ".req", start: "top 85%" },
  });
  gsap.from(".qa", {
    y: 24,
    opacity: 0,
    stagger: 0.06,
    duration: 0.7,
    ease: "power3.out",
    scrollTrigger: { trigger: "#faqList", start: "top 80%" },
  });
  const word = document.getElementById("word");
  if (word) {
    // Rise completes while the mark is still mid-viewport. Using footer
    // "bottom bottom" never settles on the long home page (sticky pins).
    gsap.from(word, {
      yPercent: 55,
      ease: "none",
      scrollTrigger: {
        trigger: word.parentElement ?? "footer",
        start: "top 92%",
        end: "top 48%",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }

  if (fine) {
    document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((b) => {
      const xTo = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3.out" });
      b.addEventListener("mousemove", (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.18);
        yTo((e.clientY - r.top - r.height / 2) * 0.3);
      });
      b.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
