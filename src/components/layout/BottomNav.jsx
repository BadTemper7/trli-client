import { NavLink } from 'react-router-dom';
import {useDemoAuth} from '../../context/DemoAuth';
import { House, ClipboardList, Container, Tag, UserRound } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', Icon: House },
  { to: '/bookings', label: 'Bookings', Icon: ClipboardList },
  { to: '/containers', label: 'Containers', Icon: Container },
  { to: '/rates', label: 'Rates', Icon: Tag },
  { to: '/profile', label: 'Profile', Icon: UserRound },
];

export default function BottomNav() {
  const {loggedIn}=useDemoAuth(); const visible=loggedIn?items:[{to:'/',label:'Home',Icon:House},{to:'/services',label:'Services',Icon:Container},{to:'/rates/domestic',label:'Domestic',Icon:Tag},{to:'/rates/international',label:'Global',Icon:Tag},{to:'/login',label:'Sign in',Icon:UserRound}];
  return <nav className="bottom-nav" aria-label="Mobile navigation">
    {visible.map(({to,label,Icon}) => <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => isActive ? 'active' : ''}>
      <Icon size={21} aria-hidden="true"/><span>{label}</span>
    </NavLink>)}
  </nav>;
}
