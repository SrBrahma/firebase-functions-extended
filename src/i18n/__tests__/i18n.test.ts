import {
  errorMessageInLanguage, ErrorDictItem, fallbackLanguage,
  defaultLanguage, setFallbackLanguage
} from '../i18n';

const defaultErrorDictItem: ErrorDictItem = {
  _code: 'unavailable',
  [fallbackLanguage]: 'fallback',
  lang1: 'Lang1',
  lang2: 'Lang2'
};

describe('i18n', () => {
  test('lang1', () => {
    expect(errorMessageInLanguage(defaultErrorDictItem, 'lang1')).toBe(defaultErrorDictItem['lang1']);
  });
  test('lang2', () => {
    expect(errorMessageInLanguage(defaultErrorDictItem, 'lang2')).toBe(defaultErrorDictItem['lang2']);
  });
  test('fallback fallbackLang', () => {
    expect(errorMessageInLanguage(defaultErrorDictItem, 'invalidLang')).toBe(defaultErrorDictItem[fallbackLanguage]);
  });
  test('fallback default', () => {
    const errorDictItem: ErrorDictItem = {
      _code: 'aborted',
      [defaultLanguage]: 'default',
      Lang1: 'Lang1'
    };
    setFallbackLanguage('invalidLang1');
    expect(errorMessageInLanguage(errorDictItem, 'invalidLang2')).toBe(errorDictItem[defaultLanguage]);
    setFallbackLanguage(); // reset
  });
  test('fallback to any lang', () => {
    const errorDictItem: ErrorDictItem = {
      _code: 'aborted',
      Lang1: 'Lang1'
    };
    expect(errorMessageInLanguage(errorDictItem, 'invalidLang')).toBe(errorDictItem['Lang1']);
  });
  test('fallback to _code', () => {
    const errorDictItem: ErrorDictItem = {
      _code: 'aborted',
    };
    expect(errorMessageInLanguage(errorDictItem, 'invalidLang')).toBe(errorDictItem['_code']);
  });
  test('change fallback lang', () => {
    const errorDictItem: ErrorDictItem = {
      _code: 'aborted',
      [fallbackLanguage]: 'default',
      newFallbackLang: 'new'
    };
    expect(errorMessageInLanguage(errorDictItem, fallbackLanguage)).toBe(errorDictItem[fallbackLanguage]);
    setFallbackLanguage('newFallbackLang');
    expect(errorMessageInLanguage(errorDictItem, 'newFallbackLang')).toBe(errorDictItem['newFallbackLang']);
    setFallbackLanguage(); // reset
  });
  test('final fallback', () => {
    expect(errorMessageInLanguage({} as any, fallbackLanguage)).toBe('Error without message'); // as defined in i18n
  });
});