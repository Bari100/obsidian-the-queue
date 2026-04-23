import type { TFile } from 'obsidian'
import { getPluginContext } from 'src/contexts/pluginContext'
import { saveNoteToVault } from 'src/helpers/vaultUtils'
import { QueueNoteFactory } from 'src/models/NoteFactory'
import type { QueueButton } from 'src/types'

import type { QueueNote } from '../models/QueueNote'

export interface ActiveNoteCallbacks {
    onNewActiveNote(): void
}

// knows which note is currently active
// to do this job, listens to new files being opened etc.
// keeps the active QueueNote
// apart from that, mostly signals changes up via the callbacks
export class ActiveNoteManager {
    activeNote: QueueNote | null
    callbacks: ActiveNoteCallbacks

    constructor(callbacks: ActiveNoteCallbacks) {
        this.callbacks = callbacks
        const context = getPluginContext()
        this.processNewFile(context.app.workspace.getActiveFile())

        // watching for new changes to open files
        context.plugin.registerEvent(
            context.app.workspace.on('file-open', async (file) => {
                this.processNewFile(file)
            }),
        )
    }

    scoreAndSaveActive(btn: QueueButton) {
        if (!this.activeNote) {
            return
        }

        this.activeNote.score(btn)
        this.activeNote.addScoreToHistory()
        saveNoteToVault(this.activeNote)
    }

    private processNewFile(file: TFile | null) {
        if (file) this.activeNote = QueueNoteFactory.createNoteFromFile(file)
        else this.activeNote = null

        this.notifyNewActiveNote()
    }

    private notifyNewActiveNote() {
        if (this.callbacks) this.callbacks.onNewActiveNote()
        else console.warn('no callbacks set')
    }
}
