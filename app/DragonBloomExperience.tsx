"use client";

import dynamic from "next/dynamic";
import {
  ArrowDown, ArrowRight, Box, Camera, Check, ChevronDown, Flower2,
  Leaf, Menu, PackageCheck, Quote, Rotate3D, Send, ShoppingBag, Sparkles,
  Sprout, Truck, X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const DragonScene = dynamic(() => import("./components/DragonScene"), {
  ssr: false,
  loading: () => <SceneFallback loading />,
});

const navItems = [
  ["Home", "home"], ["The Fruit", "fruit"], ["Products", "products"],
  ["Our Farm", "farm"], ["Wholesale", "wholesale"], ["FAQ", "faq"], ["Contact", "contact"],
];

const products = [
  { name: "White-Flesh", full: "White-Flesh Dragon Fruit", tone: "white", copy: "Bright, delicate flesh with a clean tropical finish.", packs: ["2–3 fruits", "5 kg box", "Custom"] },
  { name: "Red-Flesh", full: "Red-Flesh Dragon Fruit", tone: "red", copy: "Vivid flesh and a naturally rich, subtly sweet profile.", packs: ["2–3 fruits", "5 kg box", "Custom"] },
  { name: "Farm Mix", full: "Mixed Farm Box", tone: "mixed", copy: "A seasonal mix selected from the varieties currently ready.", packs: ["Small box", "Family box", "Gift box"] },
  { name: "Trade Crate", full: "Wholesale Crates", tone: "crate", copy: "Flexible packing for hospitality, retail, and distribution.", packs: ["10 kg crate", "20 kg crate", "Custom"] },
];

const stages = [
  ["01", "Planting", "Strong cuttings are established and supported as each plant begins its climb."],
  ["02", "Flowering", "Night-blooming flowers signal the beginning of each fruit’s journey."],
  ["03", "Growing", "Fruit develops on the plant while color, form, and maturity are observed."],
  ["04", "Harvesting", "Ready fruit is carefully cut from the plant to protect its skin and crown."],
  ["05", "Sorting", "Each harvest is grouped by variety, size, and visible condition for its destination."],
  ["06", "Delivery", "Orders are packed around the needs of homes, kitchens, shops, and distributors."],
];

const faqs = [
  ["Which varieties are available?", "White-flesh and red-flesh varieties may be offered. Current availability depends on the harvest, so please request an update before planning an order."],
  ["When is dragon fruit in season?", "Harvest timing varies with location, weather, and the growing cycle. Contact DragonBloom Farms for current seasonal availability."],
  ["How should it be stored?", "Keep whole fruit cool and dry for short-term storage. Once cut, cover and refrigerate it, then use it promptly."],
  ["Do you accept wholesale orders?", "Yes. Restaurants, cafés, hotels, retailers, and distributors can request flexible wholesale quantities and packing."],
  ["Is delivery available?", "Delivery options depend on your location and order size. Share your location in an inquiry so the farm can confirm what is currently possible."],
  ["Can businesses arrange recurring orders?", "Recurring arrangements can be discussed for businesses, subject to seasonal supply and delivery availability."],
  ["How can I request current pricing?", "Send an order or wholesale inquiry with your preferred variety, quantity, and location. Pricing and availability may change seasonally."],
];

function SceneFallback({ loading = false }: { loading?: boolean }) {
  return (
    <div className="scene-fallback" role="img" aria-label="A stylized dragon fruit surrounded by tropical leaves">
      <div className="fallback-halo" />
      <div className="fallback-leaf leaf-a" /><div className="fallback-leaf leaf-b" />
      <div className="fallback-fruit"><i /><i /><i /><i /><i /><i /></div>
      {loading && <span className="scene-loading"><Sparkles size={15} /> Growing the 3D experience…</span>}
    </div>
  );
}

function MagneticLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  return <a ref={ref} href={href} className={className} onPointerMove={(e) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.08}px, ${(e.clientY-r.top-r.height/2)*.1}px)`;
  }} onPointerLeave={(e) => { e.currentTarget.style.transform = ""; }}>{children}</a>;
}

function ProductCard({ product, onAdd }: { product: typeof products[number]; onAdd: (name: string) => void }) {
  const [pack, setPack] = useState(product.packs[0]);
  const [qty, setQty] = useState(1);
  return (
    <article className="product-card" onPointerMove={(e) => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty("--rx", `${-(e.clientY-r.top-r.height/2)/55}deg`);
      e.currentTarget.style.setProperty("--ry", `${(e.clientX-r.left-r.width/2)/45}deg`);
    }} onPointerLeave={(e) => { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); }}>
      <div className={`product-visual ${product.tone}`} aria-hidden="true"><span className="mini-fruit" /><span className="mini-slice" /></div>
      <div className="product-topline"><span>SEASONAL HARVEST</span><span className="availability"><i /> Ask availability</span></div>
      <h3>{product.full}</h3><p>{product.copy}</p>
      <label>Package size<select value={pack} onChange={(e) => setPack(e.target.value)}>{product.packs.map(p => <option key={p}>{p}</option>)}</select></label>
      <div className="product-actions"><div className="qty"><button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty-1))}>−</button><span>{qty}</span><button aria-label="Increase quantity" onClick={() => setQty(qty+1)}>+</button></div><button className="add-btn" onClick={() => onAdd(`${qty} × ${pack} ${product.name}`)}>Add to inquiry <ArrowRight size={16} /></button></div>
      <strong className="request-price">Request pricing</strong>
    </article>
  );
}

function InquiryForm({ type, prefill = "" }: { type: "wholesale" | "order"; prefill?: string }) {
  const [state, setState] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");
  const startedAt = useMemo(() => Date.now(), []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setState("loading"); setMessage("");
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries()) as Record<string, unknown>;
    payload.inquiryType = type; payload.consent = form.get("consent") === "on"; payload.startedAt = startedAt;
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save inquiry");
      setState("success"); setMessage("Your inquiry has been saved. DragonBloom Farms can now follow up with availability and next steps."); formElement.reset();
    } catch (error) { setState("error"); setMessage(error instanceof Error ? error.message : "Your inquiry could not be saved."); }
  }
  const wholesale = type === "wholesale";
  return <form className="inquiry-form" onSubmit={submit} aria-label={`${wholesale ? "Wholesale quote" : "Order inquiry"} form`}>
    <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="field-grid">
      <label>Full name *<input name="name" required autoComplete="name" /></label>
      {wholesale && <label>Company<input name="company" autoComplete="organization" /></label>}
      {wholesale && <label>Business type<select name="businessType"><option>Restaurant / Café</option><option>Hotel</option><option>Retailer</option><option>Distributor</option><option>Other</option></select></label>}
      <label>Email *<input name="email" required type="email" autoComplete="email" /></label>
      <label>Phone<input name="phone" type="tel" autoComplete="tel" /></label>
      <label>{wholesale ? "Delivery location" : "Location"}<input name="location" autoComplete="address-level2" /></label>
      {!wholesale && <label>Customer type<select name="customerType"><option>Household</option><option>Business</option><option>Retail</option><option>Hospitality</option></select></label>}
      <label>{wholesale ? "Estimated quantity" : "Quantity"}<input name="quantity" placeholder={wholesale ? "e.g. crates per delivery" : "e.g. 2 boxes"} /></label>
      <label>{wholesale ? "Preferred variety" : "Product"}<select name="product" defaultValue={prefill}><option value="">Select one</option>{products.map(p => <option value={p.name} key={p.name}>{p.full}</option>)}</select></label>
      {wholesale && <label>Delivery frequency<select name="frequency"><option>One-time</option><option>Weekly</option><option>Fortnightly</option><option>Monthly</option><option>To discuss</option></select></label>}
      {wholesale && <label>Target date<input name="targetDate" type="date" /></label>}
      {!wholesale && <label>Delivery or pickup<select name="fulfilment"><option>Delivery inquiry</option><option>Pickup inquiry</option><option>Not sure</option></select></label>}
    </div>
    <label>{wholesale ? "Additional requirements" : "Message"}<textarea name="message" defaultValue={prefill ? `I’m interested in: ${prefill}` : ""} rows={4} /></label>
    <label className="consent"><input type="checkbox" name="consent" required /><span>I consent to DragonBloom Farms using these details to respond to this inquiry. *</span></label>
    <p className="form-note">This is an inquiry, not a confirmed purchase. Pricing and availability may change seasonally.</p>
    <button className="submit-btn" disabled={state === "loading"}>{state === "loading" ? <><span className="spinner" /> Saving inquiry…</> : <>Send inquiry <Send size={17} /></>}</button>
    {message && <div className={`form-feedback ${state}`} role="status">{state === "success" && <Check size={18} />}{message}</div>}
  </form>;
}

export default function DragonBloomExperience() {
  const [menu, setMenu] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [reduce3d, setReduce3d] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [inquiryItem, setInquiryItem] = useState("");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    try { const canvas = document.createElement("canvas"); const forcedFallback = new URLSearchParams(location.search).has("fallback3d"); setWebgl(!forcedFallback && !!(canvas.getContext("webgl2") || canvas.getContext("webgl"))); } catch { setWebgl(false); }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)"); setReduce3d(reduced.matches || localStorage.getItem("dragonbloom-reduce3d") === "true");
    const onScroll = () => setScroll(window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
    addEventListener("scroll", onScroll, { passive: true }); return () => removeEventListener("scroll", onScroll);
  }, []);

  function toggleMotion() { setReduce3d(v => { localStorage.setItem("dragonbloom-reduce3d", String(!v)); return !v; }); }
  function explore() { setExploded(true); document.getElementById("fruit")?.scrollIntoView({ behavior: reduce3d ? "auto" : "smooth" }); }

  return <main>
    <a className="skip-link" href="#content">Skip to content</a>
    <header className="nav-shell">
      <a className="brand" href="#home" aria-label="DragonBloom Farms home"><span className="brand-mark"><Leaf size={18} /></span><span>DRAGONBLOOM<small>FARMS</small></span></a>
      <nav className="desktop-nav" aria-label="Primary navigation">{navItems.map(([label,id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
      <div className="nav-actions"><button className="motion-toggle" onClick={toggleMotion} aria-pressed={reduce3d}><Rotate3D size={15} /> {reduce3d ? "3D motion reduced" : "Reduce 3D motion"}</button><a href="#contact" className="nav-cta">Make an inquiry</a><button className="menu-btn" aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button></div>
    </header>
    <div className={`mobile-menu ${menu ? "open" : ""}`}>{navItems.map(([label,id], i) => <a style={{ "--i": i } as React.CSSProperties} key={id} href={`#${id}`} onClick={() => setMenu(false)}>{label}<ArrowRight /></a>)}</div>

    <section id="home" className="hero">
      <div className="hero-scene" aria-hidden="true">{webgl ? <DragonScene exploded={exploded} reducedMotion={reduce3d} scrollProgress={scroll} activeHotspot={activeHotspot} onHotspot={setActiveHotspot} /> : <SceneFallback />}</div>
      <div className="hero-grain" />
      <div className="hero-copy">
        <span className="eyebrow"><i /> GROWN WITH ATTENTION · HARVESTED WITH CARE</span>
        <h1>Freshness<br />You Can <em>Experience</em></h1>
        <p>Premium dragon fruit, carefully grown and harvested at peak freshness for homes and businesses.</p>
        <div className="hero-buttons"><button className="primary-btn" onClick={explore}>Explore the Fruit <ArrowDown size={18} /></button><MagneticLink href="#contact" className="secondary-btn">Order Fresh</MagneticLink><MagneticLink href="#wholesale" className="text-btn">Wholesale Supply <ArrowRight size={17} /></MagneticLink></div>
      </div>
      <div className="drag-hint"><Rotate3D size={18} /><span>Drag to rotate<br /><b>Scroll to explore</b></span></div>
      <div className="harvest-note"><span>01</span><p>FROM THE FARM<br /><b>TO YOUR TABLE</b></p></div>
    </section>

    <div id="content">
      <section id="fruit" className="fruit-section section-dark">
        <div className="section-number">01 / THE FRUIT</div>
        <div className="fruit-copy"><span className="eyebrow pink">INSIDE THE HARVEST</span><h2>Made to be<br /><em>explored.</em></h2><p>Discover the texture, varieties, and visible details that make every harvest distinctive. Select a point to learn more.</p>
          <div className="hotspot-list" role="list">{[
            ["flesh","Vibrant flesh","Smooth, striking flesh with a fresh, lightly sweet character."],
            ["seeds","Edible seeds","Tiny edible seeds create the fruit’s signature speckled interior."],
            ["quality","Harvest quality","Fruit is assessed for maturity and visible condition before packing."],
            ["varieties","Two varieties","White-flesh and red-flesh fruit may be available depending on the harvest."],
          ].map(([id,title,copy],i) => <button key={id} className={activeHotspot === id ? "active" : ""} onClick={() => { setExploded(true); setActiveHotspot(activeHotspot === id ? null : id); }}><span>{String(i+1).padStart(2,"0")}</span><div><b>{title}</b>{activeHotspot === id && <p>{copy}</p>}</div><ArrowRight size={17} /></button>)}</div>
        </div>
        <div className="fruit-stage-placeholder" aria-hidden="true"><div className="cut-fruit"><div className="half left" /><div className="half right" /></div><span className="orbit-label">DRAGONBLOOM · FARM FRESH · </span></div>
      </section>

      <section id="products" className="products-section section-cream"><div className="section-heading"><div><span className="eyebrow green">THE HARVEST COLLECTION</span><h2>Picked for every<br /><em>kind of table.</em></h2></div><p>From a first taste at home to repeat supply for a busy kitchen. Choose a format and start an inquiry—current pricing is confirmed after review.</p></div>
        <div className="product-track">{products.map(p => <ProductCard key={p.name} product={p} onAdd={(item) => { setInquiryItem(item); document.getElementById("contact")?.scrollIntoView({ behavior: reduce3d ? "auto" : "smooth" }); }} />)}</div>
      </section>

      <section id="farm" className="journey-section"><div className="journey-sticky"><span className="eyebrow light">FROM ROOT TO ARRIVAL</span><h2>A journey with<br /><em>purpose.</em></h2><p>Every stage moves the fruit closer to your table.</p><div className="journey-art"><div className="sun" /><div className="hill h1" /><div className="hill h2" /><Sprout className="journey-sprout" /></div></div><div className="timeline">{stages.map(([n,title,copy],i) => <article key={title}><span>{n}</span><div className="timeline-icon">{i===0?<Sprout/>:i===1?<Flower2/>:i===2?<Leaf/>:i===3?<ShoppingBag/>:i===4?<PackageCheck/>:<Truck/>}</div><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

      <section className="benefits-section section-cream"><div className="section-heading compact"><div><span className="eyebrow green">THE DRAGONBLOOM DIFFERENCE</span><h2>Care you can <em>see.</em></h2></div></div><div className="benefit-grid">{[
        [<Sparkles key="i"/>,"Carefully Selected","Each order is prepared around current harvest condition and your requested format."],
        [<Leaf key="i"/>,"Responsibly Grown","Thoughtful growing choices shaped by the plants, season, and farm context."],
        [<PackageCheck key="i"/>,"Packed for Freshness","Packing is selected to help protect fruit during handling and transport."],
        [<Box key="i"/>,"Flexible Ordering","From household boxes to recurring business conversations."],
      ].map(([icon,title,copy],i) => <article key={String(title)}><span className="benefit-num">0{i+1}</span><div className="benefit-icon">{icon}</div><h3>{title}</h3><p>{copy}</p><ArrowRight /></article>)}</div></section>

      <section id="wholesale" className="wholesale-section section-dark"><div className="shipment-art" aria-hidden="true"><div className="crate c1"><i/><i/><i/></div><div className="crate c2"><i/><i/><i/></div><div className="crate c3"><i/><i/><i/></div></div><div className="wholesale-copy"><span className="eyebrow pink">FOR HOSPITALITY · RETAIL · DISTRIBUTION</span><h2>Reliable Supply for<br /><em>Growing Businesses</em></h2><p>Build a supply conversation around the quantities, packing, and timing your business actually needs.</p><ul>{["Flexible quantities","Custom packing options","Seasonal availability updates","Recurring delivery arrangements","Responsive customer support"].map(x=><li key={x}><Check />{x}</li>)}</ul></div><div className="wholesale-form-wrap"><div className="form-heading"><span>WHOLESALE DESK</span><h3>Request a tailored quote</h3><p>Tell us what your business needs. We’ll use your details to discuss fit, availability, and current pricing.</p></div><InquiryForm type="wholesale" /></div></section>

      <section className="testimonials section-cream"><div className="section-heading compact"><div><span className="eyebrow green">CUSTOMER STORIES</span><h2>Space for stories<br /><em>still growing.</em></h2></div><p>Testimonials will appear here only after customers approve their words and attribution.</p></div><div className="testimonial-grid">{["HOUSEHOLD CUSTOMER","HOSPITALITY PARTNER","WHOLESALE PARTNER"].map((type,i)=><article key={type} className={`quote-card q${i+1}`}><Quote/><p>Approved customer testimonial placeholder.</p><div><span className="avatar-placeholder">{i+1}</span><span><b>Identity pending approval</b><small>{type} · PLACEHOLDER</small></span></div></article>)}</div></section>

      <section className="gallery-section section-cream"><div className="gallery-strip">{["Fruit detail","Night bloom","Harvest crate"].map((label,i)=><button key={label} onClick={() => setLightbox(i)} className={`gallery-tile g${i+1}`} aria-label={`Open ${label} gallery image`}><span>{label}</span><i>VIEW</i></button>)}</div></section>

      <section id="faq" className="faq-section section-cream"><div className="faq-intro"><span className="eyebrow green">GOOD TO KNOW</span><h2>Questions,<br /><em>answered.</em></h2><p>Still curious? Send an inquiry and tell us what you’re planning.</p><a href="#contact">Ask DragonBloom <ArrowRight /></a></div><div className="accordion">{faqs.map(([q,a],i)=><div className={`faq-item ${openFaq===i?"open":""}`} key={q}><button onClick={()=>setOpenFaq(openFaq===i?-1:i)} aria-expanded={openFaq===i}><span>{String(i+1).padStart(2,"0")}</span>{q}<ChevronDown /></button><div className="faq-answer"><p>{a}</p></div></div>)}</div></section>

      <section id="contact" className="contact-section"><div className="contact-copy"><span className="eyebrow light">START A CONVERSATION</span><h2>Fresh plans<br /><em>begin here.</em></h2><p>Tell us what you need and where you need it. Your message is saved as an inquiry—our team can then confirm current harvest, pricing, and fulfilment options.</p><div className="contact-details"><div><small>CONTACT</small><span>[Edit: business email]</span><span>[Edit: phone number]</span></div><div><small>FARM & HOURS</small><span>[Edit: farm location]</span><span>[Edit: business hours]</span></div><div><small>SOCIAL</small><span><Camera size={16}/> [Edit: Instagram profile]</span><span>[Edit: Facebook profile]</span></div></div></div><div className="contact-form-wrap"><InquiryForm type="order" prefill={inquiryItem} /></div></section>
    </div>

    <footer><a className="footer-brand" href="#home"><span className="brand-mark"><Leaf /></span><strong>DRAGONBLOOM<small>FARMS</small></strong></a><p>Premium dragon fruit for homes, kitchens, shops, and growing supply partnerships.</p><div className="footer-links">{navItems.map(([l,id])=><a key={id} href={`#${id}`}>{l}</a>)}</div><div className="footer-legal"><span>© {new Date().getFullYear()} DragonBloom Farms</span><a href="#">Privacy Policy</a><a href="#">Terms</a><a href="#">Delivery & Refund Policy</a></div></footer>

    {lightbox !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Farm gallery"><button onClick={()=>setLightbox(null)} aria-label="Close gallery"><X /></button><div className={`lightbox-art g${lightbox+1}`}><span>{["Fruit detail","Night bloom","Harvest crate"][lightbox]}</span></div></div>}
  </main>;
}
