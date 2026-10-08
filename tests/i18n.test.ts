import {describe,it,expect,afterEach} from 'vitest';
import {resolveLocale,setLocale,t,formatTime,formatNearMisses,languages} from '../src/i18n';
import en from '../src/locales/en-GB';
import pt from '../src/locales/pt-PT';
import es from '../src/locales/es-ES';
import fr from '../src/locales/fr-FR';
import itLocale from '../src/locales/it-IT';
afterEach(()=>setLocale('en-GB',false));
describe('localisation',()=>{
  it('matches regional preferences and falls back to UK English',()=>{
    expect(resolveLocale(['de-DE','pt-BR'])).toBe('pt-PT');
    expect(resolveLocale(['ES-es'])).toBe('es-ES');
    expect(resolveLocale(['ja-JP'])).toBe('en-GB');
  });
  it('has complete dictionaries with matching interpolation parameters',()=>{
    for(const dictionary of [pt,es,fr,itLocale]){
      expect(Object.keys(dictionary).sort()).toEqual(Object.keys(en).sort());
      for(const key of Object.keys(en) as (keyof typeof en)[]){
        expect(dictionary[key].match(/\{\w+\}/g)?.sort()).toEqual(en[key].match(/\{\w+\}/g)?.sort());
        expect(dictionary[key]).not.toContain('?');
        expect(dictionary[key]).not.toContain('\uFFFD');
      }
    }
  });
  it('formats decimal scores and pluralised results',()=>{
    setLocale('en-GB',false);expect(formatTime(12.34)).toBe('12.3 s');
    expect(formatNearMisses(1)).toBe('1 near miss');expect(formatNearMisses(0)).toBe('0 near misses');
    setLocale('pt-PT',false);expect(formatTime(12.34)).toBe('12,3 s');expect(formatNearMisses(2)).toBe('2 fugas por um triz');
    setLocale('fr-FR',false);expect(formatNearMisses(1)).toBe('1 échappée de justesse');
  });
  it('interpolates all languages and works when storage is unavailable',()=>{
    for(const locale of Object.keys(languages) as (keyof typeof languages)[]){
      setLocale(locale);expect(t('headStart',{seconds:3})).toContain('3');
      expect(t('result',{best:formatTime(10),near:formatNearMisses(2)})).not.toContain('{');
    }
  });
});
