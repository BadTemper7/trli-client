import {createContext,useCallback,useContext,useEffect,useState} from 'react';
import {api,clearToken,getToken,normalizeBooking,saveToken} from '../api';
const C=createContext(null);
export function ClientProvider({children}){
 const [user,setUser]=useState(null),[bookings,setBookings]=useState([]),[notifications,setNotifications]=useState([]);
 const [loading,setLoading]=useState(Boolean(getToken())),[error,setError]=useState('');
 const refresh=useCallback(async(currentUser)=>{
  const u=currentUser||user;if(!u||!['verified','active'].includes(u.status)){setBookings([]);return;}
  const [b,n]=await Promise.allSettled([api('/client/bookings'),api('/client/notifications')]);
  if(b.status==='fulfilled')setBookings((b.value.bookings||[]).map(normalizeBooking));else setError(b.reason.message);
  if(n.status==='fulfilled')setNotifications(n.value.notifications||[]);
 },[user]);
 useEffect(()=>{if(!getToken()){setLoading(false);return;}let active=true;api('/auth/me').then(async r=>{if(!active)return; if(r.user?.userType!=='client')throw Error('Only client accounts are supported.');setUser(r.user);await refresh(r.user);}).catch(e=>{if(!active)return;clearToken();setUser(null);setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false};},[]);
 const login=async(email,password)=>{const r=await api('/auth/login',{method:'POST',body:{email,password,loginType:'client'}});if(r.user?.userType!=='client')throw Error('Client account required.');saveToken(r.token);setUser(r.user);setError('');await refresh(r.user);return r.user};
 const logout=()=>{clearToken();setUser(null);setBookings([]);setNotifications([])};
 return <C.Provider value={{user,bookings,notifications,loading,error,setError,login,logout,refresh,setUser}}>{children}</C.Provider>;
}
export const useClient=()=>useContext(C);
