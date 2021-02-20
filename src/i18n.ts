import type { https } from 'firebase-functions';



export type ErrorMessagePerLanguage<Lang extends string = string> = Record<Lang, string>

export type ErrorsMessagesDict<
  ErrorId extends string = string,
  Lang extends string = string
> = Record<ErrorId, ErrorMessagePerLanguage<Lang>>



const defaultLanguage = 'en';


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


export function errorMessageInLanguage({
  errorMessage, errorCode, language
}: {
  errorMessage: string | ErrorMessagePerLanguage,
  errorCode: https.FunctionsErrorCode,
  language: string
}): string {
  return typeof errorMessage === 'string'
    ? errorMessage
    : (
      errorMessage[language]
      ?? errorMessage[fallbackLanguage] // Fallback to fallback language
      ?? errorMessage[defaultLanguage]  // Fallback to default language ('en')
      ?? Object.values(errorMessage)[0] // Fallback to the first available language
      ?? errorCode // Fallback to error code
    );
}