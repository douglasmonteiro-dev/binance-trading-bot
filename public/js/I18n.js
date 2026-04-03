/* eslint-disable no-undef */
/**
 * Lightweight i18n system for the Binance Trading Bot frontend.
 *
 * Usage:
 *   t('key')                        -> translated string
 *   t('key', { name: 'BTC' })       -> interpolation: "Hello {name}" -> "Hello BTC"
 *
 * Language is stored in localStorage('lang').
 * Default language: pt-BR
 */
(function () {
  var SUPPORTED_LANGS = ['pt-BR', 'en', 'es', 'fr'];
  var DEFAULT_LANG = 'pt-BR';
  var translations = {};
  var currentLang = localStorage.getItem('lang') || DEFAULT_LANG;

  function loadTranslations(lang, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/data/i18n/' + lang + '.json', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            translations[lang] = JSON.parse(xhr.responseText);
          } catch (e) {
            console.error('I18n: Failed to parse ' + lang + '.json', e);
            translations[lang] = {};
          }
        } else {
          console.error('I18n: Failed to load ' + lang + '.json', xhr.status);
          translations[lang] = {};
        }
        if (callback) callback();
      }
    };
    xhr.send();
  }

  function t(key, params) {
    var dict = translations[currentLang] || {};
    var str = dict[key];
    if (str === undefined) {
      // Fallback to English, then to key
      var enDict = translations['en'] || {};
      str = enDict[key];
      if (str === undefined) {
        return key;
      }
    }
    if (params) {
      Object.keys(params).forEach(function (k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return str;
  }

  function setLanguage(lang, callback) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) {
      console.warn('I18n: Unsupported language ' + lang);
      return;
    }
    currentLang = lang;
    localStorage.setItem('lang', lang);
    if (!translations[lang]) {
      loadTranslations(lang, callback);
    } else if (callback) {
      callback();
    }
  }

  function getLanguage() {
    return currentLang;
  }

  function getSupportedLanguages() {
    return SUPPORTED_LANGS.slice();
  }

  function getLanguageLabel(lang) {
    var labels = {
      'pt-BR': 'Português',
      en: 'English',
      es: 'Español',
      fr: 'Français'
    };
    return labels[lang] || lang;
  }

  function init(callback) {
    // Load current language + English fallback in parallel
    var loaded = 0;
    var total = currentLang === 'en' ? 1 : 2;

    function onLoaded() {
      loaded++;
      if (loaded >= total && callback) callback();
    }

    loadTranslations(currentLang, onLoaded);
    if (currentLang !== 'en') {
      loadTranslations('en', onLoaded);
    }
  }

  // Expose globally
  window.I18n = {
    init: init,
    t: t,
    setLanguage: setLanguage,
    getLanguage: getLanguage,
    getSupportedLanguages: getSupportedLanguages,
    getLanguageLabel: getLanguageLabel
  };
  window.t = t;
})();
