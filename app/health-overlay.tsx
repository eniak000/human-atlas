import {useEffect,useMemo,useState} from 'react';
import {X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import HealthPanel from './health-panel';
import {metricsForStructure,useHealthProfile} from './health';

function readSelectedStructure(){
 const title=document.querySelector('.detail-sheet .structure-title');
 return title?.textContent?.trim()??'';
}

export default function HealthOverlay(){
 const {profile,setProfile,clearProfile,ready}=useHealthProfile();
 const [structure,setStructure]=useState(''),[dismissedFor,setDismissedFor]=useState('');
 useEffect(()=>{
  let frame=0;
  const sync=()=>{
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>setStructure(readSelectedStructure()));
  };
  sync();
  const observer=new MutationObserver(sync);
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-state','class']});
  return()=>{cancelAnimationFrame(frame);observer.disconnect();};
 },[]);
 useEffect(()=>{if(structure&&structure!==dismissedFor)setDismissedFor('');},[structure]);
 const linked=useMemo(()=>metricsForStructure(structure,undefined),[structure]);
 if(!ready||!structure||!linked.length||dismissedFor===structure)return null;
 return <aside className="health-overlay glass">
  <Button variant="ghost" className="health-overlay-close" aria-label="Close health data" onClick={()=>setDismissedFor(structure)}><X size={16}/></Button>
  <HealthPanel structureName={structure} profile={profile} onProfileChange={setProfile} onClear={clearProfile}/>
 </aside>;
}
