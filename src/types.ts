/* eslint-disable @typescript-eslint/ban-types */
// Allow {} to be used

import * as functions from 'firebase-functions';
import { Caller } from '.';
import { obj, Id } from './utils';
import z from 'zod';


// Return ReturnType<T> if T is a function.


type Rtn2<T> = T extends undefined
  ? {}
  : T extends ((...args: any) => obj) ? ReturnType<T> : {};

// type b = {} extends undefined ? true : false;

export type Handler<Data extends obj = obj, AuxData extends obj = obj> = {
  /** The data the client (caller) sent. */
  data: Data;
  /** Properties that the aux functions had returned */
  auxData: AuxData;
  /** Informations about the caller */
  caller: Caller;
  /**
   * Throw this if invalid stuff happens.
   *
   * */
  ExtError: (message: string, code?: functions.https.FunctionsErrorCode) => any;
};


// type a = (() => number) extends (() => void) ? true : false // returns true
export type HandlerF<Data extends obj = obj, AuxData extends obj = obj, R = obj> =
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
  R = {}
  > =
  HandlerF<
    z.infer<Z>,
    Id<Rtn2<A> & Rtn2<B> & Rtn2<C> & Rtn2<D> & Rtn2<E> & Rtn2<F> & Rtn2<G> & Rtn2<H> & Rtn2<I>>,
    R
  >;

type a = Id<Rtn2<() => { a: number; }> & Rtn2<{}>>;