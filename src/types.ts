/* eslint-disable @typescript-eslint/ban-types */
// Allow {} to be used

// Must be * as X for functions and zod, else, error in downloaded package
import * as functions from 'firebase-functions';
import * as z from 'zod';
import { Caller } from '.';
import { ErrorDictItem } from './i18n/i18n';
import { obj, Id } from './utils';


// Thanks to https://stackoverflow.com/a/49889856/10247962
// for the Promise return! :)
type Rtn2<T> = T extends ((...args: any) => obj)
  ? ReturnType<T>
  : (T extends (...args: any) => PromiseLike<infer U>
    ? (U extends obj
      ? U
      : {}
    )
    : {}
  );

export type Handler<Data extends obj = obj, AuxData extends obj = obj> = {
  /** The data the client (caller) sent. */
  data: Data;
  /** Properties that the aux functions had returned */
  auxData: AuxData;
  /** Informations about the caller */
  caller: Caller;
  /**
   * Throw this if invalid stuff happens.
   */
  ExtError(errorMessage: ErrorDictItem): functions.https.HttpsError;
  ExtError(errorMessage: string, errorCode?: functions.https.FunctionsErrorCode): functions.https.HttpsError;
};

// type a = (() => number) extends (() => void) ? true : false // returns true
// When changing R, also change on Joiner last param
export type HandlerF<Data extends obj = obj, AuxData extends obj = obj, R = obj | void | Promise<any>> =
  (args: Handler<Data, AuxData>) => R;

export type Joiner<
  Z extends z.ZodType<any>,
  A extends HandlerF<obj, any> = HandlerF<obj, {}, {}>,
  B extends HandlerF<obj, any> = HandlerF<obj, {}, {}>,
  C extends HandlerF<obj, any> = HandlerF<obj, {}, {}>,
  D extends HandlerF<obj, any> = HandlerF<obj, {}, {}>,
  E extends HandlerF<obj, any> = HandlerF<obj, {}, {}>,
  F extends HandlerF<obj, any> = HandlerF<obj, {}, {}>,
  G extends HandlerF<obj, any> = HandlerF<obj, {}, {}>,
  H extends HandlerF<obj, any> = HandlerF<obj, {}, {}>,
  I extends HandlerF<obj, any> = HandlerF<obj, {}, {}>,
  R = obj | void | Promise<any>
  > =
  HandlerF<
    z.infer<Z>,
    Id<Rtn2<A> & Rtn2<B> & Rtn2<C> & Rtn2<D> & Rtn2<E> & Rtn2<F> & Rtn2<G> & Rtn2<H> & Rtn2<I>>,
    R
  >;