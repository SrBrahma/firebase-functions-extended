import * as functions from 'firebase-functions';
import { Caller } from './caller';
import * as zod from 'zod';
import { ZodRawShape } from 'zod/lib/src/types/base';

// For multi-line JSON error https://github.com/firebase/firebase-functions/issues/612#issuecomment-648384797
import { debug, info, error, warn } from 'firebase-functions/lib/logger';



// https://firebase.google.com/docs/functions/locations#best_practices_for_changing_region
// Default Firebase value. It's the best for Realtime Database, as it always uses us-central1
const constDefaultRegion = 'us-central1';
let defaultRegion = constDefaultRegion;

type onCallRtn = ReturnType<typeof functions.https.onCall>;


/**
 * Should be called before defining your extCalls.
 *
 * You can also specify a region for a specific function by using the
 * `region` property in the extCall argument.
 *
 * Read https://firebase.google.com/docs/functions/locations#best_practices_for_changing_region
 * @param regionId - default is `'us-central1'`
 */
export function setExtCallDefaultRegion(regionId: string = constDefaultRegion): void { defaultRegion = regionId; }


/** ONLY adds 'caller' var and uses the set region. Maybe you will want to use it.  */
export function onCallWithCaller(handler: (data: any, caller: Caller) => any | Promise<any>): onCallRtn {
  // Changing region. Used it only here and not directly on functions on ./firebase.ts,
  // Because this doc says background functions with Realtime DB as Trigger should use
  // the default region ('use-central1').
  // https://firebase.google.com/docs/functions/locations#best_practices_for_changing_region
  return functions.region(defaultRegion).https.onCall((data, context) =>
    handler(data, new Caller(context)));
}


// throwError code is optional. Does anyone even uses it?
type Handler<T extends ZodRawShape> = {
  data: zod.infer<zod.ZodObject<T>>,
  caller: Caller;
  ExtError: (message: string, code?: functions.https.FunctionsErrorCode) => any;
};



type ExtCall<T extends ZodRawShape> = {
  zodObj: T,
  handler: (args: Handler<T>) => any | Promise<any>,
  /** Throws error if false and if caller is anonymous */
  allowAnonymous?: true;
  /** You can specify a region diferent of the default one (`us-central1` or the one set by `setExtCallDefaultRegion()`) */
  region?: string;
};



// TODO: add obj to message type, to allow languages given by the caller.
function InternalExtError(
  message: string, // | ExtError
  code: functions.https.FunctionsErrorCode,
  data: any,
  caller: Caller
) {
  // _callerToken with _ to keep it on the end of the json for better readibility on firebase console
  error(new Error(JSON.stringify(
    { code, data, message, _callerToken: caller.token },
    null, 2 // Make the JSON pretty with 2-space-identation and new lines
  )));
  return new functions.https.HttpsError(code, message);
}


// TODO: Optional zodObj. Won't use now, so leaving it for later
// TODO: Take the language from data (if there is) and pass it to the caller
export function extCall<T extends ZodRawShape>({ zodObj, handler, allowAnonymous, region }: ExtCall<T>): onCallRtn {

  return functions.region(region || defaultRegion).https.onCall(async (data, context) => {
    // TODO: wrapping try/catch
    const schema = zod.object(zodObj);
    const caller = new Caller(context);

    if (!allowAnonymous && caller.isAnonymous)
      throw InternalExtError('Usuário não pode ser anônimo.', 'unauthenticated', data, caller);


    // TODO: add support for zod invalid schema message
    if (schema.check(data)) {
      await handler({
        data,
        caller,
        ExtError: (message, code = 'internal') => InternalExtError(message, code, data, caller)
      });
    }
    else
      throw InternalExtError('Argumentos inválidos', 'invalid-argument', data, caller);
  });
}