# Markovifying
Markovifying is a JavaScript module with for generating markov chain models for predictive text generation in JSON format.

## Features

- Customizeable state size 
- Models can be saved as JSON, in a human readable format.

## Installation
```
npm install markovifying
```

## Usage
```js
const markov = require("markovifying")
const fs = require("fs")

// Import text and split it into sentences
const textArray = fs.fileReadSync("./text.txt", "utf-8").split("\n")

// Build the model
const model = markov.generateModel(textArray)

// Print a sentence generated by the model
console.log(markov.generateTextFromModel(model))
```



