import * as functions from 'firebase-functions';
import { Caller } from './caller';
import * as zod from 'zod';
import { ZodRawShape } from 'zod/lib/src/types/base';


// Changing region. Used it only here and not directly on functions on ./firebase.ts,
// Because this doc says background functions with Realtime DB as Trigger should use
// the default region ('use-central1').
// https://firebase.google.com/docs/functions/locations#best_practices_for_changing_region
let region = 'southamerica-east1';


// Should be called before defining your extCalls.
export function setExtCallDefaultRegion(regionId: string) { region = regionId; }


// ONLY adds 'caller' var and uses the set region. Maybe you will want to use it.
export function onCallWithCaller(handler: (data: any, caller: Caller) => any | Promise<any>) {
  // Changing region. Used it only here and not directly on functions on ./firebase.ts,
  // Because this doc says background functions with Realtime DB as Trigger should use
  // the default region ('use-central1').
  // https://firebase.google.com/docs/functions/locations#best_practices_for_changing_region
  return functions.region(region).https.onCall((data, context) =>
    handler(data, new Caller(context)));
}


// throwError code is optional. Does anyone even uses it?
type ExtCallHandler<T extends ZodRawShape> = {
  data: zod.infer<zod.ZodObject<T>>,
  caller: Caller;
  throwError: (message: string, code?: functions.https.FunctionsErrorCode) => any;
};



type ExtCall<T extends ZodRawShape> = {
  zodObj: T,
  handler: (args: ExtCallHandler<T>) => any | Promise<any>,
  allowAnonymous?: true; // Throws error if false and if caller is anonymous
};



// TODO: add obj to message type, to allow languages given by the caller.
function throwError(
  message: string, // | ExtError
  code: functions.https.FunctionsErrorCode,
  data: any,
  caller: Caller
) {
  // _callerToken with _ to keep it on the end of the json for better readibility on firebase console
  console.error(new Error(JSON.stringify({ code, data, message, _callerToken: caller.token })));
  throw new functions.https.HttpsError(code, message);
}


// TODO: Optional zodObj. Won't use now, so leaving it for later
// TODO: Take the language from data (if there is) and pass it to the caller
export function extCall<T extends ZodRawShape>({ zodObj, handler, allowAnonymous, }: ExtCall<T>) {

  return functions.region(region).https.onCall(async (data, context) => {
    // TODO: wrapping try/catch
    const schema = zod.object(zodObj);
    const caller = new Caller(context);

    if (!allowAnonymous && caller.isAnonymous)
      throwError('Usuário não pode ser anônimo.', 'unauthenticated', data, caller);


    // TODO: add support for zod invalid schema message
    if (schema.check(data)) {
      await handler({
        data,
        caller,
        throwError: (message, code = 'internal') => throwError(message, code, data, caller)
      });
    }
    else
      throwError('Argumentos inválidos', 'invalid-argument', data, caller);
  });
}