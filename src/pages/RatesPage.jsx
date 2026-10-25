import Skeleton from '../components/ui/Skeleton';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Container, Info, PackageCheck, Warehouse, ArrowUpFromLine, ArrowDownToLine } from 'lucide-react';
import { formatPHP } from '../data/rates';
import { loadRates } from '../data/ratesSource';
import './RatesPage.css';

const services = [
  { key: 'liftOn', label: 'Lift On', Icon: ArrowUpFromLine, description: 'Charge for lifting a container from the yard onto an outbound truck or trailer.', unit: 'per lift', features: ['One container lifting operation', 'Loading onto road transport', 'Billed per completed lift'] },
  { key: 'liftOff', label: 'Lift Off', Icon: ArrowDownToLine, description: 'Charge for lifting a container off a truck or trailer and positioning it within the yard.', unit: 'per lift', features: ['One container lifting operation', 'Unloading at the yard', 'Billed per completed lift'] },
  { key: 'storage', label: 'Storage', Icon: Warehouse, description: 'Daily yard charge while your container remains in storage, subject to applicable storage terms.', unit: 'per billable day', features: ['Empty or loaded container', '20ft or 40ft rate category', 'Billed per chargeable day'] },
];

function Segmented({ label, values, value, onChange }) {
  return <div className="pricing-filter"><span className="pricing-filter-label">{label}</span><div className="pricing-segment" role="group" aria-label={label}>{values.map(item => <button key={item} type="button" aria-pressed={value === item} className={value === item ? 'active' : ''} onClick={() => onChange(item)}>{item}</button>)}</div></div>;
}

export default function RatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const trade = searchParams.get('trade')?.toLowerCase() === 'international' ? 'International' : 'Domestic';
  const setTrade = (next) => setSearchParams({ trade: next }, { replace: true });
  const [status, setStatus] = useState('Empty');
  const [size, setSize] = useState('20ft');
  const [service, setService] = useState('All');
  const [rows, setRows] = useState([]);
  const [source, setSource] = useState('api');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let current = true;
    setLoading(true);
    loadRates(trade).then(result => {
      if (!current) return;
      setRows(result.rates);
      setSource(result.source);
      setError('');
      setLoading(false);
    }).catch(err => { if (current) { setRows([]); setLoading(false); setError(err.message || 'Rates could not be loaded.'); } });
    return () => { current = false; };
  }, [trade]);
  const selected = useMemo(() => rows.find(row => row.trade === trade && row.load === status && row.size === size), [rows, trade, status, size]);
  const visible = services.filter(item => service === 'All' || item.key === service);
  return <main className="pricing-page">
    <div className="pricing-intro">
      <div className="pricing-eyebrow"><span className="pricing-dot"/> ONE TRUE LOGISTICS · CONTAINER RATES</div>
      <h1>Container <span>Rates</span></h1>
      <p>Explore Lift On, Lift Off, and Storage charges for domestic and international containers. Select your container details below to see the corresponding Philippine peso rates.</p>
    </div>
    <section className="pricing-controls" aria-label="Pricing filters">
      <Segmented label="Trade category" values={['Domestic', 'International']} value={trade} onChange={setTrade}/>
      <Segmented label="Container condition" values={['Empty', 'Loaded']} value={status} onChange={setStatus}/>
      <Segmented label="Container size" values={['20ft', '40ft']} value={size} onChange={setSize}/>
      <div className="pricing-filter pricing-service-filter"><label className="pricing-filter-label" htmlFor="pricing-service">Service</label><select id="pricing-service" value={service} onChange={e => setService(e.target.value)}><option value="All">All services</option>{services.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
    </section>
    <div className="pricing-current"><Container size={17}/><strong>{trade} rates</strong><span className="pricing-current-divider"/> {status} container <span className="pricing-current-divider"/> {size} container</div>
    {false && <div className="pricing-notice" role="note"><Info size={17}/><span><strong>Sample rates for preview only.</strong> These are demonstration amounts, not official One True Logistics tariffs.{error ? ' Live pricing is unavailable.' : ''}</span></div>}
    {error && <div className="pricing-state" role="alert">{error}</div>}
    <section aria-label={`${trade} service charges`} aria-live="polite">
      {loading ? <Skeleton variant="rates" rows={visible.length}/> : !selected || visible.length === 0 ? <div className="pricing-state"><PackageCheck size={30}/><h2>No rates available</h2><p>No pricing matches this container selection. Change the filters to view other rates.</p></div> : <div className={`pricing-cards ${visible.length === 1 ? 'pricing-cards-single' : ''}`}>
        {visible.map(({key, label, Icon, description, unit, features}) => <article className={`pricing-card ${key === 'storage' ? 'pricing-card-featured' : ''}`} key={key}>
          <div className="pricing-card-top"><div className="pricing-card-icon"><Icon size={22}/></div><span className="pricing-card-tag">{key === 'storage' ? 'STORAGE RATE' : 'HANDLING RATE'}</span></div>
          <h2>{label}</h2>
          <p className="pricing-card-description">{description}</p>
          <div className="pricing-amount">{selected[key] == null ? 'Not configured' : formatPHP(selected[key])}</div>
          <div className="pricing-per">/{unit}</div>
          <div className="pricing-card-rule"/>
          <div className="pricing-includes">What this charge covers</div>
          <ul>{features.map(feature => <li key={feature}><Check size={16}/><span>{feature}</span></li>)}<li><Check size={16}/><span>{status} · {size} · {trade}</span></li></ul>
        </article>)}
      </div>}
    </section>
    <p className="pricing-footnote"><Info size={15}/> All prices are in Philippine pesos (₱). Lift charges are quoted per operation; storage is quoted per billable day. Applicable billing rules and additional charges may vary according to your service agreement.</p>
  </main>;
}
