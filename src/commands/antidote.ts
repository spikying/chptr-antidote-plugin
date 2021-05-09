import { flags } from '@oclif/command'
import { exec } from 'child_process'
import { ChapterId } from 'chptr/lib/chapter-id'
import { ChptrError } from 'chptr/lib/chptr-error'
import { d } from 'chptr/lib/commands/base'
import Command from 'chptr/lib/commands/initialized-base'
import { BuildType } from 'chptr/lib/core-utils'
import { QueryBuilder } from 'chptr/lib/ui-utils'
import { cli } from 'cli-ux'
import * as path from 'path'
import { file as tmpFile } from 'tmp-promise'

const debug = d('antidote')

export default class Antidote extends Command {
  static description = 'Launch Antidote spell-checker for given chapter'

  static flags = {
    ...Command.flags,
    only: flags.string({
      char: 'o',
      description: 'Only do the pre-antidote or the post-antidote script',
      default: '',
      options: ['', 'pre', 'post'],
      exclusive: ['word']
    }),
    word: flags.boolean({
      char: 'w',
      description: 'Extract chapter and open in Word (one-way)',
      default: false,
      exclusive: ['only']
    }),
    delete: flags.boolean({
      char: 'd',
      description: 'Delete Word file after process is done',
      default: false,
      dependsOn: ['word']
    }),
    message: flags.string({
      char: 'm',
      description: 'Message to use in commit step (`cancel` to skip commit)',
      default: ''
    })
  }

  static args = [
    {
      name: 'chapterId',
      description: 'Chapter number to Antidote.',
      required: false,
      default: ''
    }
  ]

  static hidden = false

