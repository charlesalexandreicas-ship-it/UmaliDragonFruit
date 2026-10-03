"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const facebookUrl = "https://www.facebook.com/chefsMDFF";
const agricultureFeatures = [
  {
    date: "June 21, 2023",
    title: "Dragon fruit success: An engineer grows a family farm",
    description: "Agriculture Monthly tells Marchefren Umali’s story, from early backyard cuttings to using artificial lighting for off-season harvests.",
    url: "https://agriculture.com.ph/2023/06/21/dragon-fruit-success-engineer-in-camarines-sur-starts-a-profitable-business-with-dragon-fruit-plants-supplemented-with-artificial-lighting/",
  },
  {
    date: "June 22, 2023",
    title: "Five varieties that showcase dragon fruit diversity",
    description: "A closer look at dragon fruit varieties grown at Umali Family Dragon Fruit Farm in Ragay.",
    url: "https://agriculture.com.ph/2023/06/22/five-varieties-that-showcase-dragon-fruit-diversity/",
  },
];
const nav = [
  { label: "The farm", href: "#farm" },
  { label: "The harvest", href: "#harvest" },
  { label: "Gallery", href: "#gallery" },
  { label: "In the press", href: "#press" },
  { label: "Contact", href: "#contact" },
];
const chapters = [
  { number: "01", label: "On the farm", title: "It starts on the vine.", detail: "Dragon fruit grown in Ragay, Camarines Sur." },
  { number: "02", label: "The harvest", title: "Picked with care.", detail: "A closer look at the fruit and the people behind it." },
  { number: "03", label: "On its way", title: "Ready to share.", detail: "Ask the farm directly about the latest harvest." },
];
const harvestSlides = ["Grown with care", "Fresh from Ragay", "From our family farm"];
const mobileFrameCount = 48;
const mobileFramePath = (frame: number) => `/film-frames/frame-${String(frame).padStart(3, "0")}.webp`;

function HarvestCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (paused || motion.matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % harvestSlides.length), 4500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const move = (direction: number) => {
    setActive((current) => (current + direction + harvestSlides.length) % harvestSlides.length);
    setPaused(true);
  };

  return (
    <div className="harvest-carousel" aria-label="Farm highlights" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)}>
      <button type="button" aria-label="Previous highlight" onClick={() => move(-1)}><ArrowLeft size={20} /></button>
      <div className="harvest-carousel-copy" aria-live={paused ? "polite" : "off"}>
        <span key={active}>{harvestSlides[active]}</span>
        <small>{String(active + 1).padStart(2, "0")} / {String(harvestSlides.length).padStart(2, "0")}</small>
      </div>
      <button type="button" aria-label="Next highlight" onClick={() => move(1)}><ArrowRight size={20} /></button>
    </div>
  );
}

function ScrollFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadedFrames = useRef(new Set<number>());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const next = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / travel));
      setProgress((previous) => Math.abs(previous - next) > 0.003 ? next : previous);
      const video = videoRef.current;
      if (window.matchMedia("(max-width: 700px)").matches || !video || !Number.isFinite(video.duration) || !video.duration) return;
      const target = Math.min(video.duration - 0.05, next * video.duration);
      if (Math.abs(video.currentTime - target) > 0.03) video.currentTime = target;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const video = videoRef.current;
    video?.addEventListener("loadedmetadata", schedule);
    video?.addEventListener("loadeddata", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      video?.removeEventListener("loadedmetadata", schedule);
      video?.removeEventListener("loadeddata", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 700px)").matches) return;
    const frame = Math.min(mobileFrameCount, Math.floor(progress * (mobileFrameCount - 1)) + 1);
    for (let next = frame; next <= Math.min(mobileFrameCount, frame + 10); next++) {
      if (preloadedFrames.current.has(next)) continue;
      const image = new window.Image();
      image.src = mobileFramePath(next);
      preloadedFrames.current.add(next);
    }
  }, [progress]);

  const chapter = progress < 0.32 ? 0 : progress < 0.63 ? 1 : 2;
  const showLogo = progress > 0.91;
  const mobileFrame = Math.min(mobileFrameCount, Math.floor(progress * (mobileFrameCount - 1)) + 1);
  return (
    <section className="film-story" id="top" ref={sectionRef} aria-label="From the farm to the harvest">
      <div className="film-sticky">
        <video ref={videoRef} className="story-video" muted playsInline preload="metadata" poster="/umali-journey-poster.jpg" aria-hidden="true">
          <source src="/umali-farm-journey.mp4" type="video/mp4" />
        </video>
        <Image className="story-frames" src={mobileFramePath(mobileFrame)} alt="" fill sizes="100vw" unoptimized priority aria-hidden="true" />
        <div className="film-shade" aria-hidden="true" />
        <div className={`film-message ${showLogo ? "is-hidden" : ""}`} key={chapter}>
          <span className="overline overline-light"><span className="overline-rule" /> UMALI FAMILY DRAGON FRUIT FARM</span>
          <h1>{chapters[chapter].title}</h1>
          <p>{chapters[chapter].detail}</p>
          <a className="button button-pink" href="#contact">Ask about the harvest <ArrowUpRight size={18} /></a>
        </div>
        <div className={`film-logo-reveal ${showLogo ? "is-visible" : ""}`} aria-hidden={!showLogo}>
          <a className="film-logo-link" href={facebookUrl} target="_blank" rel="noopener noreferrer" tabIndex={showLogo ? 0 : -1} aria-label="Visit Umali Family Dragon Fruit Farm on Facebook"><Image src="/umali-logo.jpg" alt="Umali Family Dragon Fruit Farm logo" width={380} height={380} priority /></a>
          <span>GROWN IN RAGAY, CAMARINES SUR</span>
          <a className="button button-green" href="#farm" tabIndex={showLogo ? 0 : -1}>Meet the farm <ArrowDown size={17} /></a>
        </div>
        {!showLogo && <div className="film-footer" aria-hidden="true"><span>{chapters[chapter].number} / 03 &nbsp; {chapters[chapter].label}</span><div className="film-progress"><i style={{ width: `${progress * 100}%` }} /></div><span>SCROLL TO EXPLORE</span></div>}
        <a href="#farm" className="film-skip">Skip film <ArrowDown size={14} /></a>
      </div>
    </section>
  );
}

