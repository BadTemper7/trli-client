import {createContext,useContext,useEffect,useState} from 'react';
import {socket} from '../lib/socket';
import {useAuth} from './AuthContext';
import {useToast} from './ToastContext';
const C=createContext(null);
export function SocketProvider({children}){
  const {user,setUser,refresh}=useAuth();const {toast}=useToast();const [connected,setConnected]=useState(socket.connected);
  useEffect(()=>{
    const onConnect=()=>setConnected(true);const onDisconnect=()=>setConnected(false);const onConnectError=()=>setConnected(false);
    const applyCompany=(payload)=>setUser(current=>current?{...current,company:{...current.company,verificationStatus:payload.status||current.company?.verificationStatus,rejectionReason:payload.reason??(payload.status==='VERIFIED'?null:current.company?.rejectionReason)}}:current);
    const onApproved=p=>{applyCompany({...p,status:'VERIFIED'});toast('Company verification approved')};
    const onUpdated=p=>{applyCompany(p);};
    const onRejected=p=>{applyCompany({...p,status:'REJECTED'});toast(p.reason||'Verification requires attention','error')};
    const onNotification=p=>toast(p.title||'New notification');
    const onReconnect=()=>refresh({force:true}).catch(()=>{});
    socket.on('connect',onConnect);socket.on('disconnect',onDisconnect);socket.on('connect_error',onConnectError);
    socket.on('client:verification:approved',onApproved);socket.on('client:verification:updated',onUpdated);socket.on('client:verification:rejected',onRejected);socket.on('notification:new',onNotification);socket.io.on('reconnect',onReconnect);
    return()=>{socket.off('connect',onConnect);socket.off('disconnect',onDisconnect);socket.off('connect_error',onConnectError);socket.off('client:verification:approved',onApproved);socket.off('client:verification:updated',onUpdated);socket.off('client:verification:rejected',onRejected);socket.off('notification:new',onNotification);socket.io.off('reconnect',onReconnect)};
  },[refresh,setUser,toast,user]);
  return <C.Provider value={{connected,socket}}>{children}</C.Provider>;
}
export const useSocket=()=>useContext(C);
