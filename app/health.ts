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
 {id:'ldl',label:'LDL-C',defaultUnit:'mg/dL',category:'Cardiovascular',description:'LDL cholesterol measurement.'},
 {id:'apob',label:'ApoB',defaultUnit:'mg/dL',category:'Cardiovascular',description:'Apolipoprotein B measurement.'},
 {id:'lpa',label:'Lp(a)',defaultUnit:'mg/dL',category:'Cardiovascular',description:'Lipoprotein(a) measurement.'},
 {id:'triglycerides',label:'Triglycerides',defaultUnit:'mg/dL',category:'Cardiovascular',description:'Fasting or non-fasting triglyceride measurement.'},
 {id:'hdl',label:'HDL-C',defaultUnit:'mg/dL',category:'Cardiovascular',description:'HDL cholesterol measurement.'},
 {id:'hs_crp',label:'hs-CRP',defaultUnit:'mg/L',category:'Cardiovascular',description:'High-sensitivity C-reactive protein measurement.'},
 {id:'systolic_bp',label:'Systolic BP',defaultUnit:'mmHg',category:'Cardiovascular',description:'Systolic blood pressure.'},
 {id:'diastolic_bp',label:'Diastolic BP',defaultUnit:'mmHg',category:'Cardiovascular',description:'Diastolic blood pressure.'},
 {id:'alt',label:'ALT',defaultUnit:'U/L',category:'Liver',description:'Alanine aminotransferase measurement.'},
 {id:'ast',label:'AST',defaultUnit:'U/L',category:'Liver',description:'Aspartate aminotransferase measurement.'},
 {id:'ggt',label:'GGT',defaultUnit:'U/L',category:'Liver',description:'Gamma-glutamyl transferase measurement.'},
 {id:'alp',label:'ALP',defaultUnit:'U/L',category:'Liver',description:'Alkaline phosphatase measurement.'},
 {id:'bilirubin',label:'Bilirubin',defaultUnit:'mg/dL',category:'Liver',description:'Total bilirubin measurement.'},
 {id:'creatinine',label:'Creatinine',defaultUnit:'mg/dL',category:'Kidney',description:'Serum creatinine measurement.'},
 {id:'egfr',label:'eGFR',defaultUnit:'mL/min/1.73m²',category:'Kidney',description:'Estimated glomerular filtration rate.'},
 {id:'cystatin_c',label:'Cystatin C',defaultUnit:'mg/L',category:'Kidney',description:'Serum cystatin C measurement.'},
 {id:'uacr',label:'Urine ACR',defaultUnit:'mg/g',category:'Kidney',description:'Urine albumin-to-creatinine ratio.'},
 {id:'glucose',label:'Glucose',defaultUnit:'mg/dL',category:'Metabolic',description:'Blood glucose measurement.'},
 {id:'hba1c',label:'HbA1c',defaultUnit:'%',category:'Metabolic',description:'Glycated hemoglobin measurement.'},
 {id:'insulin',label:'Insulin',defaultUnit:'µIU/mL',category:'Metabolic',description:'Blood insulin measurement.'},
 {id:'homa_ir',label:'HOMA-IR',defaultUnit:'',category:'Metabolic',description:'Calculated insulin resistance index.'},
 {id:'tsh',label:'TSH',defaultUnit:'mIU/L',category:'Thyroid',description:'Thyroid-stimulating hormone measurement.'},
 {id:'ft4',label:'Free T4',defaultUnit:'ng/dL',category:'Thyroid',description:'Free thyroxine measurement.'},
 {id:'ft3',label:'Free T3',defaultUnit:'pg/mL',category:'Thyroid',description:'Free triiodothyronine measurement.'},
 {id:'spo2',label:'SpO₂',defaultUnit:'%',category:'Respiratory',description:'Peripheral oxygen saturation.'},
 {id:'fev1',label:'FEV₁',defaultUnit:'L',category:'Respiratory',description:'Forced expiratory volume in one second.'},
 {id:'b12',label:'Vitamin B12',defaultUnit:'pg/mL',category:'Neurologic',description:'Vitamin B12 measurement.'},
 {id:'homocysteine',label:'Homocysteine',defaultUnit:'µmol/L',category:'Neurologic',description:'Plasma homocysteine measurement.'},
 {id:'urinalysis_ph',label:'Urine pH',defaultUnit:'',category:'Urinary',description:'Urinalysis pH measurement.'},
];

