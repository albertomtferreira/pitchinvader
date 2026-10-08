import en from './locales/en-GB';
import pt from './locales/pt-PT';
import es from './locales/es-ES';
import fr from './locales/fr-FR';
import it from './locales/it-IT';
import {loadText, saveText} from './storage';
export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
export const languages = {'en-GB':'English (UK)', 'pt-PT':'Português (Portugal)', 'es-ES':'Español (España)', 'fr-FR':'Français', 'it-IT':'Italiano'} as const;
export type Locale = keyof typeof languages;
const dictionaries: Record<Locale, Messages> = {'en-GB':en,'pt-PT':pt,'es-ES':es,'fr-FR':fr,'it-IT':it};
export function resolveLocale(preferences: readonly string[]): Locale {
  for (const preference of preferences) {
    const match = (Object.keys(languages) as Locale[]).find(locale => locale.toLowerCase() === preference.toLowerCase() || locale.split('-')[0] === preference.toLowerCase().split('-')[0]);
    if (match) return match;
  }
  return 'en-GB';
}
let locale: Locale = 'en-GB';
let number = new Intl.NumberFormat(locale, {minimumFractionDigits:1,maximumFractionDigits:1});
let plural = new Intl.PluralRules(locale);
export function initialiseLocale() { setLocale(resolveLocale([loadText('pi-language',''), ...navigator.languages]), false); }
export function getLocale() { return locale; }
export function setLocale(next: Locale, persist = true) {
  locale = next;
  number = new Intl.NumberFormat(locale, {minimumFractionDigits:1,maximumFractionDigits:1});
  plural = new Intl.PluralRules(locale);
  if (persist) saveText('pi-language', locale);
}
export function t(key: MessageKey, params: Record<string,string|number> = {}) {
  return (dictionaries[locale][key] ?? en[key]).replace(/\{(\w+)\}/g, (token, name: string) => String(params[name] ?? token));
}
export function formatTime(seconds: number) { return `${number.format(seconds)} s`; }
export function formatNearMisses(count: number) {
  return t(plural.select(count) === 'one' ? 'nearMissOne' : 'nearMissOther', {count:new Intl.NumberFormat(locale).format(count)});
}
export function translateDocument() {
  document.documentElement.lang = locale;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(node => {node.textContent = t(node.dataset.i18n as MessageKey);});
  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach(node => {node.setAttribute('aria-label', t(node.dataset.i18nAria as MessageKey));});
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('description'));
}
