import {motion, useReducedMotion} from 'framer-motion';
export const viewport={once:true,amount:0.12};
export const reveal={initial:{opacity:0,y:22},whileInView:{opacity:1,y:0},transition:{duration:.55,ease:[.22,1,.36,1]}};
export function PageReveal({children,className='',delay=0,...props}){
 const reduce=useReducedMotion();
 return <motion.div className={className} initial={reduce?false:{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.45,delay:reduce?0:delay}} {...props}>{children}</motion.div>
}
export function ScrollReveal({children,className='',delay=0,...props}){
 const reduce=useReducedMotion();
 return <motion.div className={className} initial={reduce?false:{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={viewport} transition={{duration:reduce?0:.55,delay:reduce?0:delay}} {...props}>{children}</motion.div>
}
