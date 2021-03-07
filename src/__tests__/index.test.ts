import FunctionsTest from 'firebase-functions-test';
import { extCall, extData, ExtOptions, setFallbackLanguage } from '../index';
import * as z from 'zod';
import { CloudFunction } from 'firebase-functions';
const test = FunctionsTest();

// jest.mock('firebase-admin');

const nonAuthedFn = extCall({
  handler: () => { return; },
  allowNonAuthed: true,
});
const authedFn = extCall({
  handler: () => { return; },
  allowNonAuthed: false,
});


const fn1ErrorPt = 'Não é zero';
const fn1ErrorEn = 'Not zero';
const fn1 = extCall({
  zod: z.object({ v: z.number() }),
  handler: ({ data, ExtError }) => {
    if (data.v === 0) return 'zero';
    else throw ExtError({ _code: 'invalid-argument', pt: fn1ErrorPt, en: fn1ErrorEn });
  }
});

async function authedCall(fn: CloudFunction<any>, data?: unknown, options?: ExtOptions) {
  await test.wrap(fn)(extData(data, options), { auth: { uid: 'uid' } });
}

console.warn = jest.fn(); // remove the "{"severity":"WARNING","message":"Warning, FIREBASE_CONFIG and GCLOUD_PROJECT environment variables are missing. Initializing firebase-admin will fail"}"
console.error = jest.fn();

describe('index', () => {

  afterEach(() => {
    setFallbackLanguage(); // Reset fallbackLanguage
  });
  afterAll(() => {
    test.cleanup(); // https://firebase.google.com/docs/functions/unit-testing#test_cleanup
  });


  it('should run a function that doesn\'t require authentication', () => {
    expect(test.wrap(nonAuthedFn)(undefined)).resolves;
  });
  it('should not run a function that requires authentication and user is not authenticated', () => {
    expect(test.wrap(authedFn)(undefined)).rejects.toThrow(); // why is toThrow needed?
  });
  it('should run a function that requires authentication and user is authenticated', () => {
    expect(authedCall(authedFn)).resolves;
  });
  it('should run a function with zod schema and valid data', () => {
    expect(authedCall(fn1, { v: 0 })).resolves;
  });
  it('should not run a function with zod schema and invalid data', () => {
    expect(authedCall(fn1, { v: 'no-no' })).rejects.toThrow();
  });
  it('should use client default language', () => {
    expect(authedCall(fn1, { v: 1 })).rejects.toThrow(fn1ErrorEn);
  });
  it('should use client custom language', () => {
    expect(authedCall(fn1, { v: 1 }, { language: 'pt' })).rejects.toThrow(fn1ErrorPt);
  });
  it('should use server custom default language', () => {
    setFallbackLanguage('pt');
    expect(authedCall(fn1, { v: 1 })).rejects.toThrow(fn1ErrorPt);
  });

});


// // Testing:
// // const auxNominal: HandlerF<{ dbId: number; }, obj, { db: string; }> = ({ data }) => {
// //   return { db: data.dbId + '4' };
// // };
// // const auxPromise: HandlerF<{ dbId: number; }, obj, Promise<{ db2: string; }>> = async () => {
// //   await true;
// //   return { db2: '4' };
// // };
// // const auxVoid: HandlerF<{ dbId: number; }, obj> = async () => {
// // };
// // const a = extCall({
// //   zod: z.object({
// //     data: z.number(),
// //     dbId: z.number(),
// //   }),
// //   aux: [
// //     auxNominal,
// //     auxPromise,
// //     auxVoid
// //   ],
// //   handler: ({ auxData }) => { true; }
// // });

