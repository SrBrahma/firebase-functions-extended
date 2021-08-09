import type { https } from 'firebase-functions';

export type ErrorMessagePerLanguage<Lang extends string = string> = Record<Lang, string>;

// FIXME Not accepting generic Langs, error in ExtCall.ts. optional _code causes this. [*1]
export type ErrorDictItem = {
  _code?: https.FunctionsErrorCode;
} & Record<string, string>;

export type ErrorsMessagesDict<
  ErrorIds extends string = string,
> = {
  [Error in ErrorIds]: ErrorDictItem
};

export function createErrorsDict<T extends ErrorsMessagesDict>(dict: T): T {
  return dict;
}

/** The default language for fallbackLanguage and when caller doesn't specify a language. */
export const defaultLanguage = 'en';

/** The language that errorMessageInLanguage uses if the requested one isn't available.
 * You may change it with setFallbackLanguage. */
export let fallbackLanguage: string = defaultLanguage;


/**
 * If the requested language isn't available, and an error is throw, will return
 * the error in this defined language. The default is 'en' without calling this function.
 *
 * This will also set the default language for callers that don't have sent the language in data.
 *
 * @export
 * @param {Languages} language defaults to 'en'
 */
export function setFallbackLanguage(language: string = defaultLanguage): void {
  fallbackLanguage = language;
}

export function errorMessageInLanguage(
  errorDictItem: ErrorDictItem,
  language: string,
): string {
  return errorDictItem[language]
    ?? errorDictItem[fallbackLanguage] // Fallback to fallback language
    ?? errorDictItem[defaultLanguage] // Fallback to default language ('en')
    ?? Object.entries(errorDictItem) // Fallback to any available language
      .find(([k]) => k !== '_code')?.[1] // [1] is entry value
    ?? errorDictItem._code // Fallback to error code
    ?? 'Error without message'; // Just to avoid huge fuck ups
}