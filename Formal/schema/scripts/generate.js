#!/usr/bin/env node

const jsf = require('json-schema-faker');
const fs = require('fs');

const schema = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
jsf.option({defaultRandExpMax: 3});
jsf.resolve(schema)
  .then(sample => console.log(JSON.stringify(sample, null, 2)))
  .catch(console.error)
