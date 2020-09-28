<!-- * `zod` property is now optional. You now have to  -->


# Major 2.0.0

* With some Typescript witchery, added `aux` property to extCall. You may now add functions that will run after the zod validation and before the handler function. It may run common checks and add incremental data to the also new `auxData` property of the `handler` function, an object that will have all the object properties that your `aux` functions may return.
**This is really awesome! :\)**

* `region` property now allow a string of regions

* `zod` property now must be already a zod schema (before you would always pass an zod object shape). This allows having your data having the simple schema of like z.number() instead of always an object.

* Added a wrapping try/catch to the extCall function. This will prevent any cold restarts if an error ocurred, preventing attacks if exploits are discovered in your function.

* Probably this major will have a few bugs that will be fixed over the time.