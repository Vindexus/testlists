const colors = require('colors')
const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')
const config = require('./config')
const showdown  = require('showdown')
const converter = new showdown.Converter()

const templatePath = path.resolve(path.join(__dirname, '..', 'templates', 'index.html'))
const templateText = fs.readFileSync(templatePath, 'utf8')
const template = handlebars.compile(templateText)

function ensureDirectoryExistence (filePath) {
  var dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

function writeHtml (prepend, def) {
  const filename = [prepend, def.key]
    .filter(x => !!x)
    .join('-')

  if (def.testlist) {
    const filepath = path.resolve(config.destinationDir, filename + '.html')

    console.log('Making ' + filepath.toString().cyan)

    ensureDirectoryExistence(filepath)

    const content = parseTestFileSource(def.testlist.source)
    const html = template({
      content: content,
      title: def.name
    })

    fs.writeFileSync(filepath, html, 'utf8')
  }

  if (def.sublists) {
    Object.keys(def.sublists).forEach((subkey) => {
      const sub = def.sublists[subkey]
      console.log('Going into a sublist: ' + sub.key.green)
      writeHtml(filename, sub)
    })
  }
}

function writeIndex (def) {
  const filepath = path.resolve(config.destinationDir, 'index.html')

  fs.writeFileSync(filepath, template(def), 'utf8')
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
    console.log('matches',matches);
    source = source.replace(matches[0], ' - <label><input type="checkbox" name="item[]" />' + matches[1] + '</label>')
  }
  return converter.makeHtml(source)
}

module.exports = {
  writeHtml,
  writeIndex
}
