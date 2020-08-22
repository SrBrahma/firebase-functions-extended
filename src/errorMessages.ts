// Still unused / unfinished. Will do it as soon as I need it

// idea:
// const Errors = {
//   CallerIsNotStoreUser: ExtError({
//     en: 'The user is not member of the store',
//     ptbr: 'O usuário não é membro da loja'
//   }), ...
// }

import { https } from 'firebase-functions';


enum Languages {
  en = 'en',
  ptbr = 'ptbr',
}


let fallbackLanguage: Languages = Languages.en;


/**
 * If the requested language isn't available, will return the error in this defined language.
 *
 * @export
 * @param {Languages} language defaults to en
 */
export function setFallbackLanguage(language: Languages = Languages.en) {
  fallbackLanguage = language;
}


type errorInLanguages = {
  [K in Languages]?: string
};



function errorMessageInLanguage(errorMessages: errorInLanguages, errorCode: https.FunctionsErrorCode,
  language: Languages): string {

  let error = errorMessages[language];

  // Fallback to default language
  if (!error)
    error = errorMessages[fallbackLanguage];

  // Fallback to error code
  if (!error)
    error = errorCode;

  return error;
}


export interface ExtError {
  errorMessages: errorInLanguages;
  errorCode: https.FunctionsErrorCode;
  getMessageInLanguage: (language: Languages) => string;
}

// Maybe make it a function, so new isn't needed?
export function ExtError(errorMessages: errorInLanguages, errorCode: https.FunctionsErrorCode): ExtError {
  return ({
    errorCode,
    errorMessages,
    getMessageInLanguage: (language: Languages) => errorMessageInLanguage(errorMessages, errorCode, language)
  });
}