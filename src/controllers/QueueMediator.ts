import { openFile } from 'src/helpers/vaultUtils'
import type { QueueButton } from 'src/types'

import type { ActiveNoteCallbacks, ActiveNoteManager } from './ActiveNoteManager'
import type { NoteShuffler } from './NoteShuffler'
import type { QueueBar, QueueBarCallbacks } from './QueueBar'

// a kind of awkward state tracker, mediates between the other classes
// e.g. the button registers a click on "Correct" here,
// this mediator sees that the note is scored, saved, and a new one loaded
export class QueueMediator implements QueueBarCallbacks, ActiveNoteCallbacks {
    queueBar: QueueBar
    noteShuffler: NoteShuffler
    activeNoteManager: ActiveNoteManager

    onNewActiveNote() {
        this.rerenderQueueBar()
    }

    requestNewNote() {
        const newRandomNote = this.noteShuffler.getDueNote()
        if (newRandomNote) {
            openFile(newRandomNote.file)
        }
    }

    onBarButtonClicked(btn: QueueButton) {
        this.activeNoteManager.scoreAndSaveActive(btn)
        this.requestNewNote()
    }

    onQueueBarOpened() {
        this.noteShuffler.requestLoadingNotes()
        this.rerenderQueueBar()
    }

    onQueueBarClosed() {}

    private rerenderQueueBar() {
        if (!this.queueBar) {
            console.warn('queue bar not yet loaded')
            return
        }

        if (this.activeNoteManager.activeNote) {
            this.queueBar.renderButtonsForNote(this.activeNoteManager.activeNote.getButtons())
        } else {
            this.queueBar.renderButtonsForEmpty()
        }
    }
}
