import type { TFile } from 'obsidian'
import {
    getNoteDataFromFrontmatter,
    getNoteDataFromFrontmatterWithLegacyParadigm,
} from 'src/helpers/frontmatterReaders'
import { getFrontmatterOfFile } from 'src/helpers/vaultUtils'
import type { QueueNoteData } from 'src/types'
import { QueueNoteTemplate } from 'src/types'

import type { QueueNote } from './QueueNote'
import { QueueNoteCheck } from './QueueNoteCheck'
import { QueueNoteExclude } from './QueueNoteExclude'
import { QueueNoteHabit } from './QueueNoteHabit'
import { QueueNoteLearn } from './QueueNoteLearn'
import { QueueNoteLongMedia } from './QueueNoteLongMedia'
import { QueueNoteMisc } from './QueueNoteMisc'
import { QueueNoteShortMedia } from './QueueNoteShortMedia'
import { QueueNoteTodo } from './QueueNoteTodo'

export class QueueNoteFactory {
    // these functions _could_ be unified into one, as in the wild we're not ever going to create
    // a QueueNote except by loading in a TFile and reading its frontmatter
    // however this separation makes it easier to unit test
    // createNoteFromFile() does the rather dirty logic of reading in frontmatter with old and new paradigm
    // and create() approaches something like an actual factory
    public static createNoteFromFile(file: TFile): QueueNote {
        const frontmatter = getFrontmatterOfFile(file)
        let qData: QueueNoteData

        if (!frontmatter) {
            // No frontmatter, treat as misc note
            qData = { template: QueueNoteTemplate.Misc }
        } else if (frontmatter['q']) {
            // New paradigm
            qData = getNoteDataFromFrontmatter(frontmatter)
        } else {
            // Legacy paradigm
            qData = getNoteDataFromFrontmatterWithLegacyParadigm(frontmatter)
        }

        return this.create(file, qData)
    }

    public static create(file: TFile, qData: QueueNoteData): QueueNote {
        return {
            [QueueNoteTemplate.Habit]: new QueueNoteHabit(file, qData),
            [QueueNoteTemplate.Learn]: new QueueNoteLearn(file, qData),
            [QueueNoteTemplate.Todo]: new QueueNoteTodo(file, qData),
            [QueueNoteTemplate.Check]: new QueueNoteCheck(file, qData),
            [QueueNoteTemplate.ShortMedia]: new QueueNoteShortMedia(file, qData),
            [QueueNoteTemplate.LongMedia]: new QueueNoteLongMedia(file, qData),
            [QueueNoteTemplate.Exclude]: new QueueNoteExclude(file, qData),
            [QueueNoteTemplate.Misc]: new QueueNoteMisc(file, qData),
        }[qData.template]
    }
}
