const colors = require('colors')
const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')
const config = require('./config')
const showdown  = require('showdown')
const converter = new showdown.Converter()

const templateDir = path.join(__dirname, '..', 'templates')
const templatePath = path.resolve(path.join(templateDir, 'listpage.html'))
const templateText = fs.readFileSync(templatePath, 'utf8')
const template = handlebars.compile(templateText)

function registerPartials () {
  handlebars.registerPartial('styles', fs.readFileSync(path.join(templateDir, 'style.css'), 'utf8'))
  handlebars.registerPartial('navigation', fs.readFileSync(path.join(templateDir, '_navigation.html'), 'utf8'))
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

function writeHtml (prepend, def) {
  const filename = getDefBaseName(prepend, def)

  if (def.testlist) {
    const filepath = path.resolve(config.destinationDir, filename + '.html')

    console.log('Creating ' + filepath.toString().cyan)

    ensureDirectoryExistence(filepath)

    const content = parseTestFileSource(def.testlist.source)
    const html = template({
      content: content,
      title: def.name,
      key: def.key
    })

    fs.writeFileSync(filepath, html, 'utf8')
  }

  if (def.sublists) {
    Object.keys(def.sublists).forEach((subkey) => {
      const sub = def.sublists[subkey]
      writeHtml(filename, sub)
    })
  }
}

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

function writeIndex (def) {
  const filepath = path.resolve(config.destinationDir, 'index.html')
  const templatePath = path.resolve(templateDir, 'index.html')
  const templateText = fs.readFileSync(templatePath, 'utf8')
  const template = handlebars.compile(templateText)

  let nav = getDefinitionNav('', def)

  fs.writeFileSync(filepath, template({
    nav: nav
  }), 'utf8')
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

registerPartials()

module.exports = {
  writeHtml,
  writeIndex
}
