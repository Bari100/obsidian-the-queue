import { TFile } from 'obsidian'
import { getPluginContext } from 'src/contexts/pluginContext'
import { getRandomInt, pickRandom } from 'src/helpers/arrayUtils'
import { getAllMdFiles } from 'src/helpers/vaultUtils'
import { QueueNoteFactory } from 'src/models/NoteFactory'
import { QueueNoteStage, QueueNoteTemplate } from 'src/types'

import type { QueueNote } from '../models/QueueNote'
import { StatsManager } from './StatsManager'
import { StreakManager } from './StreakManager'

// knows the notes
// when asked, produces a random note (probably to open it)
export class NoteShuffler {
    private readonly MAX_DUE_LEARNS_BEFORE_EXCLUDING_NEW = 20
    private readonly MAX_ACTIVE_LONG_MEDIA_BEFORE_EXCLUDING_NEW = 5

    notes: QueueNote[] = []
    streakManager: StreakManager
    notesCurrentlyLoading = false
    lastPickedNote: QueueNote | null = null

    constructor() {
        this.streakManager = new StreakManager()

        const context = getPluginContext()

        // watching for new changes to open files
        // int this case, we generate a note from the changed file
        // compare that to this.notes, and adapt the note in notes
        // otherwise, any kind of write, whether scoring in other parts of the plugin
        // nor user edits would have an effect until plugin/obs restart
        context.plugin.registerEvent(
            context.app.vault.on('modify', async (file) => {
                if (this.notes.length > 0 && file instanceof TFile && file.extension === 'md') {
                    const noteFromFile = QueueNoteFactory.createNoteFromFile(file)
                    const index = this.notes.findIndex((note) => noteFromFile.file === note.file)
                    if (index !== -1) {
                        this.notes[index] = noteFromFile
                    }
                }
            }),
        )
    }

    getDueNote(): QueueNote | null {
        let note: QueueNote | null
        if (this.notes.length > 0) {
            note = this.getDueNoteFromAllNotes()
        } else {
            note = this.getDueNoteQuickly()
        }
        if (note) this.streakManager.onNoteWasPicked(note.qData)
        this.lastPickedNote = note
        return note
    }

    requestLoadingNotes() {
        if (!this.notesCurrentlyLoading) {
            this.notesCurrentlyLoading = true
            this.loadNotes()
        }
    }

    private loadNotes() {
        const allFiles = getAllMdFiles()
        const notes: QueueNote[] = []
        for (const file of allFiles) {
            const note = QueueNoteFactory.createNoteFromFile(file)
            if (note && note.qData.template !== QueueNoteTemplate.Exclude) {
                notes.push(note)
            }
        }
        this.notes = notes
        StatsManager.logDueStats(this.notes)

        this.notesCurrentlyLoading = false
    }

    private getDueNoteFromAllNotes(): QueueNote | null {
        const templateToPick = this.getRandomTemplateToPick()
        const notesToPickFrom = this.decideWhichNotesToPickFrom()

        const simplyAllDueNotes = notesToPickFrom.filter(
            (note) => note.isDue() && note !== this.lastPickedNote,
        )
        const notesWithDesiredTemplate = this.filterForNotesWithTemplate(
            simplyAllDueNotes,
            templateToPick,
        )

        // return a note with desired template, if we have none, return any due note
        // TODO: if we have none at all, also allow just any misc
        let noteToPick = pickRandom(notesWithDesiredTemplate)
        if (!noteToPick) {
            noteToPick = pickRandom(simplyAllDueNotes)
        }
        return noteToPick
    }

