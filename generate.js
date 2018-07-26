#!/usr/bin/env node

const inspect = require('util').inspect
const path = require('path')
const fs = require('fs')
const colors = require('colors')

const {
  parseDir
} = require('./lib/definitions')

const {
  writeTestFiles
} = require('./lib/html')


const config = require('./lib/config')

const appDir = path.join(process.cwd())
const skippedDirectories = ['.git', 'node_modules']

function die (err) {
  if (err) {
    console.log(err.toString().red)
    console.error(err)
  }
  process.exit()
}

const def = parseDir(appDir)

if (!def) {
  die('No testlist.md files found anywhere in the app')
}

console.log('Creating checklist HTML pages...'.gray)

writeTestFiles(def, (err) => {
  if (err) {
    die(err)
    return
  }

  console.log('Done!'.bold.green)
  console.log('Index: ' + (config.src + '/index.html').green)
  process.exit()
})


