import { dateTenMinutesFromNow, dateTomorrow3Am } from 'src/helpers/dateUtils'
import { QueueButton, QueueNoteStage } from 'src/types'

import { QueueNote } from './QueueNote'

export class QueueNoteLongMedia extends QueueNote {
    buttonsWhenUnstarted: QueueButton[] = [QueueButton.Started, QueueButton.NotToday]
    buttonsWhenDue: QueueButton[] = [
        QueueButton.NotToday,
        QueueButton.Later,
        QueueButton.Done,
        QueueButton.Finished,
    ]
    buttonsWhenNotDue: QueueButton[] = [
        QueueButton.RegisterDone,
        QueueButton.Finished,
        QueueButton.ShowNext,
    ]
    buttonsWhenFinished: QueueButton[] = [QueueButton.ShowNext]

    public score(btn: QueueButton) {
        if (btn === QueueButton.NotToday) {
            this.qData.due = dateTomorrow3Am()
        } else if (btn === QueueButton.Later) {
            this.qData.due = dateTenMinutesFromNow()
        } else if (btn === QueueButton.Done) {
            this.qData.due = dateTomorrow3Am()
        } else if (btn === QueueButton.Finished) {
            this.qData.stage = QueueNoteStage.Finished
            this.qData.due = dateTomorrow3Am()
        } else if (btn === QueueButton.RegisterDone) {
            this.qData.due = dateTomorrow3Am()
        } else if (btn === QueueButton.Started) {
            this.qData.due = dateTomorrow3Am()
            this.qData.stage = QueueNoteStage.Ongoing
        } else if (btn === QueueButton.ShowNext) {
            // pass
        } else {
            console.error(`Note type doesn't know this button`, btn)
        }
    }

    public getButtons(): QueueButton[] {
        switch (this.qData.stage) {
            case QueueNoteStage.Unstarted:
                return this.buttonsWhenUnstarted
            case QueueNoteStage.Ongoing:
                return this.isDue() ? this.buttonsWhenDue : this.buttonsWhenNotDue
            case QueueNoteStage.Finished:
                return this.buttonsWhenFinished
            default:
                console.error('getButtons(): invalid note state')
                return [QueueButton.ShowNext]
        }
    }
}
