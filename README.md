chptr-antidote-plugin
=====================

An extension to [Chptr](https://github.com/spikying/chptr) to enable a smooth workflow with Antidote, a language-checker software.

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
$ chptr COMMAND
running command...
$ chptr (-v|--version|version)
chptr-antidote-plugin/0.1.3 win32-x64 node-v12.18.3
$ chptr --help [COMMAND]
USAGE
  $ chptr COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`chptr antidote [CHAPTERID]`](#chptr-antidote-chapterid)

## `chptr antidote [CHAPTERID]`

Launch Antidote spell-checker for given chapter

```
USAGE
  $ chptr antidote [CHAPTERID]

ARGUMENTS
  CHAPTERID  Chapter number to Antidote.

OPTIONS
  -N, --notify           show a notification box when command is completed.
  -h, --help             show CLI help
  -m, --message=message  Message to use in commit step (`cancel` to skip commit)
  -o, --only=|pre|post   Only do the pre-antidote or the post-antidote script
  -p, --path=path        [default: .] Path where root of project files are
```

_See code: [src\commands\antidote.ts](https://github.com/spikying/chptr-antidote-plugin/blob/v0.1.3/src\commands\antidote.ts)_
<!-- commandsstop -->
