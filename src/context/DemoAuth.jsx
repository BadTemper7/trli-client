import {connectRealtime,disconnectRealtime} from '../api/realtime';
import {API_ORIGIN} from '../api/endpoints';
import {createContext,useContext,useEffect,useState} from 'react';
const AuthContext=createContext(null);
const API=API_ORIGIN;
export async function apiRequest(path, options={}){
  const token=sessionStorage.getItem('otli-access-token');
  const headers={...(options.body instanceof FormData?{}:{'Content-Type':'application/json'}),...options.headers,...(token?{Authorization:`Bearer ${token}`}:{})};
  let response;
  try{response=await fetch(`${API}${path}`,{...options,headers});}catch{throw new Error('Cannot reach the server. Check your network connection.');}
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.message||'Request unsuccessful. Please try again.');
  return data;
}
export function DemoAuthProvider({children}){
  const [user,setUser]=useState(null);
  const [checking,setChecking]=useState(!!sessionStorage.getItem('otli-access-token'));
  useEffect(()=>{if(!checking)return;apiRequest('/api/auth/me').then(data=>{
    if(data.user?.userType==='client'&&['active','verified'].includes(data.user.status))setUser(data.user);
    else sessionStorage.removeItem('otli-access-token');
  }).catch(()=>sessionStorage.removeItem('otli-access-token')).finally(()=>setChecking(false));},[]);
  useEffect(()=>{if(user){connectRealtime(sessionStorage.getItem('otli-access-token'));return ()=>disconnectRealtime()}disconnectRealtime()},[user]);
  const login=async(email,password)=>{
    const data=await apiRequest('/api/auth/login',{method:'POST',body:JSON.stringify({email,password,loginType:'client'})});
    if(!['active','verified'].includes(data.user?.status))throw new Error('Your registration is pending administrative approval.');
    sessionStorage.setItem('otli-access-token',data.token);setUser(data.user);return true;
  };
  const logout=()=>{sessionStorage.removeItem('otli-access-token');setUser(null);};
  return <AuthContext.Provider value={{loggedIn:!!user,login,logout,user,checking}}>{children}</AuthContext.Provider>;
}
export const useDemoAuth=()=>useContext(AuthContext);
