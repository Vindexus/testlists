const colors = require('colors')
const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')
const config = require('./config')
const showdown  = require('showdown')
const branch = require('git-branch')

const converter = new showdown.Converter()
const templateDir = path.join(__dirname, '..', 'templates')
const templatePath = path.resolve(path.join(templateDir, 'listpage.html'))
const templateText = fs.readFileSync(templatePath, 'utf8')
const template = handlebars.compile(templateText)

const defaultScope = {
  genDate: new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }),
  src: path.resolve(path.join(__dirname, '..', 'src'))
}

function updateDefaultScope (name, value) {
  defaultScope[name] = value
}

function getDefaultScope () {
  return defaultScope
}

function getPartial (name) {
  return fs.readFileSync(path.join(templateDir, name), 'utf8')
}

function registerPartials () {
  handlebars.registerPartial('styles', getPartial('style.css'))
  handlebars.registerPartial('navigation', getPartial('_navigation.html'))
  handlebars.registerPartial('branch', getPartial('_branch.html'))
  handlebars.registerPartial('last-gen-message', getPartial('_last-gen-message.html'))
}

function ensureDirectoryExistence (filePath) {
  var dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

function getDefBaseName (prepend, def) {
  return [prepend, def.key]
    .filter(x => !!x)
    .join('-')
}

/**
 * Writes the HTML file for a given testlist markdown file that relates to a folder
 *
 * @param {String} prepend The string to prepend to the filename to denote folder parentage
 * @param {Object} def Testlists folder definition
 */
function writeHtml (prepend, def) {
  const filename = getDefBaseName(prepend, def)

  if (def.testlist) {
    const filepath = path.resolve(config.destinationDir, filename + '.html')

    console.log('Creating ' + filepath.toString().cyan)

    ensureDirectoryExistence(filepath)

    const content = parseTestFileSource(def.testlist.source)
    const scope = getDefaultScope()
    scope.content = content
    scope.title = def.name
    scope.key = def.key
    const html = template(scope)

    fs.writeFileSync(filepath, html, 'utf8')
  }

  if (def.sublists) {
    Object.keys(def.sublists).forEach((subkey) => {
      const sub = def.sublists[subkey]
      writeHtml(filename, sub)
    })
  }
}

/**
 * Returns the navigation items of a given definition
 *
 * @param {String} prepend The text to prepend to the filename to denotes it parentage
 * @param {Object} def A definition object for a folder 
 */
function getDefinitionNav (prepend, def) {
  const basename = getDefBaseName(prepend, def)
  let link = {
    label: def.name || def.key,
  }

  if (def.testlist) {
    link.href = './' + basename + '.html'
  }

  if (def.sublists) {
    link.subNav = []
    Object.keys(def.sublists).forEach((key) => {
      const sub = def.sublists[key]
      link.subNav.push(getDefinitionNav(basename, sub))
    })
  }

  return link
}

/**
 * Writes the index.html file that is the landing page of the testlists folder
 *
 * @param {Object} def The definition of root folder
 */
function writeIndex (def,) {
  const filepath = path.resolve(config.destinationDir, 'index.html')
  const templatePath = path.resolve(templateDir, 'index.html')
  const templateText = fs.readFileSync(templatePath, 'utf8')
  const template = handlebars.compile(templateText)

  const scope = getDefaultScope()
  scope.nav = getDefinitionNav('', def)

  console.log('Creating ' + filepath.toString().magenta)
  fs.writeFileSync(filepath, template(scope), 'utf8')
}

/**
 * Given the MD of a testfile source it returns the HTML content for that
 * testfile
 */
function parseTestFileSource (source) {
  source = source + '\n'
  //source = source.split(' * ').join(' * <input type="checkbox" name="done[]" /> ')
  let matches
  while(matches = (/ \* (.+)[\r|\n]/).exec(source)) {
    source = source.replace(matches[0], ' - <label><input type="checkbox" name="item[]" />' + matches[1] + '</label>')
  }
  return converter.makeHtml(source)
}

function writeTestFiles (def, done) {
  registerPartials()
  branch(process.cwd(), (err, name) => {
    if (err) {
      console.log('Error getting branch name'.red, err)
      console.log('Using default'.yellow)
    }

    updateDefaultScope('branch', name)

    console.log('Using branch name ' + name.toString().green)
    console.log('Generation date: ' + getDefaultScope().genDate.yellow)
    writeIndex(def, {
      branch: name
    })
    writeHtml('', def, {
      branch: name
    })
    done(null)
  })
}

module.exports = {
  writeHtml,
  writeIndex,
  writeTestFiles
}
