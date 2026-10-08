import {describe,it,expect} from 'vitest';
import {World} from '../src/model';
import {C} from '../src/config';
const idle={x:0,y:0,sprint:false};
function setup(){const w=new World();w.running=true;w.obstacles=[];w.stewards.forEach(s=>{s.warning=100;});return w;}
describe('ball and steward interaction',()=>{
 it('kicks on moving contact and sprint gives a stronger kick',()=>{
  const kick=(sprint:boolean)=>{const w=setup();w.ball.x=w.player.x+15;w.ball.y=w.player.y;w.step(C.step,{x:1,y:0,sprint});return w.ball.vx;};
  expect(kick(false)).toBeGreaterThan(400);expect(kick(true)).toBeGreaterThan(kick(false));
  const w=setup();w.ball.x=w.player.x;w.ball.y=w.player.y;w.step(C.step,idle);expect(w.ball.vx).toBe(0);
 });
 it('slows, bounces and resets the ball',()=>{
  const w=setup();w.ball.x=C.pitch.right-C.ballRadius-1;w.ball.vx=420;w.step(C.step,idle);
  expect(w.ball.vx).toBeLessThan(0);expect(Math.abs(w.ball.vx)).toBeLessThan(420);expect(w.ball.x).toBeLessThanOrEqual(C.pitch.right-C.ballRadius);
  const speed=Math.abs(w.ball.vx);w.step(C.step,idle);expect(Math.abs(w.ball.vx)).toBeLessThan(speed);
  w.reset();expect(w.ball).toEqual({x:600,y:400,vx:0,vy:0});expect(w.ballHits.size).toBe(0);
 });
 it('uses swept collision, cheers once, and prevents capture for three simulation seconds',()=>{
  const w=setup();w.time=4;const s=w.stewards[0];s.x=500;s.y=300;s.warning=0;w.player.x=500;w.player.y=300;
  w.ball={x:470,y:300,vx:6000,vy:0};const events:string[]=[];w.onEvent=e=>events.push(e);w.step(C.step,idle);
  expect(s.down).toBe(C.stewardDown);expect(w.captured).toBe(false);expect(events.filter(e=>e==='cheer')).toHaveLength(1);
  w.ball.vx=w.ball.vy=0;w.running=false;w.step(1,idle);expect(s.down).toBe(3);
  w.running=true;for(let i=0;i<179;i++)w.step(C.step,idle);expect(s.down).toBeGreaterThan(0);expect(w.captured).toBe(false);
  w.step(C.step,idle);expect(s.down).toBeCloseTo(0);expect(w.captured).toBe(false);
  for(let i=0;i<30;i++)w.step(C.step,idle);expect(s.recover).toBe(0);expect(w.captured).toBe(true);
 });
 it('cannot knock down the same steward twice per kick',()=>{
  const w=setup();const s=w.stewards[0];s.x=500;s.y=300;w.ball={x:490,y:300,vx:420,vy:0};w.step(C.step,idle);expect(s.down).toBe(3);
  s.down=0;s.recover=0;w.ball={x:490,y:300,vx:420,vy:0};w.step(C.step,idle);expect(s.down).toBe(0);
 });
 it('emits an arrival only when another steward enters during a run',()=>{
  const w=setup();const events:string[]=[];w.onEvent=e=>events.push(e);w.reset();expect(events).toEqual([]);
  w.time=C.headStart+C.spawnEvery;w.step(C.step,idle);expect(w.stewards).toHaveLength(3);expect(events.filter(e=>e==='arrival')).toHaveLength(1);
 });
 it('plays impacts on fresh contact with each player despite the shared damage cooldown',()=>{
  const w=setup();const a={...w.player,kind:'blue' as const,id:3},b={...w.player,kind:'coral' as const,id:4};w.obstacles=[a];const events:string[]=[];w.onEvent=e=>events.push(e);w.step(C.step,idle);
  b.x=b.homeX=w.player.x;b.y=b.homeY=w.player.y;w.obstacles=[b];w.step(C.step,idle);expect(events.filter(e=>e==='bump')).toHaveLength(2);
 });
});
