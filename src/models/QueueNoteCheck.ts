import { dateInNrOfDaysAt3Am } from 'src/helpers/dateUtils'
import { QueueButton } from 'src/types'

import { QueueNote } from './QueueNote'

export class QueueNoteCheck extends QueueNote {
    buttonsWhenDue = [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]
    buttonsWhenNotDue = [QueueButton.CheckNo, QueueButton.CheckKindOf, QueueButton.CheckYes]

    public score() {
        this.qData.due = dateInNrOfDaysAt3Am(this.qData.interval || 1)
    }
}
