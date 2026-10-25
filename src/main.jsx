import ReactDOM from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import {HelmetProvider} from 'react-helmet-async';
import './index.css';
import App from './App';
import {ToastProvider} from './context/ToastContext';
import {AuthProvider} from './context/AuthContext';
import {SocketProvider} from './context/SocketContext';
import {SiteSettingsProvider} from './context/SiteSettingsContext';
import {installResponsiveTables} from './lib/responsiveTables';

installResponsiveTables();
ReactDOM.createRoot(document.getElementById('root')).render(<HelmetProvider><BrowserRouter><ToastProvider><SiteSettingsProvider><AuthProvider><SocketProvider><App/></SocketProvider></AuthProvider></SiteSettingsProvider></ToastProvider></BrowserRouter></HelmetProvider>);
