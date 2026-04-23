import type { TFile } from 'obsidian'
import type { QueueButton, QueueNoteData } from 'src/types'

// every TFile may be converted to a QueueNote,
// which holds the actual properties that interests us directly
// (e.g. the interval, or the template)
// has a million methods used by other classes related to interaction
// w/ a singular note
export abstract class QueueNote {
    file: TFile
    qData: QueueNoteData
    buttonsWhenDue: QueueButton[]
    buttonsWhenNotDue: QueueButton[]

    constructor(file: TFile, qData: QueueNoteData) {
        this.file = file
        this.qData = qData
    }

    // likely overwritten by derived classes
    getButtons(): QueueButton[] {
        if (this.isDue()) {
            return this.buttonsWhenDue
        } else {
            return this.buttonsWhenNotDue
        }
    }

    addScoreToHistory() {
        this.qData.seen = new Date()
        // TODO: find a solid encoding for btn in history, and store
    }

    isDue(): boolean {
        // considered due when due not set
        if (this.qData.due !== undefined && this.qData.due !== null)
            return this.qData.due < new Date()

        return true
    }

    abstract score(btn?: QueueButton): void
}
