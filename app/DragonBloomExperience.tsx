"use client";

import { ArrowDown, ArrowRight, Check, Leaf, Mail, MapPin, Menu, MessageCircle, Phone, Play, Send, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

const nav = [["Our farm", "farm"], ["Harvest", "harvest"], ["Gallery", "gallery"], ["Contact", "contact"]];
const storyBeats = [
  { step: "01", label: "Meet the fruit", title: "Freshness begins before the first slice.", copy: "Scroll to move through the story." },
  { step: "02", label: "See inside", title: "Vivid. Fresh-cut. Naturally striking.", copy: "Dragon fruit made to be seen—and shared." },
  { step: "03", label: "Imagine the taste", title: "From harvest crate to your table.", copy: "Simple, refreshing, and ready for a new ritual." },
  { step: "04", label: "Start an inquiry", title: "Taste dragon fruit at its freshest.", copy: "Ask what is in season at Umali Family Dragon Fruit Farm." },
];

function InquiryForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const startedAt = useRef(Date.now());
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("loading"); setMessage("");
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(data.entries()), inquiryType: "harvest", consent: data.get("consent") === "on", startedAt: startedAt.current }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Your inquiry could not be sent.");
      form.reset(); startedAt.current = Date.now(); setState("success"); setMessage("Thank you. Your harvest inquiry has been received.");
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Your inquiry could not be sent."); }
  }
  return <form className="inquiry-form" onSubmit={submit}>
    <div className="honey" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="field-pair"><label>Full name *<input name="name" required autoComplete="name" /></label><label>Email address *<input name="email" type="email" required autoComplete="email" /></label></div>
    <div className="field-pair"><label>Phone number<input name="phone" type="tel" autoComplete="tel" /></label><label>Location<input name="location" autoComplete="address-level2" placeholder="Town / City" /></label></div>
    <div className="field-pair"><label>What are you interested in?<select name="product" defaultValue="Fresh dragon fruit"><option>Fresh dragon fruit</option><option>Seasonal availability</option><option>Bulk or business order</option><option>Farm visit inquiry</option></select></label><label>Estimated quantity<input name="quantity" placeholder="e.g. 5 kg or 2 crates" /></label></div>
    <label>Message<textarea name="message" rows={4} placeholder="Tell us what you need and when you need it." /></label>
    <label className="consent"><input name="consent" type="checkbox" required /><span>I consent to the farm using these details to respond to my inquiry. *</span></label>
    <button className="submit-button" disabled={state === "loading"}>{state === "loading" ? "Sending…" : <>Send harvest inquiry <Send size={17} /></>}</button>
    {message && <p className={`form-message ${state}`} role="status">{state === "success" && <Check size={17} />}{message}</p>}
  </form>;
}

