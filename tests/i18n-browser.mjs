import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const labels={'en-GB':'INVADE THE PITCH','pt-PT':'INVADIR O CAMPO','es-ES':'INVADIR EL CAMPO','fr-FR':'ENVAHIR LE TERRAIN','it-IT':'INVADI IL CAMPO'};
try{
  const context=await browser.newContext({locale:'pt-PT',viewport:{width:844,height:390}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5173');await page.waitForSelector('canvas');
  assert.equal(await page.locator('html').getAttribute('lang'),'pt-PT');
  for(const [locale,label] of Object.entries(labels)){
    await page.selectOption('#language',locale);
    assert.equal(await page.locator('html').getAttribute('lang'),locale);
    assert.equal((await page.locator('#play').innerText()).replace(/\s+/g,' ').trim(),`${label} →`);
    await page.reload();await page.waitForSelector('canvas');
    assert.equal(await page.locator('#language').inputValue(),locale);
    await page.click('#install');assert((await page.locator('#install-help').innerText()).length>20);await page.click('#help-close');
    await page.click('#play');assert((await page.locator('#notice').innerText()).includes('3'));
    await page.evaluate(()=>window.__game.pause());
    const time=await page.evaluate(()=>window.__game.world.time);
    // Exercise rerendering of existing state, even though the selector is in the menu.
    await page.locator('#language').evaluate((select)=>{select.value='fr-FR';select.dispatchEvent(new Event('change'));});
    assert.equal(await page.evaluate(()=>window.__game.world.time),time);
    assert.equal(await page.locator('#resume').innerText(),'REPRENDRE →');
    await page.locator('#language').evaluate((select,locale)=>{select.value=locale;select.dispatchEvent(new Event('change'));},locale);
    await page.evaluate(()=>{const w=window.__game.world;w.time=12.3;w.near=2;w.onEvent('capture');});
    assert((await page.locator('#result-detail').innerText()).includes('2'));
    assert((await page.locator('#score').innerText()).includes(locale==='en-GB'?'12.3':'12,3'));
    await page.click('#results .home');
    await page.screenshot({path:`test-results/i18n-${locale}.png`});
    assert(await page.locator('#menu .card').evaluate(card=>card.scrollWidth<=card.clientWidth));
  }
  assert.deepEqual(errors,[]);await context.close();
  const restricted=await browser.newContext({locale:'it-IT'});
  await restricted.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});
  const rp=await restricted.newPage();await rp.goto('http://localhost:5173');await rp.waitForSelector('canvas');await rp.selectOption('#language','es-ES');await rp.click('#play');await restricted.close();
  const offline=await browser.newContext();const op=await offline.newPage();await op.goto('http://localhost:4173');
  await op.waitForFunction(()=>document.querySelector('#footer-status').dataset.status==='offline');
  await op.reload();await op.waitForSelector('canvas');await offline.setOffline(true);await op.reload();await op.waitForSelector('canvas');
  for(const [locale,label] of Object.entries(labels)){await op.selectOption('#language',locale);assert((await op.locator('#play').innerText()).includes(label));}
  await op.click('#play');await offline.close();
  console.log('PASS: five languages, detection, persistence, dynamic state, restricted storage, mobile layout and offline switching.');
}finally{await browser.close();}

