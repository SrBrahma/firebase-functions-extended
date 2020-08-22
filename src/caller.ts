// Caller -> The one calling the function.
import { https } from 'firebase-functions';


// Properties that apply to Caller and User, must be in User (like userId).
export class Caller {
  context: https.CallableContext;
  readonly language: string | undefined; // Still unused

  constructor(context: https.CallableContext, language?: string) {
    this.context = context;
    this.language = language;
  }

  // Will, by default, always return true as Cloud Functions callers must be authed, unless
  // you change it on settings somewhere.
  get isAuthed() { return !!this.context.auth; }

  get token() { return this.context.auth?.token; }

  // [Google, facebook, "anonymous"] etc. If wanted, add here the exact strings of the others.
  get provider() { return this.token?.firebase.sign_in_provider; }

  // https://stackoverflow.com/a/62607358/10247962
  get isAnonymous() { return this.provider === 'anonymous'; }

  // If you allow not authed cloud function calls, check if it is undefined before, or check isAuthed before.
  get uid() { return this.context.auth?.uid as string; }
}