    // this function is necessary and complicated to treat finished media (e.g. articles you have read as a misc note)
    // otherwise, queue is spammed with finished articles and books, which show up MUCH more often than deserved
    private filterForNotesWithTemplate(
        notes: QueueNote[],
        template: QueueNoteTemplate,
    ): QueueNote[] {
        if (template === QueueNoteTemplate.Misc) {
            return notes.filter(
                (note) =>
                    note.qData.template === QueueNoteTemplate.Misc ||
                    (note.qData.template === QueueNoteTemplate.LongMedia &&
                        note.qData.stage === QueueNoteStage.Finished) ||
                    (note.qData.template === QueueNoteTemplate.ShortMedia &&
                        note.qData.stage === QueueNoteStage.Finished),
            )
        }

        if (template === QueueNoteTemplate.ShortMedia) {
            return notes.filter(
                (note) =>
                    note.qData.template === QueueNoteTemplate.ShortMedia &&
                    note.qData.stage !== QueueNoteStage.Finished,
            )
        }

        if (template === QueueNoteTemplate.LongMedia) {
            return notes.filter(
                (note) =>
                    note.qData.template === QueueNoteTemplate.LongMedia &&
                    note.qData.stage !== QueueNoteStage.Finished,
            )
        }

        // all other cases are the simple base case, where complexity was caught in the isDue
        return notes.filter((note) => note.qData.template === template)
    }

    private getRandomTemplateToPick(): QueueNoteTemplate {
        const noteTemplates = [
            QueueNoteTemplate.Learn,
            QueueNoteTemplate.Todo,
            QueueNoteTemplate.Habit,
            QueueNoteTemplate.Habit,
            QueueNoteTemplate.Check,
            QueueNoteTemplate.ShortMedia,
            QueueNoteTemplate.LongMedia,
            QueueNoteTemplate.Misc,
        ]

        let templateFromStreak = this.streakManager.getCurrentStreakTemplate()
        if (templateFromStreak === null || templateFromStreak === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return pickRandom(noteTemplates)!
        } else {
            return templateFromStreak
        }
    }

    private decideWhichNotesToPickFrom(): QueueNote[] {
        // filters after deciding whether to filter out new learns (if we have a lot of learns already); and same with longmedia
        return this.getFilteredNotes(this.notes)
        // this is wrapped in another function to isolate the side effect (getting the external this.notes state)
    }

    private getFilteredNotes(notes: QueueNote[]): QueueNote[] {
        const ongoingLearns = notes.filter(
            (note) =>
                note.qData.template === QueueNoteTemplate.Learn &&
                note.qData.stage === QueueNoteStage.Ongoing,
        )
        const nrDueLearns = ongoingLearns.filter((note) => note.isDue()).length
        const excludeUnstartedLearns = nrDueLearns > this.MAX_DUE_LEARNS_BEFORE_EXCLUDING_NEW

        const nrActiveLongMedia = notes.filter(
            (note) =>
                note.qData.template === QueueNoteTemplate.LongMedia &&
                note.qData.stage === QueueNoteStage.Ongoing,
        ).length
        const excludeUnstartedLongMedia =
            nrActiveLongMedia > this.MAX_ACTIVE_LONG_MEDIA_BEFORE_EXCLUDING_NEW
        if (excludeUnstartedLearns)
            notes = notes.filter(
                (note) =>
                    !(
                        note.qData.template === QueueNoteTemplate.Learn &&
                        note.qData.stage === QueueNoteStage.Unstarted
                    ),
            )
        if (excludeUnstartedLongMedia)
            notes = notes.filter(
                (note) =>
                    !(
                        note.qData.template === QueueNoteTemplate.LongMedia &&
                        note.qData.stage === QueueNoteStage.Unstarted
                    ),
            )

        return notes
    }

    private getDueNoteQuickly(): QueueNote | null {
        let dueNote: QueueNote | null = null

        // the following is a bit cheese, but it ensures that we randomly get due files
        // from the whole vault, not always from the same part of the file list
        const allFiles = getAllMdFiles()
        const randomStartingIndex = getRandomInt(0, allFiles.length - 1)
        const allFilesFromStartingIndexAndAddedToTheEndAgain = allFiles
            .slice(randomStartingIndex)
            .concat(allFiles)

        for (const file of allFilesFromStartingIndexAndAddedToTheEndAgain) {
            const note = QueueNoteFactory.createNoteFromFile(file)
            if (note) {
                dueNote = note
                break
            }
        }
        return dueNote
    }
}
