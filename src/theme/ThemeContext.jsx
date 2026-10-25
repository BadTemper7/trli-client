import {createContext,useContext,useEffect} from 'react';
const ThemeContext=createContext({theme:'light',toggleTheme:()=>{}});
export function ThemeProvider({children}){
  useEffect(()=>{document.documentElement.dataset.theme='light';document.documentElement.style.colorScheme='light';try{localStorage.removeItem('otl-theme')}catch{}},[]);
  return <ThemeContext.Provider value={{theme:'light',toggleTheme:()=>{}}}>{children}</ThemeContext.Provider>;
}
export const useTheme=()=>useContext(ThemeContext);
