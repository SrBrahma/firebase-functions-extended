/* eslint-disable @typescript-eslint/ban-types */
import * as functions from 'firebase-functions';
// For multi-line JSON error https://github.com/firebase/firebase-functions/issues/612#issuecomment-648384797
import * as Logger from 'firebase-functions/lib/logger';
import * as z from 'zod';
import { ErrorDictItem, errorMessageInLanguage, fallbackLanguage } from './i18n/i18n';
import { Caller } from './Caller';
import { commonErrorMessages } from './commonErrorMessages';
import type { HandlerF, Joiner } from './types';
import { isObject } from './utils';



type onCallRtn = ReturnType<typeof functions.https.onCall>;




export function parseExtError({ errorMessage, errorCode, data, caller }: {
  errorMessage: string; // | ExtError
  errorCode: functions.https.FunctionsErrorCode;
  data: any;
  caller: Caller;
}): functions.https.HttpsError {
  // We use this Logger because at the current moment,
  // Cloud Functions doesn't allow multi-line errors without this.
  // https://github.com/firebase/firebase-functions/issues/612#issuecomment-648384797
  // _callerToken with _ to keep it on the end of the json for better readibility on firebase console
  Logger.error(new Error(JSON.stringify({
    errorCode, data, errorMessage, _callerToken: caller.token,
  }, null, 2))); // Make the JSON pretty with 2-space-identation and new lines

  return new functions.https.HttpsError(errorCode, errorMessage);
}


let defaultRegion: string | string[];
let defaultAllowAnonymous: boolean;
let defaultAllowNonAuthed: boolean;
const defaultClientVersion = '0.0.0';


/**
 * Set the default values for all extCalls(). They can still be individually customized.
 *
 * Should be called before defining your extCalls, if you want to change any default.
 */
export function setExtCallDefaults({
  /** The default region to deploy this function.
  *
  * If your function uses Realtime Database, use/keep the default 'us-central1' region, as both servers
  * will be closer and the function execution will be faster.
  *
  * You may also pass an array of regions, so they will be deployed to all of them.
  *
  * https://firebase.google.com/docs/functions/locations#best_practices_for_changing_region
  * @param region - default is `'us-central1'` */
  region = 'us-central1',

  /** If anonymous authed users can execute the functions.
   *
   * Defaults to `true`. */
  allowAnonymous = true
  ,
  /** If non authed callers can execute the function.
   *
   * Defaults to `false`. */
  allowNonAuthed = false,
} = {}): void {
  defaultRegion = region;
  defaultAllowAnonymous = allowAnonymous;
  defaultAllowNonAuthed = allowNonAuthed;
}

setExtCallDefaults();


export type ExtOptions = {
  language?: string;
  /** Defaults to `'0.0.0'`, so you can have a SemVar check in your function, even if your
   * client hasn't set a clientVersion before. */
  clientVersion?: string;
};
type ExtOptionsShort = {
  /** Same as `language` property, shorter version. */
  l?: string;
  /** Same as `clientVersion` property, shorter version. */
  cV?: string;
};
export type ExtDataProps = {
  data?: unknown;
  /** Same as `data` property, shorter version. */
  d?: unknown;
} & ExtOptions & ExtOptionsShort;

// TODO: Optional zodObj. Won't use now, so leaving it for later
// TODO: Take the language from data (if there is) and pass it to the caller
/** The main function of this package.
 *
 * Validates the client data using the zod schema,
 *
 * (will later write this.) */
