import {io} from 'socket.io-client';
import {SOCKET_ORIGIN} from './endpoints';
const base=SOCKET_ORIGIN;
let socket=null;
const listeners=new Set();
export function subscribeRealtime(callback){listeners.add(callback);return ()=>listeners.delete(callback)}
function notify(event){for(const fn of [...listeners])fn(event)}
export function connectRealtime(token){
 if(!token)return disconnectRealtime();
 if(socket){if(socket.auth?.token===token)return;disconnectRealtime()}
 socket=io(base,{path:'/socket.io',autoConnect:true,auth:{token},transports:['websocket','polling'],reconnection:true,reconnectionDelay:1000,reconnectionDelayMax:10000});
 socket.onAny(event=>notify(event));
 socket.on('connect',()=>notify('realtime:refresh'));
 socket.on('reconnect',()=>notify('realtime:refresh'));
 socket.on('connect_error',err=>{if(import.meta.env.DEV)console.warn('Socket connection:',err.message)});
}
export function disconnectRealtime(){if(socket){socket.removeAllListeners();socket.disconnect();socket=null}}
