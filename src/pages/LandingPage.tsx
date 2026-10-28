import React, { useEffect } from 'react';
import { ArrowRight, Boxes, BarChart3, Database, Headphones, Route, Radio, Truck, ShieldCheck, Factory, PackageCheck, Globe2, BookOpen, Users } from 'lucide-react';

interface LandingPageProps {
  onDemo: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onDemo }) => {
  useEffect(() => {
    const elements = document.querySelectorAll('.landing-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: Radio, title: 'AI-powered real-time routing engine', text: 'Live vehicle learning optimizes routes in real time, reducing demand and vehicle capacity.' },
    { icon: Route, title: 'Fast deployment and onboarding', text: 'Go live in weeks, not months. Our implementation team handles integration with your existing systems.' },
    { icon: Database, title: 'Open API and developer ecosystem', text: 'Build custom workflows and integrations with our REST API, webhooks and sandbox access.' },
    { icon: BarChart3, title: 'Real-time analytics and reporting', text: 'Track costs, utilization, emissions and compliance with custom dashboards and automated reports.' },
  ];

  return (
    <main className="landing-page">
      <div className="landing-shell">
        <header className="landing-header">
          <a className="landing-brand" href="#top" aria-label="FleetOps home">
            <span className="landing-brand-mark"><Truck size={20} /></span>
            <span>Fleet<span>Ops</span></span>
          </a>
          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#platform">Platform</a>
            <a href="#solutions">Solutions</a>
            <a href="#industries">Industries</a>
            <a href="#outcomes">Outcomes</a>
            <a href="#resources">Resources</a>
            <a href="#company">Company</a>
          </nav>
          <div className="landing-actions">
            <button className="landing-contact" onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>Contact</button>
            <button className="landing-demo" onClick={onDemo}>Book a demo <ArrowRight size={14} /></button>
          </div>
        </header>

        <section className="landing-hero" id="top">
          <div className="hero-wash" />
          <div className="hero-content">
            <div className="hero-kicker hero-enter"><span /> Why fleetops</div>
            <h1 className="hero-enter hero-enter-delay-1">The platform built<br />for modern mobility</h1>
            <p className="hero-enter hero-enter-delay-2">We have engineered mobility software from the ground up to solve the complexity of fleet operations—every feature is designed around your operational reality.</p>
            <div className="feature-grid" id="platform">
              {features.map(({ icon: Icon, title, text }, index) => (
                <article className="feature-card landing-reveal" style={{ transitionDelay: `${index * 90}ms` }} key={title}>
                  <Icon size={19} strokeWidth={1.7} />
                  <h2>{title}</h2>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <button className="hero-cta" onClick={onDemo}>Book a demo <ArrowRight size={14} /></button>
          </div>
        </section>

        <section className="landing-section landing-solutions" id="solutions">
          <div className="landing-reveal">
            <div className="section-kicker"><span /> Solutions</div>
            <h2>One connected platform<br />for every fleet operation</h2>
          </div>
          <div className="content-grid three-grid">
            <article className="landing-reveal" style={{ transitionDelay: '0ms' }}><Route size={24} /><h3>Fleet tracking</h3><p>Monitor every vehicle, driver and route from a single real-time command view.</p></article>
            <article className="landing-reveal" style={{ transitionDelay: '90ms' }}><PackageCheck size={24} /><h3>Dispatch & logistics</h3><p>Plan deliveries, optimize load assignments and keep every job on schedule.</p></article>
            <article className="landing-reveal" style={{ transitionDelay: '180ms' }}><BarChart3 size={24} /><h3>Performance intelligence</h3><p>Turn live telematics into cost, fuel, safety and sustainability insights.</p></article>
          </div>
        </section>

        <section className="landing-section landing-industries" id="industries">
          <div className="section-heading-light landing-reveal">
            <div className="section-kicker"><span /> Industries</div>
            <h2>Built for complex<br />mobility networks</h2>
          </div>
          <div className="industry-grid">
            <article className="landing-reveal" style={{ transitionDelay: '0ms' }}><Truck size={26} /><h3>Trucking & logistics</h3><p>Improve asset utilization across regional and long-haul operations.</p></article>
            <article className="landing-reveal" style={{ transitionDelay: '90ms' }}><Factory size={26} /><h3>Construction</h3><p>Coordinate heavy equipment, crews and project deliveries with confidence.</p></article>
            <article className="landing-reveal" style={{ transitionDelay: '180ms' }}><Globe2 size={26} /><h3>Public transport</h3><p>Deliver dependable passenger journeys with live service visibility.</p></article>
          </div>
        </section>

        <section className="landing-outcomes" id="outcomes">
          <div className="section-kicker landing-reveal"><span /> Proven outcomes</div>
          <h2 className="landing-reveal">Clear results.<br />Measurable impact.</h2>
          <div className="outcome-grid landing-reveal">
            <article><Boxes size={24} /><strong>25%</strong><h3>Lower fleet costs</h3><p>Reduce operating expenses with smarter dispatch, routing and utilization.</p></article>
            <article><ShieldCheck size={24} /><strong>99.9%</strong><h3>Operational uptime</h3><p>Keep every vehicle visible and every exception moving toward resolution.</p></article>
            <article><Headphones size={24} /><strong>24/7</strong><h3>Live support</h3><p>Specialist assistance for your fleet team, dispatchers and administrators.</p></article>
          </div>
        </section>

        <section className="landing-section landing-resources" id="resources">
          <div className="landing-reveal">
            <div className="section-kicker"><span /> Resources</div>
            <h2>Tools to help your<br />fleet move smarter</h2>
          </div>
          <div className="content-grid three-grid landing-reveal">
            <article><BookOpen size={24} /><h3>Fleet management guide</h3><p>Practical frameworks for reducing costs and increasing operational control.</p></article>
            <article><Database size={24} /><h3>API documentation</h3><p>Connect telematics, dispatch systems and business tools through open APIs.</p></article>
            <article><Users size={24} /><h3>Customer stories</h3><p>See how modern fleet teams achieve safer, faster and more efficient operations.</p></article>
          </div>
        </section>

        <section className="landing-section landing-company" id="company">
          <div className="landing-reveal">
            <div className="section-kicker"><span /> Company</div>
            <h2>Mobility made simple.</h2>
            <p>FleetOps brings transportation teams, vehicles and data together to build safer, cleaner and more resilient operations.</p>
            <div className="company-contact-details" id="contact">
              <span>Get in touch </span>
              <a href="mailto:irinantony.mec@gmail.com">irinantony.mec@gmail.com</a>
            </div>
          </div>
          <div className="company-actions landing-reveal">
            <button className="landing-demo" onClick={onDemo}>Explore FleetOps <ArrowRight size={14} /></button>
            <button className="company-contact" onClick={() => window.location.href = 'mailto:irinantony.mec@gmail.com'}>Email us</button>
          </div>
        </section>
      </div>
    </main>
  );
};
