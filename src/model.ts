import {C,clamp,difficulty,staminaStep} from './config';
export type Actor={x:number;y:number;vx:number;vy:number;kind:'invader'|'blue'|'coral'|'ref'|'steward';id:number;homeX:number;homeY:number;warning:number;close:boolean};
export type Input={x:number;y:number;sprint:boolean};
const actor=(x:number,y:number,kind:Actor['kind'],id:number):Actor=>({x,y,vx:0,vy:0,kind,id,homeX:x,homeY:y,warning:0,close:false});
export class World{
 player=actor(600,465,'invader',0); obstacles:Actor[]=[]; stewards:Actor[]=[]; time=0; stamina=100; delay=0; locked=false; sprinting=false; cooldown=0; slow=0; stun=0; near=0; captured=false; running=false; ball={x:600,y:330}; onEvent:(name:string)=>void=()=>{};
 constructor(){this.reset();}
 reset(){this.player=actor(600,465,'invader',0);this.obstacles=[];this.stewards=[];this.time=0;this.stamina=100;this.delay=0;this.locked=false;this.cooldown=0;this.slow=0;this.stun=0;this.near=0;this.captured=false;this.sprinting=false;
 const formation=[[.035,.5],[.22,.15],[.22,.38],[.22,.62],[.22,.85],[.4,.2],[.4,.5],[.4,.8],[.6,.2],[.65,.5],[.6,.8]];
 for(let team=0;team<2;team++)formation.forEach(([x,y],i)=>this.obstacles.push(actor(125+(team?1-x:x)*950,105+y*450,team?'coral':'blue',team*11+i)));
 this.obstacles.push(actor(610,260,'ref',22));this.spawn();this.spawn();}
 spawn(){let x=0,y=0;for(let tries=0;tries<20;tries++){const edge=(this.stewards.length+tries)%4; x=edge<2?(edge===0?C.pitch.left:C.pitch.right):160+Math.random()*880;y=edge>=2?(edge===2?C.pitch.top:C.pitch.bottom):125+Math.random()*410;if(Math.hypot(x-this.player.x,y-this.player.y)>270)break;}const s=actor(x,y,'steward',this.stewards.length);s.warning=C.entryWarning;this.stewards.push(s);}
 bound(a:Actor){a.x=clamp(a.x,C.pitch.left+C.radius,C.pitch.right-C.radius);a.y=clamp(a.y,C.pitch.top+C.radius,C.pitch.bottom-C.radius);}
 step(dt:number,input:Input){if(!this.running||this.captured)return;this.time+=dt;this.cooldown=Math.max(0,this.cooldown-dt);this.slow=Math.max(0,this.slow-dt);this.stun=Math.max(0,this.stun-dt);
 const st=staminaStep(this.stamina,this.delay,this.locked,input.sprint&&Math.hypot(input.x,input.y)>.1&&this.stun===0,dt);this.stamina=st.s;this.delay=st.delay;this.locked=st.locked;this.sprinting=st.active;
 const n=Math.max(1,Math.hypot(input.x,input.y));const speed=(st.active?C.sprintSpeed:C.playerSpeed)*(this.slow>0?.5:1)*(this.stun>0?0:1);this.player.vx=input.x/n*speed;this.player.vy=input.y/n*speed;this.player.x+=this.player.vx*dt;this.player.y+=this.player.vy*dt;this.bound(this.player);
 this.ball.x=600+Math.sin(this.time*.32)*365;this.ball.y=330+Math.sin(this.time*.71)*170;
 for(const a of this.obstacles){let tx=a.homeX+Math.sin(this.time*.6+a.id)*32,ty=a.homeY+Math.cos(this.time*.45+a.id)*38;if(a.kind==='ref'){tx=this.ball.x+60;ty=this.ball.y-65;}else if(a.id%11!==0&&Math.hypot(a.x-this.ball.x,a.y-this.ball.y)<140){tx=this.ball.x+(a.kind==='blue'?-24:24);ty=this.ball.y;}const d=Math.hypot(tx-a.x,ty-a.y);a.vx=d>3?(tx-a.x)/d*48:0;a.vy=d>3?(ty-a.y)/d*48:0;a.x+=a.vx*dt;a.y+=a.vy*dt;this.bound(a);
 const dist=Math.hypot(this.player.x-a.x,this.player.y-a.y);if(dist<C.radius+C.obstacleRadius){const nx=dist>.01?(this.player.x-a.x)/dist:1,ny=dist>.01?(this.player.y-a.y)/dist:0;this.player.x=a.x+nx*(C.radius+C.obstacleRadius+1);this.player.y=a.y+ny*(C.radius+C.obstacleRadius+1);if(this.cooldown===0){this.player.x+=nx*C.knockback;this.player.y+=ny*C.knockback;this.cooldown=C.collisionCooldown;if(a.kind==='ref'){this.stun=C.stunDuration;this.onEvent('whistle');}else{this.slow=C.slowDuration;this.onEvent('bump');}}this.bound(this.player);}}
 const diff=difficulty(this.time);if(this.stewards.length<diff.count)this.spawn();
 for(const s of this.stewards){s.warning=Math.max(0,s.warning-dt);if(s.warning>0||this.time<C.headStart)continue;let dx=this.player.x+(s.id%2?this.player.vx*.65:0)-s.x,dy=this.player.y+(s.id%2?this.player.vy*.65:0)-s.y;let d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
 for(const o of [...this.obstacles,...this.stewards]){if(o===s)continue;const ox=s.x-o.x,oy=s.y-o.y,od=Math.hypot(ox,oy);if(od<48&&od>.01){const strength=(48-od)/48*2.4;dx+=ox/od*strength;dy+=oy/od*strength;}}
 d=Math.hypot(dx,dy)||1;const blend=Math.min(1,C.turnRate*dt);s.vx+=(dx/d*diff.speed-s.vx)*blend;s.vy+=(dy/d*diff.speed-s.vy)*blend;s.x+=s.vx*dt;s.y+=s.vy*dt;this.bound(s);
 for(const o of this.obstacles){const od=Math.hypot(s.x-o.x,s.y-o.y);if(od<21){s.x=o.x+(od>.01?(s.x-o.x)/od:1)*21;s.y=o.y+(od>.01?(s.y-o.y)/od:0)*21;this.bound(s);}}
 const pd=Math.hypot(s.x-this.player.x,s.y-this.player.y);if(pd<C.nearDistance)s.close=true;if(s.close&&pd>C.escapeDistance){this.near++;s.close=false;this.onEvent('near');}if(pd<C.radius*1.75){this.captured=true;this.running=false;this.onEvent('capture');break;}}
 }
}
