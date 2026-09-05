import {useEffect,useState} from 'react';
import type {SystemId} from './anatomy';

export interface HealthMeasurement {
 metricId:string;
 value:number;
 unit?:string;
 date:string;
 note?:string;
}

export interface HealthProfile {
 version:1;
 label?:string;
 demo?:boolean;
 measurements:HealthMeasurement[];
}

export interface HealthMetricDefinition {
 id:string;
 label:string;
 defaultUnit:string;
 category:string;
 description:string;
}

export const HEALTH_METRICS:readonly HealthMetricDefinition[] = [
 {id:'ldl',label:'LDL-C',defaultUnit:'mg/dL',category:'Sercowo-naczyniowe',description:'Stężenie cholesterolu LDL.'},
 {id:'apob',label:'ApoB',defaultUnit:'mg/dL',category:'Sercowo-naczyniowe',description:'Stężenie apolipoproteiny B.'},
 {id:'lpa',label:'Lp(a)',defaultUnit:'mg/dL',category:'Sercowo-naczyniowe',description:'Stężenie lipoproteiny(a).'},
 {id:'triglycerides',label:'Triglicerydy',defaultUnit:'mg/dL',category:'Sercowo-naczyniowe',description:'Stężenie triglicerydów.'},
 {id:'hdl',label:'HDL-C',defaultUnit:'mg/dL',category:'Sercowo-naczyniowe',description:'Stężenie cholesterolu HDL.'},
 {id:'hs_crp',label:'hs-CRP',defaultUnit:'mg/L',category:'Sercowo-naczyniowe',description:'Białko C-reaktywne oznaczone metodą wysokoczułą.'},
 {id:'systolic_bp',label:'Ciśnienie skurczowe',defaultUnit:'mmHg',category:'Sercowo-naczyniowe',description:'Skurczowe ciśnienie tętnicze.'},
 {id:'diastolic_bp',label:'Ciśnienie rozkurczowe',defaultUnit:'mmHg',category:'Sercowo-naczyniowe',description:'Rozkurczowe ciśnienie tętnicze.'},
 {id:'alt',label:'ALT',defaultUnit:'U/L',category:'Wątroba',description:'Aktywność aminotransferazy alaninowej.'},
 {id:'ast',label:'AST',defaultUnit:'U/L',category:'Wątroba',description:'Aktywność aminotransferazy asparaginianowej.'},
 {id:'ggt',label:'GGT',defaultUnit:'U/L',category:'Wątroba',description:'Aktywność gamma-glutamylotransferazy.'},
 {id:'alp',label:'ALP',defaultUnit:'U/L',category:'Wątroba',description:'Aktywność fosfatazy alkalicznej.'},
 {id:'bilirubin',label:'Bilirubina',defaultUnit:'mg/dL',category:'Wątroba',description:'Stężenie bilirubiny całkowitej.'},
 {id:'creatinine',label:'Kreatynina',defaultUnit:'mg/dL',category:'Nerki',description:'Stężenie kreatyniny w surowicy.'},
 {id:'egfr',label:'eGFR',defaultUnit:'mL/min/1.73m²',category:'Nerki',description:'Szacowany współczynnik przesączania kłębuszkowego.'},
 {id:'cystatin_c',label:'Cystatyna C',defaultUnit:'mg/L',category:'Nerki',description:'Stężenie cystatyny C w surowicy.'},
 {id:'uacr',label:'UACR',defaultUnit:'mg/g',category:'Nerki',description:'Stosunek albuminy do kreatyniny w moczu.'},
 {id:'glucose',label:'Glukoza',defaultUnit:'mg/dL',category:'Metabolizm',description:'Stężenie glukozy we krwi.'},
 {id:'hba1c',label:'HbA1c',defaultUnit:'%',category:'Metabolizm',description:'Hemoglobina glikowana.'},
 {id:'insulin',label:'Insulina',defaultUnit:'µIU/mL',category:'Metabolizm',description:'Stężenie insuliny we krwi.'},
 {id:'homa_ir',label:'HOMA-IR',defaultUnit:'',category:'Metabolizm',description:'Wyliczany wskaźnik insulinooporności.'},
 {id:'tsh',label:'TSH',defaultUnit:'mIU/L',category:'Tarczyca',description:'Hormon tyreotropowy.'},
 {id:'ft4',label:'fT4',defaultUnit:'ng/dL',category:'Tarczyca',description:'Wolna tyroksyna.'},
 {id:'ft3',label:'fT3',defaultUnit:'pg/mL',category:'Tarczyca',description:'Wolna trijodotyronina.'},
 {id:'spo2',label:'SpO₂',defaultUnit:'%',category:'Układ oddechowy',description:'Obwodowa saturacja krwi tlenem.'},
 {id:'fev1',label:'FEV₁',defaultUnit:'L',category:'Układ oddechowy',description:'Natężona objętość wydechowa pierwszosekundowa.'},
 {id:'b12',label:'Witamina B12',defaultUnit:'pg/mL',category:'Układ nerwowy',description:'Stężenie witaminy B12.'},
 {id:'homocysteine',label:'Homocysteina',defaultUnit:'µmol/L',category:'Układ nerwowy',description:'Stężenie homocysteiny w osoczu.'},
 {id:'urinalysis_ph',label:'pH moczu',defaultUnit:'',category:'Układ moczowy',description:'Odczyn pH w badaniu moczu.'},
];

