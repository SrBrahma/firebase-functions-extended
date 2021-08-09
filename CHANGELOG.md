# 5.0.0 - 2021/08/09

* Updated zod from v1 to v3.
* Code lint
* Removed test files from package distribution files

# 4.0.2 - March 7th, 2021

* Added ExtError function type as export

# 4.0.0 - March 6th, 2021

* Added i18n!
* Added some tests
* Removed array arg in ExtError
* `data` may now be any Zod shape (could only be an object before). It also is now optional.


# 3.0.1 - January 10th 2021

* Fixed extCall return.


# 3.0.0 - December 15 2020

* Now Caller have `lang` (language) and `clientVersion` properties. No need to change the functions implementations, but, you must change the function calls in your client.

You may have something like this in your client, assuming lang and clientVersion are in scope:
```
function callExtFun(functionId: string, data: Record<string, unknown>) {
  functions.httpsCallable(functionId)({ data, lang, clientVersion });
}
```

This is a way for near-future i18n implementations and a more future-proof design. Being a object, this also allows another metainfos to be sent using this pattern.

* Removed `setExtCallDefaultRegion()`.
* Added `setExtCallDefaults()`. This implements the one above, `allowAnonymous` and `allowNonAuthed`.

* Removed `onCallWithCaller()`. Not really useful.


# 2.2.0-1 - December 13 2020

Added allowNonAuthed param to ExtCall.


# 2.1.4

Fixed Error throwing

# 2.1.0

* Added array support for `ExtError` parameter, and `ExtErrorT` type export, which is this array type. In a soon future, will also accepts an object containing multi-language error messages.

* Added `ExtErrorMessages`, a function that creates an object of `ExtErrorT`s.

# Major 2.0.0

* With some Typescript witchery, added `aux` property to extCall. You may now add functions that will run after the zod validation and before the handler function. It may run common checks and add incremental data to the also new `auxData` property of the `handler` function, an object that will have all the object properties that your `aux` functions may return.
**This is really awesome! :\)**

* `region` property now allow a string of regions

* `zod` property now must be already a zod schema (before you would always pass an zod object shape). This allows having your data having the simple schema of like z.number() instead of always an object.

* Added a wrapping try/catch to the extCall function. This will prevent any cold restarts if an error ocurred, preventing attacks if exploits are discovered in your function.

* Probably this major will have a few bugs that will be fixed over the time.