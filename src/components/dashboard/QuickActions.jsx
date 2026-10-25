import {Link} from 'react-router-dom';
import {ArrowRight,FilePlus2,Truck,LogOut} from 'lucide-react';
import {photo} from '../../data';
const actions=[['Submit Pre-Advice','Create a new pre-advice in minutes.','/pre-advice',FilePlus2,photo.stack],['View Gate-In','Check gate-in status and details.','/gate-in',Truck,photo.terminal],['Request Gate-Out','Submit a gate-out request for your container.','/gate-out',LogOut,photo.truck]];
export default function QuickActions(){return <section className="quick-actions"><div className="section-heading"><h2>Quick Actions</h2></div><div className="actions-grid">{actions.map(([title,description,to,Icon,img])=><Link className="action-card" key={title} to={to}><img src={img} alt="" loading="lazy"/><div className="action-overlay"/><div className="action-caption"><Icon size={28}/><div><strong>{title}</strong><small>{description}</small></div><span className="round-chevron"><ArrowRight size={17}/></span></div></Link>)}</div></section>}
