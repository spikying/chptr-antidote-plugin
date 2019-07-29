// tslint:disable-next-line: no-reference
///<reference path="../imports.d.ts" />

import { expect, test } from '@oclif/test'
import 'chptr/src/ui-utils'

describe('antidote', () => {
  test
    .stdout()
    .command(['antidote'])
    .it('runs', ctx => {
      expect(ctx.stdout).to.contain(' ')
    })

  // test
  //   .stdout()
  //   .command(['antidote', '--name', 'jeff'])
  //   .it('runs hello --name jeff', ctx => {
  //     expect(ctx.stdout).to.contain('hello jeff')
  //   })
})
