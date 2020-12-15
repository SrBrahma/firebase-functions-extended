<div align="center">

# Firebase Functions Extended

[![npm version](https://badge.fury.io/js/firebase-functions-extended.svg)](https://www.npmjs.com/package/firebase-functions-extended)

</div>

An opinionated, abstracted and simplified way to create Google Cloud Functions.

Project not ready yet! Still fixing bugs and writing this README. Should be ready in a couple of weeks. I am using it in a real project, so the presentation of this one isn't the focus right now.

Implements common functionalities to the Cloud Functions onCall, including schema declaration and validation (using zod), error throwing and better caller information access. Typescript is recommended!

# Installation

Install it in your Cloud Functions directory with:

`npm i firebase-functions-extended`

or

`yarn add firebase-functions-extended`

It also requires the installation of [firebase-functions](https://github.com/firebase/firebase-functions) and [zod](https://github.com/vriad/zod). Zod v2 beta isn't working right now, use ^v1.

# Usage

# Roadmap

* Write this README

* Internationalization -> Also add way to change error string to invalid anonymous caller and invalid args error