/* eslint-disable @typescript-eslint/ban-types */
import * as functions from 'firebase-functions';
import * as z from 'zod';
import { Caller } from './caller';

// For multi-line JSON error https://github.com/firebase/firebase-functions/issues/612#issuecomment-648384797
import * as Logger from 'firebase-functions/lib/logger';
import { isObject } from './utils';
import type { ExtErrorT, HandlerF, Joiner } from './types';



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
 * Warning: If your function uses Realtime Database, use the default 'us-central1' region, as both servers
 * will be closer and the function execution will be faster.
 *
 * https://firebase.google.com/docs/functions/locations#best_practices_for_changing_region
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


// TODO: add obj to message type, to allow languages given by the caller.
// _callerToken with _ to keep it on the end of the json for better readibility on firebase console
function InternalExtError(
  message: string, // | ExtError
  code: functions.https.FunctionsErrorCode,
  data: any,
  caller: Caller
) {
  // We use this Logger because at the current moment,
  // Cloud Functions doesn't allow multi-line errors without this.
  // https://github.com/firebase/firebase-functions/issues/612#issuecomment-648384797
  Logger.error(new Error(JSON.stringify({
    code, data, message, _callerToken: caller.token
  }, null, 2))); // Make the JSON pretty with 2-space-identation and new lines

  return new functions.https.HttpsError(code, message);
}


// TODO: Optional zodObj. Won't use now, so leaving it for later
// TODO: Take the language from data (if there is) and pass it to the caller
/**
 * The main function of this package.
 *
 * Validates the client data using the zod schema,
 *
 * (will later write this.)
 */
export function extCall<
  Z extends z.ZodType<any>,
  A extends HandlerF<z.infer<Z>, {}>, // {} = No previous auxData
  B extends Joiner<Z, A>,
  C extends Joiner<Z, A, B>,
  D extends Joiner<Z, A, B, C>,
  E extends Joiner<Z, A, B, C, D>,
  F extends Joiner<Z, A, B, C, D, E>,
  G extends Joiner<Z, A, B, C, D, E, F>,
  H extends Joiner<Z, A, B, C, D, E, F, G>,
  I extends Joiner<Z, A, B, C, D, E, F, G, H>
>({ zod: schema, aux, handler, allowAnonymous = true, allowNonAuthed = false, region }: {
  zod: Z,
  /**
   * An array of auxiliary functions that will be run after the zod validation and before the handler function.
   *
   * Useful for reusing commom checks. To deny the call, use "throw ExtError(...)",
   * like you would do with the handler function.
   *
   * If it returns an object, its properties will be available for the next aux functions
   * and also for the handler function via the auxData property.
  */
  aux?: [A?, B?, C?, D?, E?, F?, G?, H?, I?];

  /** Your main function that will be run after the zod validation and after the aux functions execution, if any. */
  handler: Joiner<Z, A, B, C, D, E, F, G, H, I, any>,

  /**
   * Throws error if set to false and caller is anonymous.
   *
   * Defaults to `true`.
   */
  allowAnonymous?: boolean;


  /**
   * Throws error if false and caller isn't authed (with any provider or anonymous).
   *
   * Firebase console has an option for that, but here it allows a better control over that,
   * and non-authed could call functions in emulator environment.
   *
   * Defaults to `false`
   */
  allowNonAuthed?: boolean;

  /**
   * You can specify a region diferent of the default one (`us-central1` or the one set
   * by `setExtCallDefaultRegion()`)
   *
   * You may also pass an array of regions, so this function will be deployed to all of them.
   *
   * Warning: If your function uses Realtime Database, use the default 'us-central1' region, as both servers
   * will be closer and the function execution will be faster.
   *
   * https://firebase.google.com/docs/functions/locations#best_practices_for_changing_region
   * */
  region?: string | string[];

  // TODO:
  // language:

}): onCallRtn {

  let func;

  if (Array.isArray(region))
    func = functions.region(...region); // Couldn't do a ternary while destructuring the variadic
  else
    func = functions.region(region || defaultRegion);

  return func.https.onCall(async (data, context) => {

    let calledError = false;

    const caller = new Caller(context);

    // Relative to this extCall
    function thisExtError(arg0: any, arg1?: any): any {
      calledError = true;
      if (Array.isArray(arg0))
        return InternalExtError(arg0[0], arg0[1] || 'internal', data, caller);
      else
        return InternalExtError(arg0, arg1 || 'internal', data, caller);
    }

    try {
      if (!allowNonAuthed && caller.isAuthed)
        // TODO: better error differentiation between those two?
        throw thisExtError('Você precisa estar autenticado para executar esta ação.', 'unauthenticated');

      if (!allowAnonymous && caller.isAnonymous)
        throw thisExtError('Você precisa estar logado para executar esta ação.', 'unauthenticated');

      // TODO: add support for zod invalid schema message
      if (!schema.check(data))
        throw thisExtError('Argumentos inválidos.', 'invalid-argument');

      // throw is not needed in InternalExtErrors below, as the ExtError are suposed to be called with throw.
      const auxData: any = {};

      if (aux)
        for (const auxItem of aux) {
          const rtn = await auxItem?.({ data, caller, ExtError: thisExtError, auxData });
          if (isObject(rtn))
            Object.assign(auxData, rtn);
        }

      await handler?.({ data, caller, ExtError: thisExtError, auxData });
    }
    catch (err) {
      if (!calledError) {
        Logger.error(err);
        throw thisExtError('Ocorreu um erro no servidor, tente novamente.', 'internal');
      }
      else // Rethrow the error
        throw err;
    }
  });
}


export function ExtErrorMessages<T extends Record<string, ExtErrorT>>(args: T): T {
  return args;
}

// Testing:
// const auxNominal: HandlerF<{ dbId: number; }, obj, { db: string; }> = ({ data }) => {
//   return { db: data.dbId + '4' };
// };
// const auxPromise: HandlerF<{ dbId: number; }, obj, Promise<{ db2: string; }>> = async () => {
//   await true;
//   return { db2: '4' };
// };
// const auxVoid: HandlerF<{ dbId: number; }, obj> = async () => {
// };
// const a = extCall({
//   zod: z.object({
//     data: z.number(),
//     dbId: z.number(),
//   }),
//   aux: [
//     auxNominal,
//     auxPromise,
//     auxVoid
//   ],
//   handler: ({ auxData }) => { true; }
// });

