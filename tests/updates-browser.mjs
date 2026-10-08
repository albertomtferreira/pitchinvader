import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
try{
 const context=await browser.newContext({viewport:{width:844,height:390}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173');await page.waitForSelector('canvas');
 for(const size of [{width:844,height:390},{width:568,height:320},{width:667,height:375},{width:1200,height:800}]){
  await page.setViewportSize(size);
  for(const locale of ['en-GB','pt-PT','es-ES','fr-FR','it-IT']){
   await page.selectOption('#language',locale);
   assert(await page.locator('#menu .card').evaluate(card=>card.scrollHeight<=card.clientHeight&&card.scrollWidth<=card.clientWidth));
   const b=await page.locator('#menu .card').boundingBox();assert(b.y>=0&&b.y+b.height<=size.height);
  }
 }
 await page.setViewportSize({width:844,height:390});await page.selectOption('#language','en-GB');await page.screenshot({path:'test-results/mobile-menu.png'});
 await page.click('#play');await page.waitForTimeout(200);
 assert.equal(await page.evaluate(()=>window.__game.sound.ctx.state),'running');
 assert(await page.evaluate(()=>!!window.__game.sound.bed));
 // Measure output rather than merely confirming an AudioContext exists.
 await page.evaluate(()=>{const s=window.__game.sound;window.audioMeter=s.ctx.createAnalyser();s.master.connect(window.audioMeter);});
 await page.waitForTimeout(200);assert(await page.evaluate(()=>{const data=new Float32Array(window.audioMeter.fftSize);window.audioMeter.getFloatTimeDomainData(data);return data.some(v=>Math.abs(v)>.0001);}));
 const arena=await page.locator('#arena').boundingBox();assert.equal(arena.height,390);
 for(const selector of ['#joystick','#sprint']){const b=await page.locator(selector).boundingBox();assert(b.x>=arena.x&&b.y>=arena.y&&b.x+b.width<=arena.x+arena.width&&b.y+b.height<=arena.y+arena.height);}
 await page.evaluate(()=>{const w=window.__game.world;w.obstacles=[];w.time=4;w.player.x=590;w.player.y=330;w.ball={x:605,y:330,vx:0,vy:0};w.stewards[0].x=650;w.stewards[0].y=330;w.stewards[0].warning=0;w.stewards[1].warning=100;});
 await page.keyboard.down('d');await page.waitForFunction(()=>window.__game.world.stewards[0].down>0);await page.keyboard.up('d');await page.screenshot({path:'test-results/mobile-knockdown.png'});
 await page.evaluate(()=>window.__game.pause());const down=await page.evaluate(()=>window.__game.world.stewards[0].down);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.__game.world.stewards[0].down),down);assert.equal(await page.evaluate(()=>window.__game.sound.bed),null);
 await page.click('#resume');await page.waitForTimeout(100);assert(await page.evaluate(()=>!!window.__game.sound.bed));
 await page.evaluate(()=>window.__game.pause());await page.click('#paused .home');await page.click('#sound');await page.click('#play');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>window.__game.sound.bed),null);
 await page.evaluate(()=>window.__game.pause());await page.click('#paused .home');await page.click('#help');await page.keyboard.press('Escape');assert.equal(await page.locator('#help-panel').isVisible(),false);
 assert.deepEqual(errors,[]);console.log('PASS: multilingual menus fit 320px landscape, full-height arena, overlaid controls, audible audio signal, knockdown rendering, paused timers/audio, mute and Help.');
 await context.close();
}finally{await browser.close();}
