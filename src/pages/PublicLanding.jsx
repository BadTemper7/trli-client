import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {reveal, viewport} from '../components/Motion';
import {ArrowRight, ArrowUpRight, Container, Warehouse, ShieldCheck, Truck, MoveDown, ArrowUpFromLine, ArrowDownToLine, UsersRound, HardHat} from 'lucide-react';
import {photo} from '../data';
import './PublicLanding.css';

const services = [
  {name:'Lift On',description:'Container lifting and handling operations.',image:photo.terminal, Icon:ArrowUpFromLine},
  {name:'Lift Off',description:'Efficient container unloading and placement.',image:photo.yard, Icon:ArrowDownToLine},
  {name:'Container Storage',description:'Secure, organized storage for empty and loaded containers.',image:photo.stack, Icon:Warehouse}
];

export default function PublicLanding(){
  return <div className="ot-editorial">
    <section className="ot-hero" aria-labelledby="ot-hero-title">
      <div className="ot-hero-port" aria-hidden="true" />

      <div className="ot-hero-wordmark" aria-hidden="true">ONE TRUE<br/>LOGISTICS</div>
      <div className="ot-hero-shell">
        <div className="ot-hero-content">
          <span className="ot-eyebrow">ONE TRUE LOGISTICS INC.</span>
          <h1 id="ot-hero-title">One Yard.<br/><em>One View.</em></h1>
          <p>Smarter container handling, storage, and logistics solutions for businesses that keep moving.</p>
          <motion.div className="ot-hero-actions" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.55,delay:.2}}>
            <Link to="/services" className="ot-btn-primary">Explore Services <ArrowRight size={18}/></Link>
            <Link to="/rates" className="ot-btn-outline">View Rates</Link>
          </motion.div>
          <div className="ot-hero-features" aria-label="Our capabilities">
            <span><Container size={24}/>Container<br/>Handling</span>
            <span><Warehouse size={24}/>Secure<br/>Storage</span>
            <span><Truck size={24}/>Reliable<br/>Logistics Support</span>
          </div>
        </div>
        <div className="ot-hero-featured" aria-label="Yard operations">
          <img src={photo.terminal} alt="Container terminal operations"/>
          <div><strong>Modern Yard Facilities</strong><small>Organized space for efficient container handling.</small></div>
          <ArrowUpRight size={19}/>
        </div>
      </div>
    </section>
    <section className="ot-about" aria-labelledby="ot-about-title">
      <div className="ot-about-photo" aria-hidden="true"/>
      <div className="ot-wide ot-about-grid">
        <motion.div className="ot-about-heading" {...reveal} viewport={viewport}><span className="ot-label">// ABOUT US</span><h2 id="ot-about-title">Moving businesses forward through <em>smarter logistics.</em></h2></motion.div>
        <motion.div className="ot-about-body" {...reveal} viewport={viewport}><p>At <strong>One True Logistics Inc.</strong>, we simplify container handling, storage, and yard operations through <strong>reliable services</strong> and an <strong>accessible digital platform.</strong></p>
          <div className="ot-about-pillars"><span><Container/>Container<br/>Handling</span><span><Warehouse/>Yard<br/>Operations</span><span><ShieldCheck/>Secure<br/>Storage</span><span><UsersRound/>Customer<br/>Support</span></div>
        </motion.div>
      </div>
    </section>
    <section className="ot-services" aria-labelledby="ot-services-title">
      <div className="ot-wide ot-service-layout">
        <div className="ot-services-intro"><span className="ot-label">// OUR SERVICES</span><h2 id="ot-services-title">Everything your cargo needs, <em>in one place.</em></h2></div>
        <div className="ot-service-list">{services.map(({name,description,image,Icon})=><motion.div className="ot-service-motion" key={name} {...reveal} viewport={viewport}><Link className="ot-service" to="/services" aria-label={`Learn more about ${name}`}>
          <img src={image} loading="lazy" alt=""/><div className="ot-service-shade"/><div className="ot-service-copy"><Icon size={29} strokeWidth={1.5}/><h3>{name}</h3><p>{description}</p><span className="ot-service-arrow"><ArrowRight size={20}/></span></div>
        </Link></motion.div>)}</div>
      </div>
    </section>
    <section className="ot-rates" aria-labelledby="ot-rates-title"><div className="ot-wide ot-rates-layout"><div><span className="ot-label">// OUR RATES</span><h2 id="ot-rates-title">Clear rates for<br/><em>every container.</em></h2><p>Find handling and storage charges in Philippine pesos. Choose Domestic or International, Empty or Loaded, and 20ft or 40ft to see the applicable Lift On, Lift Off, and daily Storage prices. Rates shown are illustrative until official tariffs are published.</p></div><div className="ot-rate-links"><div className="ot-rate-mini-label">RATES AT A GLANCE</div><div className="ot-rate-services"><span><ArrowUpFromLine size={22}/><strong>Lift On</strong><small>Per container lift onto transport</small></span><span><ArrowDownToLine size={22}/><strong>Lift Off</strong><small>Per container lift into the yard</small></span><span><Warehouse size={22}/><strong>Storage</strong><small>Per billable storage day</small></span></div><Link to="/rates">Explore container rates <ArrowUpRight/></Link></div></div></section>
    <section className="ot-bottom"><div className="ot-wide"><HardHat size={23}/><strong>One yard. One connected platform.</strong><span>Clients can sign in to manage containers, gate movements, and payments.</span><Link to="/login">Client Sign In <ArrowRight size={16}/></Link></div></section>
  </div>;
}