export default function DragonBloomExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const storyRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      raf = 0;
      const section = storyRef.current; if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const next = Math.min(1, Math.max(0, -rect.top / distance));
      setProgress(next);
      const video = videoRef.current;
      if (!reduced && video?.duration && Number.isFinite(video.duration)) {
        const target = Math.min(video.duration - .04, next * video.duration);
        if (Math.abs(video.currentTime - target) > .04) video.currentTime = target;
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const video = videoRef.current;
    update(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll); video?.addEventListener("loadedmetadata", update);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); video?.removeEventListener("loadedmetadata", update); if (raf) cancelAnimationFrame(raf); };
  }, []);
  const beat = Math.min(storyBeats.length - 1, Math.floor(progress * storyBeats.length));
  return <main>
    <a href="#farm" className="skip-link">Skip to farm story</a>
    <header className="site-header">
      <a href="#top" className="brand" aria-label="Umali Family Dragon Fruit Farm home"><img src="/umali-logo.jpg" alt="Umali Family Dragon Fruit Farm logo" width="50" height="50" /><span>UMALI FAMILY<small>DRAGON FRUIT FARM</small></span></a>
      <nav className="desktop-nav" aria-label="Primary navigation">{nav.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
      <a className="header-cta" href="#contact">Ask about harvest <ArrowRight size={15} /></a>
      <button className="menu-button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>
    <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>{nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}<ArrowRight /></a>)}</div>

    <section id="top" className="film-story" ref={storyRef}><div className="film-sticky">
      <video ref={videoRef} className="story-video" muted playsInline preload="auto" poster="/harvest.jpg" aria-label="Scroll-controlled cinematic dragon fruit product sequence"><source src="/dragon-fruit-scroll.mp4" type="video/mp4" /></video>
      <div className="film-shade" />
      <div className="film-copy" key={beat}><span className="story-kicker"><i /> {storyBeats[beat].step} / {storyBeats[beat].label}</span><h1>{storyBeats[beat].title}</h1><p>{storyBeats[beat].copy}</p>{beat === 3 && <a href="#contact" className="hero-action">Ask about harvest <ArrowRight size={18} /></a>}</div>
      <div className="story-progress" aria-hidden="true">{storyBeats.map((item, index) => <span key={item.step} className={index === beat ? "active" : index < beat ? "passed" : ""}><i />{item.step}</span>)}</div>
      <a className="scroll-cue" href="#farm"><ArrowDown size={16} /> Scroll to explore</a>
    </div></section>

    <section id="farm" className="farm-intro section-shell">
      <div className="intro-copy"><span className="eyebrow">ROOTED IN RAGAY, CAMARINES SUR</span><h2>A family farm with a bright kind of harvest.</h2><p>Umali Family Dragon Fruit Farm is owned and managed by young agripreneur Engr. Marchefren A. Umali. The website brings that personal connection forward—real people, real harvests, and a simple way to ask what is in season.</p><div className="intro-facts"><div><strong>2018</strong><span>Established</span></div><div><strong>Ragay</strong><span>Camarines Sur</span></div><div><strong>Seasonal</strong><span>Harvest-led availability</span></div></div></div>
      <figure className="intro-photo"><img src="/harvest.jpg" alt="Farmer holding freshly harvested dragon fruit beside full harvest crates" /><figcaption><Leaf size={15} /> Fresh from the farm</figcaption></figure>
    </section>

    <section id="harvest" className="harvest-section"><div className="section-shell harvest-heading"><span className="eyebrow light">WHAT VISITORS NEED TO KNOW</span><h2>Find the harvest.<br /><em>Feel the farm.</em></h2></div><div className="section-shell offering-grid">{[
      ["01", "Fresh fruit", "Ask about current dragon fruit availability and the formats ready for home or business orders."],
      ["02", "Seasonal updates", "Harvest timing changes with the growing cycle. A quick inquiry gets you the freshest update."],
      ["03", "Farm connection", "Learn the story behind the fruit or ask whether a farm visit can be arranged."],
    ].map(([number, title, copy]) => <article key={number}><span>{number}</span><Sparkles size={24} /><h3>{title}</h3><p>{copy}</p><a href="#contact">Start an inquiry <ArrowRight size={15} /></a></article>)}</div></section>

    <section id="gallery" className="gallery-section section-shell">
      <div className="gallery-heading"><div><span className="eyebrow">FROM FARM TO FRAME</span><h2>The real harvest does the storytelling.</h2></div><p>Authentic photography keeps the experience warm and grounded while the commercial adds a more cinematic product moment.</p></div>
      <div className="photo-grid"><figure className="photo-wide"><img src="/farm-banner.jpg" alt="Umali Family Dragon Fruit Farm banner and night farm view" /></figure><figure className="photo-tall"><img src="/farm-team.jpg" alt="Umali Family Dragon Fruit Farm team at an agricultural event" /></figure><figure className="photo-harvest"><img src="/harvest.jpg" alt="Dragon fruit harvest crates at the farm" /></figure><div className="gallery-quote"><Play size={20} /><p>One scroll. Four cinematic beats. One clear next step.</p><span>THE COMMERCIAL BECOMES THE PAGE’S MOTION LANGUAGE.</span></div></div>
    </section>

    <section id="contact" className="contact-section">
      <div className="contact-copy"><span className="eyebrow light">READY WHEN THE HARVEST IS</span><h2>Ask what’s<br /><em>fresh today.</em></h2><p>Share what you need and where you are. The farm can follow up with current availability, suitable quantities, and next steps.</p><div className="contact-list"><a href="tel:+639489518925"><Phone size={18} /><span><small>PHONE</small>+63 948 951 8925</span></a><a href="mailto:marchefren@gmail.com"><Mail size={18} /><span><small>EMAIL</small>marchefren@gmail.com</span></a><div><MapPin size={18} /><span><small>FARM</small>GRS, Ragay, Camarines Sur</span></div></div></div>
      <div className="form-card"><div className="form-heading"><span>HARVEST DESK</span><h3>Send an inquiry</h3><p>This is an inquiry, not a confirmed order. Availability and pricing may change seasonally.</p></div><InquiryForm /></div>
    </section>

    <footer><div className="footer-brand"><img src="/umali-logo.jpg" alt="Umali Family Dragon Fruit Farm" width="62" height="62" /><span>UMALI FAMILY<small>DRAGON FRUIT FARM</small></span></div><p>Fresh dragon fruit, a real family story, and a simple way to connect with the farm.</p><div className="footer-links">{nav.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}<a href="mailto:marchefren@gmail.com"><Mail size={14} /> Connect</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Umali Family Dragon Fruit Farm</span><a href="#top">Back to top ↑</a></div></footer>
    <a className="floating-contact" href="#contact"><MessageCircle size={20} /><span>Ask about harvest</span></a>
  </main>;
}
