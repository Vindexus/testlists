const fs = require('fs')
const path = require('path')
const appDir = path.resolve(process.cwd())
let configPath = path.join(appDir, 'config', 'testlists.json')

if (!fs.existsSync(configPath)) {
  configPath = path.join(__dirname, '..', 'default-config.json')
}

const config = require(configPath)

if (!config.destinationDir) {
  config.destinationDir = path.join(appDir, 'testlists')
}

module.exports = config