export default function DragonBloomExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main>
      <a className="skip-link" href="#farm">Skip to farm content</a>
      <header className="site-header">
        <a className="brand" href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit Umali Family Dragon Fruit Farm on Facebook">
          <Image src="/umali-logo.jpg" alt="" width={49} height={49} priority />
          <span>UMALI FAMILY<small>DRAGON FRUIT FARM</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">{nav.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav>
        <a className="header-cta" href={facebookUrl} target="_blank" rel="noopener noreferrer">Visit Facebook <ArrowUpRight size={16} /></a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>
      <nav id="mobile-nav" className={`mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="Mobile navigation" inert={!menuOpen}>
        {nav.map((item) => <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight size={20} /></a>)}
        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Visit Facebook<ArrowUpRight size={20} /></a>
      </nav>

      <ScrollFilm />

      <section className="intro-section page-shell" id="farm">
        <div className="intro-lead"><span className="overline"><span className="overline-rule" /> THE FARM</span><h2>A family story,<br /><em>grown in Ragay.</em></h2></div>
        <div className="intro-body"><p>Umali Family Dragon Fruit Farm is owned and managed by Engr. Marchefren A. Umali. Behind the vivid fruit is a family farm, a real harvest, and people you can speak with directly.</p><a className="text-link" href="#gallery">See the farm photos <ArrowUpRight size={18} /></a></div>
        <figure className="intro-image"><Image src="/harvest.jpg" alt="A member of the Umali farm holding dragon fruit beside crates of the harvest" fill sizes="(max-width: 700px) 100vw, 90vw" /><figcaption>01 / A harvest from the farm</figcaption></figure>
        <div className="intro-side-note"><span>RAGAY<br />CAMARINES SUR</span><span>EST. 2018</span></div>
      </section>

      <section className="harvest-section" id="harvest">
        <div className="page-shell harvest-layout">
          <div className="harvest-copy"><span className="overline overline-light"><span className="overline-rule" /> THE HARVEST</span><h2>Good fruit has<br /><em>a story.</em></h2><p>Harvests change with the season. For current availability, orders, or a farm visit inquiry, the best place to begin is a direct conversation with the farm.</p><a className="button button-outline" href={facebookUrl} target="_blank" rel="noopener noreferrer">Ask on Facebook <ArrowUpRight size={18} /></a></div>
          <div className="harvest-photo"><Image src="/harvest.jpg" alt="Freshly harvested dragon fruit in black crates" fill sizes="(max-width: 700px) 100vw, 50vw" /></div>
        </div>
        <HarvestCarousel />
      </section>

      <section className="gallery-section page-shell" id="gallery">
        <div className="section-heading"><div><span className="overline"><span className="overline-rule" /> A CLOSER LOOK</span><h2>Meet the farm<br /><em>behind the fruit.</em></h2></div><p>The opening film imagines the journey of the fruit. These photographs come from the farm&apos;s own website.</p></div>
        <div className="gallery-grid">
          <figure className="gallery-main"><Image src="/farm-team.jpg" alt="Umali Family Dragon Fruit Farm group at an agricultural event" fill sizes="(max-width: 700px) 100vw, 55vw" /><figcaption>THE PEOPLE</figcaption></figure>
          <figure className="gallery-secondary"><Image src="/farm-banner.jpg" alt="The Umali Family Dragon Fruit Farm banner showing its fruit and farm details" fill sizes="(max-width: 700px) 100vw, 40vw" /><figcaption>THE FARM</figcaption></figure>
          <div className="gallery-quote"><span className="quote-mark">“</span><p>Fresh fruit. Familiar faces. A place to come back to.</p><span>UMALI FAMILY DRAGON FRUIT FARM</span></div>
        </div>
      </section>

      <section className="press-section" id="press"><div className="page-shell press-layout">
        <div className="press-intro"><span className="overline"><span className="overline-rule" /> IN THE PRESS</span><h2>Our story,<br /><em>shared wider.</em></h2><p>Umali Family Dragon Fruit Farm was featured in Agriculture Monthly, an online publication covering Philippine agriculture.</p></div>
        <div className="press-features">{agricultureFeatures.map((feature, index) => <a className="press-feature" href={feature.url} target="_blank" rel="noopener noreferrer" key={feature.url}>
          <div className="press-feature-top"><span>AGRICULTURE MONTHLY</span><span>{feature.date}</span></div>
          <h3>{feature.title}</h3><p>{feature.description}</p><div className="press-feature-bottom"><span>READ THE ARTICLE</span><ArrowUpRight size={22} /><small>0{index + 1} / 02</small></div>
        </a>)}</div>
      </div></section>

      <section className="contact-section" id="contact"><div className="page-shell contact-layout">
        <div><span className="overline overline-light"><span className="overline-rule" /> GET IN TOUCH</span><h2>Ask what&apos;s<br /><em>fresh today.</em></h2><p>Message the farm for current availability, orders, and visit questions.</p><a className="button button-pink" href={facebookUrl} target="_blank" rel="noopener noreferrer">Message on Facebook <ArrowUpRight size={19} /></a></div>
        <div className="contact-mark"><a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit Umali Family Dragon Fruit Farm on Facebook"><Image src="/umali-logo.jpg" alt="Umali Family Dragon Fruit Farm logo" width={230} height={230} /></a><div className="contact-details"><strong>Contact info</strong><a href="tel:+639489518925"><Phone size={19} />0948 951 8925</a><a href="mailto:marchefrenau@gmail.com"><Mail size={19} />marchefrenau@gmail.com</a><span><MapPin size={19} />GRS, Ragay, Camarines Sur</span></div></div>
      </div></section>

      <footer className="site-footer page-shell"><div className="footer-top"><span>UMALI FAMILY<br /><small>DRAGON FRUIT FARM</small></span><a href="#top">Back to top ↑</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Umali Family Dragon Fruit Farm</span><span>Ragay, Camarines Sur</span><a href={facebookUrl} target="_blank" rel="noopener noreferrer">Facebook <ArrowUpRight size={14} /></a></div></footer>
    </main>
  );
}
