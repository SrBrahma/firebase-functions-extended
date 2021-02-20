import { ErrorsMessagesDict } from './i18n';
import { Id } from './utils';


export enum CommonErrorsId {
  /** Caller not authed (not anon, not google etc) */
  authRequired = 'authRequired',
  /** Caller is anon and function dont allow anon caller */
  cantBeAnon = 'cantBeAnon',
  /** Caller arguments doesn't fit your zod schema */
  invalidArgs = 'invalidArgs',
  /** An error was throw inside your extCall function but you didn't created it with new ExtError,
   * so it's an unintended / uncaught error */
  unknown = 'unknown'
}

// Unused until ./i18n/[*1] fix
// export type CommonErrorsDefaultLanguages = 'en' | 'pt'

// TODO add a package identification to those errors, but still user friendly.
/** The default error messages for ExtCall common errors, like caller not authed,
 * caller is anon, invalid arguments (zod didn't accept it) or unexpected error / not caught.
 *
 * If you want to provide your own messages for them and or want to include other languages besides
 * the current `en` and `pt`, call
 */
export const defaultCommonErrorMessagesDict: Id<ErrorsMessagesDict<CommonErrorsId>> = {
  authRequired: {
    _code: 'unauthenticated',
    en: 'You must be logged in to perform this action.',
    pt: 'Você precisa estar logado para executar esta ação.',
  },
  cantBeAnon: {
    _code: 'unauthenticated',
    en: 'You must be properly logged in to perform this action.',
    pt: 'Você precisa estar devidamente logado para executar esta ação.',
  },
  invalidArgs: {
    _code: 'invalid-argument',
    en: 'Invalid arguments.',
    pt: 'Argumentos inválidos.',
  },
  unknown: {
    _code: 'internal',
    en: 'An error occurred in the server, try again.',
    pt: 'Ocorreu um erro no servidor, tente novamente.',
  }
};

export let commonErrorMessages = defaultCommonErrorMessagesDict;


/** If you want to provide your own messages for common errors like invalid arguments,
 * user not authed etc and/or want to include other languages besides
 * the current `en` and `pt`, call this function with your own dictionary before everything.
 *
 * @default - the default dictionary. No need to call this function to set it if not changed. */
export function setCommonErrorMessagesDict(
  dict: ErrorsMessagesDict<CommonErrorsId> = defaultCommonErrorMessagesDict
): void {
  commonErrorMessages = dict;
}