  async run() {
    debug('Running Antidote plugin')
    const { args, flags } = this.parse(Antidote)
    const only = flags.only
    const word = flags.word
    const deleteWord = flags.delete

    let chapterIdString: string = args.chapterId
    if (chapterIdString === '') {
      const queryBuilder = new QueryBuilder()
      queryBuilder.add('chapterId', queryBuilder.textinput('What chapter to Antidote?', ''))
      const queryResponses: any = await queryBuilder.responses()
      chapterIdString = queryResponses.chapterId
    }
    const chapterId = new ChapterId(this.softConfig.extractNumber(chapterIdString), this.softConfig.isAtNumbering(chapterIdString))

    const chapterFileName = (
      await this.fsUtils.listFiles(path.join(this.rootPath, this.softConfig.chapterWildcardWithNumber(chapterId)))
    )[0]

    if (!chapterFileName) {
      throw new ChptrError(`No chapter was found with id ${chapterIdString}`, 'antidote:run', 2)
    }

    const basicFilePath = path.join(this.rootPath, chapterFileName)

    if (word) {
      cli.action.start(`Building Word output for chapter ${chapterId.toString()}`.actionStartColor())

      const chapterContent = await this.fsUtils.readFileContent(basicFilePath)
      const formattedContent = this.markupUtils.transformToPreProdMarkupContent(chapterContent)

      const tmpMDfile = await tmpFile()
      await this.fsUtils.writeInFile(tmpMDfile.fd, formattedContent)
      let chapterFile = tmpMDfile.path

      const wordFilePath = path.join(this.softConfig.buildDirectory, `${chapterFileName}.antidote.docx`)

      const allLuaFilters = await this.fsUtils.listFiles(path.join(this.hardConfig.configPath, '*.all.lua'))
      const prodLuaFilters = await this.fsUtils.listFiles(path.join(this.hardConfig.configPath, '*.prod.lua'))
      allLuaFilters.push(...prodLuaFilters)

      debug(`chapterFile = ${JSON.stringify(chapterFile)}`)
      const pandocArgs = await this.coreUtils.generatePandocArgs('docx', allLuaFilters, tmpMDfile.path, '', true, wordFilePath)
      debug(`pandocArgs = ${JSON.stringify(pandocArgs)}`)
      await this.coreUtils.runPandoc(pandocArgs)

      cli.action.stop('done'.actionStopColor())

      cli.action.start(`Running Word for file ${wordFilePath}`)
      await this.runWord(wordFilePath)
      cli.action.stop('done'.actionStopColor())
      
      if (deleteWord) {
        cli.action.start(`Deleting file ${wordFilePath}`)
        await this.fsUtils.deleteFile(wordFilePath)
        cli.action.stop('done'.actionStopColor())
      }
    } else {
      const antidoteFilePath = this.hardConfig.antidotePathName(chapterFileName)

      if (!only || only === 'pre') {
        cli.action.start(`Launching Antidote with ${antidoteFilePath}`.actionStartColor())
        await this.fsUtils.copyFile(basicFilePath, antidoteFilePath)
        await this.processPreAntidote(antidoteFilePath)

        const filePath = `"${path.resolve(antidoteFilePath)}"`

        void this.runAntidote([filePath])

        cli.action.stop('done'.actionStopColor())
      }
      if (!only) {
        await cli.anykey('Press any key when Antidote correction is done to continue.'.resultHighlighColor())
      }

      if (!only || only === 'post') {
        cli.action.start(`Post-processing ${antidoteFilePath} back to ${basicFilePath}`.actionStartColor())
        await this.processPostAntidote(antidoteFilePath)
        await this.fsUtils.moveFile(antidoteFilePath, basicFilePath)
        cli.action.stop('done'.actionStopColor())

        let message = flags.message
        if (!message) {
          const queryBuilder2 = new QueryBuilder()
          queryBuilder2.add(
            'message',
            queryBuilder2.textinput('Message to use in commit to repository? Type `cancel` to skip commit step.', '')
          )
          const queryResponses2: any = await queryBuilder2.responses()
          message = queryResponses2.message
        }

        if (message !== 'cancel') {
          message = ('Antidote:\n' + message).replace(/"/, '`')
          const toStageFiles = await this.gitUtils.GetGitListOfStageableFiles(chapterId)
          await this.coreUtils.preProcessAndCommitFiles(message, toStageFiles)
        }
      }
    }
  }

  private async runAntidote(options: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = 'antidote ' + options.join(' ')
      debug(`Executing child process with command ${command} `)

      exec(command, (err, pout, perr) => {
        if (err) {
          this.error(err.toString().errorColor())
          reject(err)
        }
        if (perr) {
          this.error(perr.toString().errorColor())
          reject(perr)
        }
        if (pout) {
          this.log(pout)
        }
        resolve()
      })
    })
  }

  private async runWord(filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const command = `"c:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\winword.exe" /t "${filepath}"`
      debug(`Executing child process with command ${command} `)

      exec(command, (err, pout, perr) => {
        if (err) {
          reject(err)
        }
        if (perr) {
          reject(perr)
        }
        if (pout) {
          this.log(pout)
        }
        resolve()
      })
    })
  }

  private removeTripleEnters(str: string): string {
    const tripleEnterRegEx = /\n\n\n/gm
    if (tripleEnterRegEx.test(str)) {
      return this.removeTripleEnters(str.replace(tripleEnterRegEx, '\n\n'))
    } else {
      return str
    }
  }

  private async processPostAntidote(filepath: string): Promise<void> {
    const initialContent = await this.fsUtils.readFileContent(filepath)
    if (initialContent === '') {
      throw new ChptrError('File does not exist or is empty', 'antidote:processPostAntidote', 60)
    }

    let replacedContent = this.removeTripleEnters(
      ('\n' + initialContent) // enter at the beginning
        .replace(/\n/gm, '\r\n')
        .replace(/\r\n/gm, '\n\n')
        .concat('\n') // add an enter at the end
        .replace(/\n{2,}$/, '\n') // make sure there is only one enter at the end
        .replace(/^\n{2,}# /, '\n# ') // make sure there is an enter before the first line
    )
    replacedContent = this.coreUtils.processContent(replacedContent)

    debug(`Processed back antidote content: \n${replacedContent.substring(0, 250)}`)
    await this.fsUtils.writeFile(filepath, replacedContent)
  }

  private async processPreAntidote(filepath: string): Promise<void> {
    const initialContent = await this.fsUtils.readFileContent(filepath)

    let replacedContent = initialContent
    if (initialContent.charCodeAt(0) !== 65279) {
      replacedContent = String.fromCharCode(65279) + initialContent
    }

    replacedContent = this.coreUtils.processContentBack(replacedContent)

    await this.fsUtils.writeFile(filepath, replacedContent)
  }
}
