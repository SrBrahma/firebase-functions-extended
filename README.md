<div align="center">

# Firebase Functions Extended

[![npm version](https://badge.fury.io/js/firebase-functions-extended.svg)](https://www.npmjs.com/package/firebase-functions-extended)

</div>

An opinionated, abstracted and simplified way to create Google Cloud Functions.

Project is ready and being used in prod and in-dev projects. It's really good and useful for me, but currently I have no will to better prepare it to publicly publish it.

Implements common functionalities to the Cloud Functions onCall, including schema declaration and validation (using zod), error throwing and better caller information access. Typescript is recommended!

Note: undefined properties are converted to null by firebase. Instead of using .optional(), use .nullable() or [.nullish()](https://github.com/colinhacks/zod#nullish). This last one is better as you may not declare the props (and they will be undefined) in question or pass undefined (that will turn to null).

# Installation

Install it in your Cloud Functions directory with:

`npm i firebase-functions-extended`

or

`yarn add firebase-functions-extended`

It also requires the installation of [firebase-functions](https://github.com/firebase/firebase-functions) and [zod](https://github.com/vriad/zod).

# Usage

In your client, use [firebase-functions-extended-client](https://github.com/SrBrahma/firebase-functions-extended-client) to call the functions.

# Roadmap

* Write this README
