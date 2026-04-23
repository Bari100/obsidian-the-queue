import type { QueueButton } from 'src/types'

export interface QueueBarCallbacks {
    onQueueBarOpened(): void
    onQueueBarClosed(): void
    onBarButtonClicked(btn: QueueButton): void
    requestNewNote(): void
}

// visual component with the buttons (e.g. Wrong, Hard, Correct)
// should not contain business logic; defer that to the callbacks
export class QueueBar {
    isOpen = false
    containerEl: Element
    el: Element
    buttonHolderEl: Element
    callbacks: QueueBarCallbacks

    constructor(parentEl: Element, callbacks: QueueBarCallbacks) {
        this.callbacks = callbacks
        this.containerEl = parentEl
    }

    renderButtonsForEmpty() {
        if (this.buttonHolderEl) {
            this.buttonHolderEl.innerHTML = ''
            this.buttonHolderEl
                .createEl('button', { text: 'Show random due note' })
                .addEventListener('click', () => {
                    this.callbacks.requestNewNote()
                })
        }
    }

    renderButtonsForNote(buttons: QueueButton[]) {
        if (this.buttonHolderEl) {
            this.buttonHolderEl.innerHTML = ''

            buttons.forEach((btn) => {
                this.buttonHolderEl
                    .createEl('button', { text: btn })
                    .addEventListener('click', () => {
                        this.callbacks.onBarButtonClicked(btn)
                    })
            })
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close()
            this.isOpen = false
        } else {
            this.open()
            this.isOpen = true
        }
    }

    private open() {
        this.el = this.containerEl.createEl('div', { cls: 'q-floating-bar' })
        this.buttonHolderEl = this.el.createEl('div', { cls: 'q-floating-bar-btn-holder' })
        this.el.createEl('button', { text: 'X' }).addEventListener('click', () => {
            this.toggle()
        })
        this.callbacks.onQueueBarOpened()
    }

    private close() {
        this.callbacks.onQueueBarClosed()
        this.el.remove()
    }
}
