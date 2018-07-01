# Testlists
This is a tool to generate HTML checklists for testing your code from markdown files created in your project.

Each `testlist.md` file you create in your project will have its own HTML page created. You can check off the items there. They are saved with localStorage in your browser.

## Installation
`npm install Vindexus/testlists`

## testlist.md File Format
The file accepts markdown. Any line beginning with ` * ` will turn into a checkbox. Example:

```
# Registration Page
 * Email validation is working
 * Social media icons are up-to-date
```

## Scripts
You can add these to your package.json

### Generate
```
    "testlists": "node_modules/.bin/testlists",
```

### Watch
Requires the `nodemon` package

```
    "watch-testlists": "nodemon -e md --ignore \"!(testlist).md\" --exec \"npm run testlists\""
```

## Configuration
You can create your own config file at `/path/to/your/project/testlists.json`

### Config Values

|key|description|default|
|:--|:--|:--|
|`destinationDir`|Where the HTML files with the checklists will be saved.|`/your/app/root/folder/testlists`|
|`skippedDirectoryNames`|Don't check directories with these names.|`['.git', 'node_modules']`|