const METRIC_BY_ID=new Map(HEALTH_METRICS.map(metric=>[metric.id,metric]));
const CARDIO_IDS=['ldl','apob','lpa','triglycerides','hdl','hs_crp','systolic_bp','diastolic_bp'];

const STRUCTURE_METRICS:{patterns:string[];metricIds:string[]}[] = [
 {patterns:['heart','cardiac','atrium','atrial','ventricle','ventricular','aorta','coronary','artery','arterial','vein','venous','serce','przedsionek','komora','aorta','wieńc'],metricIds:CARDIO_IDS},
 {patterns:['liver','hepatic','wątroba','wątrob'],metricIds:['alt','ast','ggt','alp','bilirubin']},
 {patterns:['kidney','renal','nerka','nerki','nerk'],metricIds:['creatinine','egfr','cystatin_c','uacr']},
 {patterns:['pancreas','trzustka','trzustk'],metricIds:['glucose','hba1c','insulin','homa_ir']},
 {patterns:['thyroid','tarczyca','tarcz'],metricIds:['tsh','ft4','ft3']},
 {patterns:['lung','bronch','trachea','płuco','płuca','oskrzel','tchawica'],metricIds:['spo2','fev1']},
 {patterns:['brain','cerebr','spinal cord','mózg','rdzeń kręgowy'],metricIds:['b12','homocysteine']},
 {patterns:['urinary bladder','bladder','pęcherz moczowy','pęcherz'],metricIds:['urinalysis_ph','uacr']},
];

const SYSTEM_FALLBACK:Partial<Record<SystemId,string[]>>={
 cardiac:CARDIO_IDS,
 arterial:CARDIO_IDS,
 venous:CARDIO_IDS,
};

export const EMPTY_HEALTH_PROFILE:HealthProfile={version:1,measurements:[]};

// Dane syntetyczne służą wyłącznie do demonstracji interfejsu. To nie są dane użytkownika.
export const DEMO_HEALTH_PROFILE:HealthProfile={
 version:1,
 label:'Syntetyczny profil demonstracyjny',
 demo:true,
 measurements:[
  {metricId:'ldl',value:118,unit:'mg/dL',date:'2026-01-15'},{metricId:'ldl',value:110,unit:'mg/dL',date:'2026-04-20'},{metricId:'ldl',value:101,unit:'mg/dL',date:'2026-08-18'},
  {metricId:'apob',value:92,unit:'mg/dL',date:'2026-01-15'},{metricId:'apob',value:87,unit:'mg/dL',date:'2026-04-20'},{metricId:'apob',value:83,unit:'mg/dL',date:'2026-08-18'},
  {metricId:'lpa',value:18,unit:'mg/dL',date:'2026-08-18'},{metricId:'triglycerides',value:96,unit:'mg/dL',date:'2026-08-18'},{metricId:'hdl',value:55,unit:'mg/dL',date:'2026-08-18'},
  {metricId:'hs_crp',value:0.4,unit:'mg/L',date:'2026-08-18'},{metricId:'systolic_bp',value:121,unit:'mmHg',date:'2026-08-18'},{metricId:'diastolic_bp',value:78,unit:'mmHg',date:'2026-08-18'},
  {metricId:'alt',value:29,unit:'U/L',date:'2026-02-10'},{metricId:'alt',value:25,unit:'U/L',date:'2026-08-18'},{metricId:'ast',value:24,unit:'U/L',date:'2026-08-18'},{metricId:'ggt',value:21,unit:'U/L',date:'2026-08-18'},
  {metricId:'creatinine',value:0.96,unit:'mg/dL',date:'2026-02-10'},{metricId:'creatinine',value:0.91,unit:'mg/dL',date:'2026-08-18'},{metricId:'egfr',value:98,unit:'mL/min/1.73m²',date:'2026-08-18'},
  {metricId:'glucose',value:91,unit:'mg/dL',date:'2026-02-10'},{metricId:'glucose',value:87,unit:'mg/dL',date:'2026-08-18'},{metricId:'hba1c',value:5.2,unit:'%',date:'2026-08-18'},{metricId:'insulin',value:6.1,unit:'µIU/mL',date:'2026-08-18'},
  {metricId:'tsh',value:1.7,unit:'mIU/L',date:'2026-08-18'},{metricId:'spo2',value:98,unit:'%',date:'2026-08-18'},{metricId:'b12',value:510,unit:'pg/mL',date:'2026-08-18'},
 ]
};