export function extCall<
A extends HandlerF<z.infer<Z>, {}>, // {} = No previous auxData
B extends Joiner<Z, A>,
C extends Joiner<Z, A, B>,
D extends Joiner<Z, A, B, C>,
E extends Joiner<Z, A, B, C, D>,
F extends Joiner<Z, A, B, C, D, E>,
G extends Joiner<Z, A, B, C, D, E, F>,
H extends Joiner<Z, A, B, C, D, E, F, G>,
I extends Joiner<Z, A, B, C, D, E, F, G, H>,
Handler extends Joiner<Z, A, B, C, D, E, F, G, H, I, any>,
Z extends z.ZodType<any> = z.ZodUndefined,
>({
  zod = z.undefined() as any, // as any needed to remove init error
  aux, handler,
  allowAnonymous = defaultAllowAnonymous,
  allowNonAuthed = defaultAllowNonAuthed,
  region = defaultRegion,
}: {
  zod?: Z;
  /** An array of auxiliary functions that will be run after the zod validation and before the handler function.
   *
   * Useful for reusing commom checks. To deny the call, use "throw ExtError(...)",
   * like you would do with the handler function.
   *
   * If it returns an object, its properties will be available for the next aux functions
   * and also for the handler function via the auxData property.
  */
  aux?: [A?, B?, C?, D?, E?, F?, G?, H?, I?];

  /** Your main function that will be run after the zod validation and after the aux functions execution, if any. */
  handler: Handler;

  /** If anonymous authed users can execute the functions.  Throws error if false and caller is anonymous.
   *
   * Defaults to `true` or the value set in setExtCallDefaults(). */
  allowAnonymous?: boolean;

  /** If non authed callers can execute the function. Throws error if false and caller isn't authed.
   *
   * Defaults to `false` or the value set in setExtCallDefaults(). */
  allowNonAuthed?: boolean;

  /** The region that this function will be deployed. (Read the link below to learn about and get the valid values)
   *
   * You may also pass an array of regions, so this function will be deployed to all of them.
   *
   * If your function uses Realtime Database, use/keep the default 'us-central1' region, as both servers
   * will be closer and the function execution will be faster.
   *
   * https://firebase.google.com/docs/functions/locations#best_practices_for_changing_region */
  region?: string | string[];

}): onCallRtn & {
  /** Note that this actually doesn't exists as data, it is only a type designed to type safe your client calls. */
  _argsType: z.infer<Z>;
  _rtnType: ReturnType<Handler>;
} {

  let func;

  if (Array.isArray(region))
    func = functions.region(...region); // Couldn't do a ternary while destructuring the variadic
  else
    func = functions.region(region);

  // clientVersion is useful to tell the client to update his app.

  const rtn = func.https.onCall(async (params: ExtDataProps | undefined, context) => {

    if (!params)
      params = {};

    const data = params?.d ?? params.data;
    const clientVersion = params.cV ?? params.clientVersion ?? defaultClientVersion;
    const language = params.l ?? params.language ?? fallbackLanguage;
    const schema = zod ?? z.unknown();


    /** If we called the error or the error was not expected / = uncaught */
    let calledError = false;

    const caller = new Caller({ context, clientVersion: clientVersion, language });


    /** Logs the error (with infos about the caller) and returns the error message to the client,
     * being it translated if available. If errorCode isn't specified, defaults to 'internal'. */
    function ExtError(errorMessage: ErrorDictItem): functions.https.HttpsError;
    function ExtError(errorMessage: string, errorCode?: functions.https.FunctionsErrorCode): functions.https.HttpsError;
    function ExtError(
      errorMessage: string | ErrorDictItem,
      errorCode?: functions.https.FunctionsErrorCode,
    ): functions.https.HttpsError {

      calledError = true;

      if (typeof errorMessage === 'string')
        return parseExtError({
          caller, data,
          errorMessage,
          errorCode: errorCode ?? 'internal',
        });

      else
        return parseExtError({
          caller, data,
          errorMessage: errorMessageInLanguage(errorMessage, language),
          errorCode: errorMessage._code ?? 'internal',
        });

    }

    try {
      if (!allowNonAuthed && !caller.isAuthed)
        // TODO: better error differentiation between those two?
        throw ExtError(commonErrorMessages.authRequired);

      if (!allowAnonymous && caller.isAnonymous)
        throw ExtError(commonErrorMessages.cantBeAnon);

      // TODO: add support for zod invalid schema message
      const schemaResult = schema.safeParse(data);
      if (!schemaResult.success) {
        // https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md
        const message = Object.entries(schemaResult.error.flatten().fieldErrors).map(([field, errors]) => `${field} - ${errors.join('.')}`).join(('\r\n'));
        throw ExtError(`${errorMessageInLanguage(commonErrorMessages.invalidArgs, language)}\n\n${message}`, 'invalid-argument');
      }

      // throw is not needed in InternalExtErrors below, as the ExtError are suposed to be called with throw.
      const auxData: any = {};

      if (aux)
        for (const auxItem of aux) {
          const rtn = await auxItem?.({ data, caller, ExtError, auxData });
          if (isObject(rtn))
            Object.assign(auxData, rtn);
        }

      return await handler?.({ data, caller, ExtError, auxData });
    } catch (err) {
      if (!calledError) {
        Logger.error(err);
        /** This will change calledError to true, but we already checked/used it. No problem. */
        throw ExtError(commonErrorMessages.unknown);
      } else // Rethrows the error, that has already been parseExtError'ed.
        throw err;
    }
  });

  return rtn as any;
}