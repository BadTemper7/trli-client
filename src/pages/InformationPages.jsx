export { default as RatesPage } from './RatesPage';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Container, Truck, ClipboardCheck, MapPin, Phone,
  Mail, ArrowUpFromLine, ArrowDownToLine, Warehouse, ShieldCheck, CheckCircle2,
  FileCheck2, Target, Eye, Gem, Handshake, LockKeyhole, Camera, HardHat,
  Fence, HeartPulse, Flame, AlertTriangle, TrafficCone, MonitorCheck,
  PackageCheck, Forklift, Boxes, ClipboardList, BadgeCheck, Clock3,
  Building2, Globe2, Settings2, ChartNoAxesCombined, Users, FileText
} from 'lucide-react';
import { PageReveal, ScrollReveal } from '../components/Motion';
import { photo } from '../data';
import './InformationPages.css';

function Eyebrow({ children }) { return <span className="ot-info-eyebrow">// {children}</span>; }
const services = [
  { name: 'Lift On', title: 'Ready for the next move.', detail: 'Coordinated lifting of containers onto assigned trucks or other transport equipment for efficient outbound handling.', Icon: ArrowUpFromLine, image: photo.terminal },
  { name: 'Lift Off', title: 'Handled with precision.', detail: 'Safe unloading of empty and laden containers from transport equipment and placement in the designated depot area.', Icon: ArrowDownToLine, image: photo.yard },
  { name: 'Container Storage', title: 'Space for every stage.', detail: 'Organized depot storage for empty and laden containers, with yard location assignment, inventory tracking, and controlled release.', Icon: Warehouse, image: photo.stack }
];
const process = [
  ['01', 'Pre-Advice', 'Advance container and shipment details are submitted for processing.'],
  ['02', 'Gate-In', 'Container arrival, validation, and entry to the depot.'],
  ['03', 'Inventory', 'Inspection, EIR records, and yard position assignment.'],
  ['04', 'Storage', 'Controlled yard storage and inventory monitoring.'],
  ['05', 'Gate-Out', 'Customer request and release approval.'],
  ['06', 'Payment', 'Applicable charges are settled and verified.'],
  ['07', 'Receipt', 'Payment record or receipt becomes available.'],
  ['08', 'Complete Release', 'Container is cleared for physical release and final documentation.']
];
const additionalServices = [
  ['Container depot operations', Container], ['Container yard management', Warehouse],
  ['Empty and laden container storage', Boxes], ['Container handling services', Forklift],
  ['Gate-in and gate-out operations', Truck], ['Container inventory management', ClipboardList],
  ['Equipment Interchange Receipt (EIR) processing', FileCheck2],
  ['Trucking and transport support', Truck], ['Cargo handling and warehousing support', PackageCheck]
];
const modules = [
  ['Container registration', 'Container details, identification, size, type and condition.', Container],
  ['Gate control and EIR processing', 'Gate transactions, verification, and equipment interchange records.', ClipboardCheck],
  ['Yard location management', 'Assigned yard locations, inventory updates, and movement records.', Warehouse],
  ['Inventory management', 'Track containers in the yard including status, location, and movement history.', Boxes],
  ['Documentation management', 'Operational documentation and transaction records.', FileText],
  ['Reporting and analytics', 'Operational reporting for inventory and yard activities.', ChartNoAxesCombined]
];
const values = ['Integrity', 'Reliability', 'Safety', 'Teamwork', 'Accountability', 'Innovation', 'Customer Focus'];
const reasons = [
  ['Strategic location', 'Located in Manila’s Port Area with access to port roads and logistics networks.', MapPin],
  ['Spacious and scalable facility', 'A dedicated container depot designed for organized and adaptable yard operations.', Warehouse],
  ['Secure and safe operations', 'Controlled entry, monitored areas, and safety-first depot procedures.', ShieldCheck],
  ['Modern equipment fleet', 'Container handling supported by specialized lifting and yard equipment.', Settings2],
  ['Experienced and committed team', 'Operations supported by trained logistics and depot personnel.', Users],
  ['Efficient systems and processes', 'Digitized records for gate transactions, inventory, and reporting.', MonitorCheck],
  ['Customer-focused partner', 'Support for shipping lines, freight forwarders, importers, exporters, and transport operators.', Handshake],
  ['Compliance and standards', 'Attention to workplace safety, operational controls, and applicable requirements.', BadgeCheck],
  ['Transparent rates', 'Published pricing information for container handling and storage.', FileText],
  ['Reliable performance', 'Structured processes and accurate operational records.', ChartNoAxesCombined]
];
const safeguards = [
  ['24/7 CCTV surveillance', 'Monitoring for critical depot areas, access points, and perimeter activity.', Camera],
  ['Trained security personnel', 'Security guards and established site monitoring procedures.', ShieldCheck],
  ['Controlled access', 'Access for authorized personnel, vehicles, and equipment.', LockKeyhole],
  ['Perimeter protection', 'Physical security boundaries and restricted areas.', Fence],
  ['Secure compound', 'Managed gates, operating areas, and vehicle movement.', Warehouse],
  ['Access and activity logs', 'Records for gate entries, visitors, and container movements.', ClipboardList]
];
const safety = [
  ['Safety orientation and training', 'Personnel and contractors receive safety guidance and procedures.', HardHat],
  ['Personal protective equipment', 'Appropriate PPE for workers and visitors in operational areas.', ShieldCheck],
  ['First aid and safety facilities', 'First-aid resources and designated emergency arrangements.', HeartPulse],
  ['Fire prevention and protection', 'Fire-prevention measures, extinguishers, and inspections.', Flame],
  ['Hazard identification', 'Site inspections and reporting of potential hazards.', AlertTriangle],
  ['Traffic management', 'Defined vehicle routes and safe movement within the depot.', TrafficCone]
];

export function ServicesPage() {
  return <div className="ot-information">
    <PageReveal className="ot-info-intro"><Eyebrow>OUR SERVICES</Eyebrow><h1>Integrated solutions.<br/><em>Seamless operations.</em></h1><p>One True Logistics Inc. provides container depot and logistics services for shipping lines, freight forwarders, importers, exporters, and transport operators.</p></PageReveal>
    <div className="ot-info-body">{services.map(({name, title, detail, Icon, image}, i) => <ScrollReveal className={`ot-service-editorial ${i % 2 ? 'is-reversed' : ''}`} key={name}><div className="ot-service-editorial-image"><img src={image} alt={`${name} at a container terminal`} loading="lazy"/></div><div className="ot-service-editorial-copy"><span className="ot-editorial-index">0{i + 1} / 03</span><Icon size={31} strokeWidth={1.5}/><h2>{name}</h2><h3>{title}</h3><p>{detail}</p><Link to="/rates">View published rates <ArrowUpRight size={19}/></Link></div></ScrollReveal>)}</div>
    <ScrollReveal className="ot-info-section"><Eyebrow>WHAT WE DO</Eyebrow><h2>Complete depot support.</h2><p>Our services cover the container journey from arrival and inspection to safe handling, storage, and controlled release.</p><div className="ot-feature-list">{additionalServices.map(([title, Icon]) => <div key={title}><Icon size={23}/><span>{title}</span></div>)}</div></ScrollReveal>
    <ScrollReveal className="ot-info-section ot-process"><Eyebrow>OUR OPERATIONS PROCESS</Eyebrow><h2>Every move, clearly tracked.</h2><p>The customer portal follows the stages below. Physical depot handling also includes inspection and EIR documentation where applicable.</p><div className="ot-process-grid">{process.map(([n, title, detail]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{detail}</p></article>)}</div></ScrollReveal>
    <ScrollReveal className="ot-info-section"><Eyebrow>OUR SYSTEM MODULES</Eyebrow><h2>Organized operations, connected records.</h2><div className="ot-tile-grid">{modules.map(([title, detail, Icon]) => <article key={title}><Icon size={28}/><h3>{title}</h3><p>{detail}</p></article>)}</div></ScrollReveal>
    <ScrollReveal className="ot-information-band"><div><Eyebrow>OUR SERVICE COMMITMENT</Eyebrow><h2>Safety, care, and reliability in every operation.</h2><p>We aim for dependable turnaround, quality service, and long-term partnerships.</p></div><Link to="/contact">Contact our team <ArrowRight size={19}/></Link></ScrollReveal>
  </div>;
}
export function AboutPage() {
  return <div className="ot-information">
    <PageReveal className="ot-info-intro ot-about-intro"><Eyebrow>ABOUT ONE TRUE LOGISTICS INC.</Eyebrow><h1>Your trusted container depot<br/>and <em>logistics partner.</em></h1><p>Established to support the growing demands of the Philippine logistics and shipping industry, One True Logistics Inc. provides integrated container depot, container yard, trucking, cargo handling, and logistics support services.</p></PageReveal>
    <ScrollReveal className="ot-about-story"><div className="ot-about-story-image"><img src={photo.terminal} alt="A shipping terminal with container-handling infrastructure" loading="lazy"/></div><div className="ot-about-story-copy"><Eyebrow>COMPANY OVERVIEW</Eyebrow><h2>Strategically located.<br/>Built for reliability.</h2><p>Based in Manila’s Port Area, our facility supports shipping lines, freight forwarders, importers, exporters, and transport operators with organized container handling and yard services.</p><p>Our operations are supported by a secure container yard, cargo-handling equipment, experienced logistics professionals, and structured depot management processes for safe handling, accurate inventory, and container turnaround.</p><p>We remain committed to operational excellence, workplace safety, customer satisfaction, and technology-enabled logistics services.</p></div></ScrollReveal>
    <ScrollReveal className="ot-info-section"><Eyebrow>OUR DIRECTION</Eyebrow><h2>Purpose, vision, and mission.</h2><div className="ot-tile-grid ot-direction-grid">{[
      ['Our purpose', 'To deliver dependable logistics solutions that create value for customers, empower our people, and contribute to the growth of shipping and logistics.', Target],
      ['Our vision', 'To be a trusted and preferred container depot and logistics partner in the Philippines, known for operational excellence, integrity, and customer focus.', Eye],
      ['Our mission', 'To provide world-class depot and logistics services through continuous improvement, advanced systems, modern equipment, and a skilled team committed to safety, efficiency, and customer satisfaction.', Gem]
    ].map(([title, detail, Icon]) => <article key={title}><Icon size={30}/><h3>{title}</h3><p>{detail}</p></article>)}</div><div className="ot-values-bar"><strong>OUR VALUES</strong><span>{values.join('  •  ')}</span></div></ScrollReveal>
    <ScrollReveal className="ot-info-section"><Eyebrow>WHY CHOOSE ONE TRUE LOGISTICS?</Eyebrow><h2>A partner built around your cargo.</h2><p>We combine a strategic location, structured yard procedures, people, equipment, and accessible records to support everyday logistics operations.</p><div className="ot-reasons-grid">{reasons.map(([title, detail, Icon]) => <article key={title}><Icon size={26}/><div><h3>{title}</h3><p>{detail}</p></div></article>)}</div></ScrollReveal>
    <ScrollReveal className="ot-info-section ot-safety-section"><Eyebrow>SECURITY AND SAFETY</Eyebrow><h2>Safe people. Secure cargo.<br/><em>Reliable operations.</em></h2><p>Security and safety are central to our depot operations. Our approach covers site access, personnel, equipment, and yard activity.</p><div className="ot-safety-columns"><div><h3>Security measures</h3>{safeguards.map(([title, detail, Icon]) => <article key={title}><Icon size={22}/><div><strong>{title}</strong><p>{detail}</p></div></article>)}</div><div><h3>Safety features</h3>{safety.map(([title, detail, Icon]) => <article key={title}><Icon size={22}/><div><strong>{title}</strong><p>{detail}</p></div></article>)}</div></div><div className="ot-values-bar"><strong>OUR SAFETY COMMITMENT</strong><span>Protect people and cargo • Follow safety procedures • Continuously improve</span></div></ScrollReveal>
    <ScrollReveal className="ot-information-band"><div><Eyebrow>OUR COMMITMENT</Eyebrow><h2>Reliable. Efficient. Customer-focused.</h2><p>To deliver secure, efficient, and reliable logistics solutions while building lasting partnerships through operational excellence, integrity, and innovation.</p></div><Link to="/services">Explore our services <ArrowRight size={19}/></Link></ScrollReveal>
  </div>;
}
export function ContactPage() {
  return <div className="ot-information"><PageReveal className="ot-info-intro"><Eyebrow>CONTACT INFORMATION</Eyebrow><h1>Let's build strong partnerships<br/>and <em>move forward.</em></h1><p>We're here to serve you. Contact our team for container handling, depot operations, storage, and other logistics inquiries.</p></PageReveal><div className="ot-contact-layout"><ScrollReveal className="ot-contact-main"><Eyebrow>ONE TRUE LOGISTICS INC.</Eyebrow><h2>Let's talk logistics.</h2><div className="ot-contact-manager"><Users size={30}/><div><strong>MADELENE GRACE TAN SY</strong><span>GENERAL MANAGER</span><small>One True Logistics Inc.</small></div></div><p>For faster assistance with an existing transaction, please have your booking reference or container number ready.</p><div className="ot-contact-lines"><a href="mailto:admincy@onetrue.ph"><Mail size={24}/><span><small>Office email</small><strong>admincy@onetrue.ph</strong></span><ArrowUpRight size={20}/></a><a href="tel:+639176281986"><Phone size={24}/><span><small>Mobile number</small><strong>09176281986</strong></span><ArrowUpRight size={20}/></a><a href="https://www.onetrue.ph/" target="_blank" rel="noopener noreferrer"><Globe2 size={24}/><span><small>Website</small><strong>www.onetrue.ph</strong></span><ArrowUpRight size={20}/></a><div><MapPin size={24}/><span><small>Office address</small><strong>Yard 2, Baseco Compound, 2nd Street, Brgy. 649, Port Area, Manila City, Philippines</strong></span></div></div></ScrollReveal><ScrollReveal delay={.12} className="ot-contact-aside"><img src={photo.yard} alt="Shipping containers at the port" loading="lazy"/><div><span>YOUR PARTNER IN LOGISTICS</span><h3>Reliable. Efficient. Committed.</h3><p>One True Logistics Inc. supports shipping and depot operations from Manila’s Port Area.</p><Link to="/services">Explore our services <ArrowRight size={18}/></Link></div></ScrollReveal></div></div>;
}