const STORAGE_KEY='human-atlas.health-profile.v1';

export function metricDefinition(metricId:string){return METRIC_BY_ID.get(metricId);}

export function metricsForStructure(name:string|undefined,system:SystemId|undefined):HealthMetricDefinition[]{
 const normalized=(name??'').toLowerCase();
 const direct=STRUCTURE_METRICS.find(group=>group.patterns.some(pattern=>normalized.includes(pattern)))?.metricIds;
 const ids=direct??(system?SYSTEM_FALLBACK[system]:undefined)??[];
 return ids.map(id=>METRIC_BY_ID.get(id)).filter((metric):metric is HealthMetricDefinition=>!!metric);
}

export function historyForMetric(profile:HealthProfile,metricId:string){
 return profile.measurements.filter(item=>item.metricId===metricId).slice().sort((a,b)=>a.date.localeCompare(b.date));
}

export function latestForMetric(profile:HealthProfile,metricId:string){
 const history=historyForMetric(profile,metricId);
 return history.at(-1);
}

export function formatHealthValue(measurement:HealthMeasurement,definition:HealthMetricDefinition){
 const value=new Intl.NumberFormat('pl-PL',{maximumFractionDigits:measurement.value<10?2:1}).format(measurement.value);
 const unit=measurement.unit??definition.defaultUnit;
 return unit?`${value} ${unit}`:value;
}

export function formatHealthDate(date:string){
 const parsed=new Date(`${date}T00:00:00`);
 if(Number.isNaN(parsed.getTime()))return date;
 return new Intl.DateTimeFormat('pl-PL',{year:'numeric',month:'short',day:'numeric'}).format(parsed);
}

export function normalizeHealthProfile(raw:unknown):HealthProfile{
 if(!raw||typeof raw!=='object')throw new Error('Profil zdrowia musi być obiektem JSON.');
 const object=raw as Record<string,unknown>;
 if(!Array.isArray(object.measurements))throw new Error('Profil zdrowia musi zawierać tablicę measurements.');
 const measurements=object.measurements.map((row,index)=>{
  if(!row||typeof row!=='object')throw new Error(`Pomiar ${index+1} nie jest poprawnym obiektem.`);
  const item=row as Record<string,unknown>;
  const metricId=typeof item.metricId==='string'?item.metricId.trim():'';
  const value=typeof item.value==='number'?item.value:Number(item.value);
  const date=typeof item.date==='string'?item.date.trim():'';
  if(!metricId||!Number.isFinite(value)||!date)throw new Error(`Pomiar ${index+1} wymaga metricId, wartości liczbowej i daty.`);
  return {metricId,value,unit:typeof item.unit==='string'?item.unit:undefined,date,note:typeof item.note==='string'?item.note:undefined} satisfies HealthMeasurement;
 });
 return {version:1,label:typeof object.label==='string'?object.label:undefined,demo:object.demo===true,measurements};
}

export function profileStats(profile:HealthProfile){
 const ids=new Set(profile.measurements.map(item=>item.metricId));
 const dates=profile.measurements.map(item=>item.date).filter(Boolean).sort();
 return {measurements:profile.measurements.length,metrics:ids.size,latestDate:dates.at(-1)};
}

export function useHealthProfile(){
 const [profile,setProfileState]=useState<HealthProfile>(EMPTY_HEALTH_PROFILE);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  try{
   const stored=window.localStorage.getItem(STORAGE_KEY);
   if(stored)setProfileState(normalizeHealthProfile(JSON.parse(stored)));
  }catch(error){console.warn('Nie udało się wczytać lokalnego profilu zdrowia.',error);}
  finally{setReady(true);}
 },[]);
 const setProfile=(next:HealthProfile)=>{
  setProfileState(next);
  try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch(error){console.warn('Nie udało się zapisać lokalnego profilu zdrowia.',error);}
 };
 const clearProfile=()=>{
  setProfileState(EMPTY_HEALTH_PROFILE);
  try{window.localStorage.removeItem(STORAGE_KEY);}catch(error){console.warn('Nie udało się wyczyścić lokalnego profilu zdrowia.',error);}
 };
 return {profile,setProfile,clearProfile,ready};
}
