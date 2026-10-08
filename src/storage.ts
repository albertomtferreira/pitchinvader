export function load(key:string,fallback:number){try{const v=Number(localStorage.getItem(key));return Number.isFinite(v)&&v>=0&&localStorage.getItem(key)!==null?v:fallback;}catch{return fallback;}}
export function save(key:string,value:number){try{localStorage.setItem(key,String(value));}catch{/* Private/storage-restricted browsers still play. */}}