const METRIC_BY_ID=new Map(HEALTH_METRICS.map(metric=>[metric.id,metric]));
const CARDIO_IDS=['ldl','apob','lpa','triglycerides','hdl','hs_crp','systolic_bp','diastolic_bp'];

const STRUCTURE_METRICS:{patterns:string[];metricIds:string[]}[] = [
 {patterns:['heart'],metricIds:CARDIO_IDS},
 {patterns:['liver','hepatic'],metricIds:['alt','ast','ggt','alp','bilirubin']},
 {patterns:['kidney','renal'],metricIds:['creatinine','egfr','cystatin_c','uacr']},
 {patterns:['pancreas'],metricIds:['glucose','hba1c','insulin','homa_ir']},
 {patterns:['thyroid'],metricIds:['tsh','ft4','ft3']},
 {patterns:['lung','bronch','trachea'],metricIds:['spo2','fev1']},
 {patterns:['brain','cerebr','spinal cord'],metricIds:['b12','homocysteine']},
 {patterns:['urinary bladder','bladder'],metricIds:['urinalysis_ph','uacr']},
];

const SYSTEM_FALLBACK:Partial<Record<SystemId,string[]>>={
 cardiac:CARDIO_IDS,
 arterial:CARDIO_IDS,
 venous:CARDIO_IDS,
};

export const EMPTY_HEALTH_PROFILE:HealthProfile={version:1,measurements:[]};

// Synthetic values used only to demonstrate the UI. They are not user data.
export const DEMO_HEALTH_PROFILE:HealthProfile={
 version:1,
 label:'Synthetic demo profile',
 demo:true,
 measurements:[
  {metricId:'ldl',value:118,unit:'mg/dL',date:'2026-01-15'},{metricId:'ldl',value:110,unit:'mg/dL',date:'2026-04-20'},{metricId:'ldl',value:101,unit:'mg/dL',date:'2026-08-18'},
  {metricId:'apob',value:92,unit:'mg/dL',date:'2026-01-15'},{metricId:'apob',value:87,unit:'mg/dL',date:'2026-04-20'},{metricId:'apob',value:83,unit:'mg/dL',date:'2026-08-18'},
  {metricId:'lpa',value:18,unit:'mg/dL',date:'2026-08-18'},{metricId:'triglycerides',value:96,unit:'mg/dL',date:'2026-08-18'},{metricId:'hdl',value:55,unit:'mg/dL',date:'2026-08-18'},
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
 const value=new Intl.NumberFormat(undefined,{maximumFractionDigits:measurement.value<10?2:1}).format(measurement.value);
 const unit=measurement.unit??definition.defaultUnit;
 return unit?`${value} ${unit}`:value;
}

export function formatHealthDate(date:string){
 const parsed=new Date(`${date}T00:00:00`);
 if(Number.isNaN(parsed.getTime()))return date;
 return new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric'}).format(parsed);
}

export function normalizeHealthProfile(raw:unknown):HealthProfile{
 if(!raw||typeof raw!=='object')throw new Error('Health profile must be a JSON object.');
 const object=raw as Record<string,unknown>;
 if(!Array.isArray(object.measurements))throw new Error('Health profile needs a measurements array.');
 const measurements=object.measurements.map((row,index)=>{
  if(!row||typeof row!=='object')throw new Error(`Measurement ${index+1} is not an object.`);
  const item=row as Record<string,unknown>;
  const metricId=typeof item.metricId==='string'?item.metricId.trim():'';
  const value=typeof item.value==='number'?item.value:Number(item.value);
  const date=typeof item.date==='string'?item.date.trim():'';
  if(!metricId||!Number.isFinite(value)||!date)throw new Error(`Measurement ${index+1} needs metricId, numeric value, and date.`);
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
  }catch(error){console.warn('Could not load local health profile.',error);}
  finally{setReady(true);}
 },[]);
 const setProfile=(next:HealthProfile)=>{
  setProfileState(next);
  try{window.localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch(error){console.warn('Could not store local health profile.',error);}
 };
 const clearProfile=()=>{
  setProfileState(EMPTY_HEALTH_PROFILE);
  try{window.localStorage.removeItem(STORAGE_KEY);}catch(error){console.warn('Could not clear local health profile.',error);}
 };
 return {profile,setProfile,clearProfile,ready};
}
