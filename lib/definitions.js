const fs = require('fs')
const path = require('path')
const config = require('./config')

const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())

/**
 * Some directories we want to ignore and not bother checking, so we check
 * that here against a list of full paths to ignore, and a list of directory
 * names to ignore
 *
 * @param {String} dirPath Absolute path to a directorys
 * @returns {Boolean}
 */
function ignoreDir (dirPath) {
  const basename = path.basename(dirPath)
  const fullpath = path.resolve(dirPath)

  if (config.skippedDirectoryNames && config.skippedDirectoryNames.indexOf(basename) > -1) {
    return true
  }

  if (config.skippedDirectories && config.skippedDirectories.indexOf(fullpath) > -1) {
    return true
  }

  return false
}

/**
 * Adds a directory to the lists object if any of its children have testlist.md files
 *
 * @param {String} dir Absolute path to a directory
 */
function parseDir (dir) {
  dir = path.resolve(dir)
  const definition = {
    skippable: false,
    key: path.basename(dir),
    testlist: false,
    sublists: {},
    name: "",
  }
  //Check this directory for a testlist.md file
  const tlPath = path.join(dir, 'testlist.md')
  if (fs.existsSync(tlPath)) {
    definition.testlist = parseTestListFile(tlPath)
    definition.name = definition.testlist.title
  }

  const subdirectories = dirs(dir)

  let hasSubLists = false
  if (subdirectories.length) {
    subdirectories.forEach((subdir) => {
      const subDirPath = path.join(dir, subdir)

      if (ignoreDir(subDirPath)) {
        return
      }

      let subDef = parseDir(subDirPath)

      if (subDef) {
        while(subDef.skipTo) {
          subDef = subDef.skipTo
        }
        definition.sublists[subDef.key] = subDef
        hasSubLists = true
      }
    })
  }

  if (!hasSubLists && !definition.testlist) {
    return false
  }

  const sublistKeys = Object.keys(definition.sublists)
  if (!definition.testlist && sublistKeys.length == 1) {
    definition.skippable = true
    definition.skipTo = definition.sublists[sublistKeys[0]]
  }

  return definition
}

function parseTestListFile (filepath) {
  const text = fs.readFileSync(path.resolve(filepath), 'utf8')

  const title = text.split("\n")[0].split(/#+ /).join('').split(/[\n|\r]/).join('')

  return {
    title: title,
    source: text
  }
}

/**
 * Based on the given definition, it creates the navigation items to be
 * put into the list of checklists
 */
function generateNavigation (urlprepend, def) {
  const nav = [{
    name: def.name,
    url: urlprepend + '/' + def.key + '.html'
  }]
}

module.exports = {
  generateNavigation,
  parseTestListFile,
  parseDir,
  ignoreDir
}