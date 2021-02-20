// Caller -> The one calling the function.

import type { https } from 'firebase-functions';
import type { auth } from 'firebase-admin';


// Properties that apply to Caller and User, must be in User (like userId).
export class Caller {
  context: https.CallableContext;

  readonly language: string;
  readonly clientVersion: string;


  constructor(params: { context: https.CallableContext, language: string, clientVersion: string; }) {
    this.context = params.context;
    this.language = params.language;
    this.clientVersion = params.clientVersion;
  }

  /** Will, by default, always return true as Cloud Functions callers must be authed, unless
   * you allow it in allowNonAuthed param in ExtCall or in Firebase console. */
  get isAuthed(): boolean { return !!this.context.auth; }

  get token(): auth.DecodedIdToken | undefined { return this.context.auth?.token; }

  // [Google, facebook, "anonymous"] etc. If wanted, add here the exact strings of the others.
  get provider(): any { return this.token?.firebase.sign_in_provider; }

  // https://stackoverflow.com/a/62607358/10247962
  get isAnonymous(): boolean { return this.provider === 'anonymous'; }

  // If you allow not authed cloud function calls, check if it is '' before, or check isAuthed before.
  get uid(): string { return this.context.auth?.uid || ''; }
}