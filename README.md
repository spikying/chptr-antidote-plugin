chptr-antidote-plugin
=====================

An extension to Chptr to enable a smooth workflow with Antidote, a language-checker software.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/chptr-antidote-plugin.svg)](https://npmjs.org/package/chptr-antidote-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/chptr-antidote-plugin.svg)](https://npmjs.org/package/chptr-antidote-plugin)
[![License](https://img.shields.io/npm/l/chptr-antidote-plugin.svg)](https://github.com/spikying/chptr-antidote-plugin/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g chptr-antidote-plugin
$ oclif-example COMMAND
running command...
$ oclif-example (-v|--version|version)
chptr-antidote-plugin/0.0.0 win32-x64 node-v10.15.1
$ oclif-example --help [COMMAND]
USAGE
  $ oclif-example COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`oclif-example antidote [CHAPTERID]`](#oclif-example-antidote-chapterid)

## `oclif-example antidote [CHAPTERID]`

Launch Antidote spell-checker for given chapter

```
USAGE
  $ oclif-example antidote [CHAPTERID]

ARGUMENTS
  CHAPTERID  Chapter number to Antidote.

OPTIONS
  -N, --notify     show a notification box when build is completed.
  -h, --help       show CLI help
  -p, --path=path  [default: .] Path where root of project files are
```

_See code: [src\commands\antidote.ts](https://github.com/spikying/chptr-antidote-plugin/blob/v0.0.0/src\commands\antidote.ts)_
<!-- commandsstop -->
