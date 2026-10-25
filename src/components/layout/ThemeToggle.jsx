import {Moon, Sun} from 'lucide-react';
import {useTheme} from '../../theme/ThemeContext';
export default function ThemeToggle(){const {theme,toggleTheme}=useTheme();return <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme==='dark'?'light':'dark'} mode`} title={`Switch to ${theme==='dark'?'light':'dark'} mode`}>{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}<span className="theme-toggle-text">{theme==='dark'?'Light':'Dark'} mode</span></button>}
