#!/usr/bin/env node
/* eslint-disable */

const fs = require('fs');
const execSync = require('child_process').execSync;
const secret = shell('yc lockbox secret get testing --format json');
const version = shell(`yc lockbox payload get ${secret.current_version.secret_id} --format json`);
const envFileContent = version.entries
    .map(({key, text_value}) => `${key}="${text_value}"`)
    .join('\n');
fs.writeFileSync(__dirname + '/../.env', envFileContent);

function shell(cmd) {
    return JSON.parse(execSync(cmd, {encoding: 'utf-8'}));
}
