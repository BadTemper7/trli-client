import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight,ArrowUpFromLine,ArrowDownToLine,Warehouse} from 'lucide-react';
import {loadRates} from '../../data/ratesSource';
import {formatPHP} from '../../data/rates';
import './DashboardExtras.css';
const services=[
 {title:'Lift On',description:'Container loading onto outbound transport.',Icon:ArrowUpFromLine},
 {title:'Lift Off',description:'Container unloading upon arrival at the yard.',Icon:ArrowDownToLine},
 {title:'Storage',description:'Managed yard storage with container tracking.',Icon:Warehouse},
];
const chargeItems=[['Lift On','liftOn',ArrowUpFromLine],['Lift Off','liftOff',ArrowDownToLine],['Storage','storage',Warehouse]];
export default function DashboardExtras(){
 const [rates,setRates]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let active=true;loadRates('Domestic').then(result=>{if(!active)return;setRates(result.rates.find(r=>r.trade==='Domestic'&&r.load==='Empty'&&r.size==='20ft')||null);setError('');}).catch(err=>{if(active)setError(err.message||'Rates unavailable')}).finally(()=>{if(active)setLoading(false)});return ()=>{active=false}},[]);
 return <div className="dashboard-extras">
  <section className="dashboard-extra-section" aria-labelledby="dashboard-services-title">
   <div className="dashboard-extra-heading"><div><h2 id="dashboard-services-title">Our Services</h2><p>Yard handling and container management services.</p></div><Link to="/services">View all services <ArrowRight size={16}/></Link></div>
   <div className="dashboard-extra-grid">{services.map(({title,description,Icon})=><Link to="/services" key={title} className="dashboard-service-card"><span className="dashboard-extra-icon"><Icon size={22}/></span><strong>{title}</strong><p>{description}</p><span className="dashboard-extra-more">Learn more <ArrowRight size={14}/></span></Link>)}</div>
  </section>
  <section className="dashboard-extra-section" aria-labelledby="dashboard-rates-title">
   <div className="dashboard-extra-heading"><div><h2 id="dashboard-rates-title">Container Rates</h2><p>Current published rates · Domestic, empty, 20 ft</p></div><Link to="/rates">Explore all rates <ArrowRight size={16}/></Link></div>
   {loading?<div className="dashboard-extra-grid" role="status" aria-label="Loading rates">{chargeItems.map(([label])=><div className="dashboard-rate-card" key={label}><span className="dashboard-rate-skeleton short"/><span className="dashboard-rate-skeleton long"/><span className="dashboard-rate-skeleton medium"/></div>)}</div>:
   error?<div className="dashboard-extra-empty" role="alert">Rates are temporarily unavailable. <Link to="/rates">Open Rates <ArrowRight size={14}/></Link></div>:
   !rates?<div className="dashboard-extra-empty">No rates are published for this selection. <Link to="/rates">Browse rate categories</Link></div>:
   <div className="dashboard-extra-grid">{chargeItems.map(([label,key,Icon])=><Link to="/rates?trade=Domestic" className="dashboard-rate-card" key={key}><span className="dashboard-extra-icon"><Icon size={20}/></span><strong>{label}</strong><span className="dashboard-rate-amount">{rates[key]===null||rates[key]===undefined?'Not configured':formatPHP(rates[key])}</span><small>{key==='storage'?'Per billable day':'Per lift'}</small></Link>)}</div>}
   <p className="dashboard-extra-disclaimer">Rates are sourced from the server and may vary by container size, load status, trade type, and customer agreement.</p>
  </section>
 </div>;
}
