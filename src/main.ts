import { Plugin } from 'obsidian'

import { setQueuePluginContext } from './contexts/pluginContext'
import { ActiveNoteManager } from './controllers/ActiveNoteManager'
import { NoteShuffler } from './controllers/NoteShuffler'
import { QueueBar } from './controllers/QueueBar'
import { QueueMediator } from './controllers/QueueMediator'

// acts as Mediator for main components
export default class QueuePlugin extends Plugin {
    queueBar: QueueBar

    async onload() {
        setQueuePluginContext(this)
        const mediator = new QueueMediator()

        this.queueBar = new QueueBar(this.app.workspace.containerEl, mediator)
        const noteShuffler = new NoteShuffler()
        const activeNoteManager = new ActiveNoteManager(mediator)

        mediator.queueBar = this.queueBar
        mediator.noteShuffler = noteShuffler
        mediator.activeNoteManager = activeNoteManager

        this.addRibbonIcon('square-square', 'Toggle Queue', () => {
            // the toggle is held here b/c it's basically the core way of
            // interacting with the plugin itself,
            // however the logic is first handled by the QueueBar visually
            // and then passed to the mediator
            this.queueBar.toggle()
        })
    }

    unload() {
        if (this.queueBar) {
            this.queueBar.el.remove()
        }
    }
}
