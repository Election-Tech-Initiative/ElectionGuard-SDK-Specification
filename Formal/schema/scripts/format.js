#!/usr/bin/env node

const fs = require('fs');

const json = JSON.parse(fs.readFileSync(0, 'utf8'));
console.log(JSON.stringify(json, null, 2));
