import {useMemo,useRef,useState} from 'react';
import {Activity,Database,FileUp,HeartPulse,Trash2,TrendingDown,TrendingUp} from 'lucide-react';
import {Button} from '@/components/ui/button';
import type {SystemId} from './anatomy';
import {DEMO_HEALTH_PROFILE,formatHealthDate,formatHealthValue,historyForMetric,latestForMetric,metricsForStructure,normalizeHealthProfile,profileStats,type HealthMetricDefinition,type HealthProfile} from './health';

function Sparkline({values}:{values:number[]}){
 if(values.length<2)return <div className="health-sparkline-empty">No trend yet</div>;
 const width=118,height=32,pad=3,min=Math.min(...values),max=Math.max(...values),range=max-min||1;
 const points=values.map((value,index)=>`${pad+(index/(values.length-1))*(width-pad*2)},${height-pad-((value-min)/range)*(height-pad*2)}`).join(' ');
 return <svg className="health-sparkline" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Measurement trend"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function MetricCard({metric,profile}:{metric:HealthMetricDefinition;profile:HealthProfile}){
 const history=historyForMetric(profile,metric.id),latest=latestForMetric(profile,metric.id),previous=history.at(-2);
 const delta=latest&&previous?latest.value-previous.value:undefined;
 return <article className="health-metric-card">
  <div className="health-metric-top"><div><span>{metric.label}</span>{latest?<strong>{formatHealthValue(latest,metric)}</strong>:<strong className="missing">No data</strong>}</div>{typeof delta==='number'&&delta!==0?<span className="health-trend" aria-label={delta>0?'Latest value increased':'Latest value decreased'}>{delta>0?<TrendingUp size={15}/>:<TrendingDown size={15}/>}</span>:null}</div>
  <Sparkline values={history.map(item=>item.value)}/>
  <div className="health-metric-foot"><span>{latest?formatHealthDate(latest.date):metric.category}</span><span>{history.length?`${history.length} ${history.length===1?'reading':'readings'}`:'—'}</span></div>
 </article>;
}

export default function HealthPanel({structureName,system,profile,onProfileChange,onClear}:{structureName?:string;system?:SystemId;profile:HealthProfile;onProfileChange:(profile:HealthProfile)=>void;onClear:()=>void}){
 const fileRef=useRef<HTMLInputElement>(null),[error,setError]=useState('');
 const metrics=useMemo(()=>metricsForStructure(structureName,system),[structureName,system]);
 const stats=useMemo(()=>profileStats(profile),[profile]);
 const importFile=async(file:File)=>{
  setError('');
  try{const parsed=JSON.parse(await file.text());onProfileChange(normalizeHealthProfile(parsed));}
  catch(err){setError(err instanceof Error?err.message:'Could not import this file.');}
  finally{if(fileRef.current)fileRef.current.value='';}
 };
 return <section className="health-panel" aria-label="Health data linked to selected anatomy">
  <div className="health-panel-heading"><div><div className="eyebrow"><HeartPulse size={13}/> HEALTH DATA</div><h3>{structureName?structureName:'Select a structure'}</h3></div>{profile.demo&&<span className="health-demo-badge">DEMO</span>}</div>
  <p className="health-intro">{metrics.length?`Measurements commonly reviewed alongside ${structureName?.toLowerCase()??'this structure'}. Values are shown as recorded; no diagnosis or automatic risk label is applied.`:'Select the heart, liver, kidneys, pancreas, thyroid, lungs, brain or bladder to see linked measurements.'}</p>
  {metrics.length>0&&<div className="health-metric-grid">{metrics.map(metric=><MetricCard key={metric.id} metric={metric} profile={profile}/>)}</div>}
  <div className="health-data-summary"><Database size={15}/><span>{stats.measurements?`${stats.measurements} readings · ${stats.metrics} metrics${stats.latestDate?` · latest ${formatHealthDate(stats.latestDate)}`:''}`:'No local health data loaded'}</span></div>
  {error&&<p className="health-import-error" role="alert">{error}</p>}
  <div className="health-actions"><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={event=>{const file=event.target.files?.[0];if(file)void importFile(file);}}/><Button variant="ghost" onClick={()=>fileRef.current?.click()}><FileUp size={15}/>Import JSON</Button><Button variant="ghost" onClick={()=>{setError('');onProfileChange(DEMO_HEALTH_PROFILE);}}><Activity size={15}/>Load demo</Button>{profile.measurements.length>0&&<Button variant="ghost" onClick={()=>{setError('');onClear();}}><Trash2 size={15}/>Clear</Button>}</div>
  <p className="health-privacy-note">Stored only in this browser via localStorage. Importing a file does not upload it to a server.</p>
 </section>;
}
