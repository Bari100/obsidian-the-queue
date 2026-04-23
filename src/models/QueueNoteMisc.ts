import { dateTomorrow3Am } from 'src/helpers/dateUtils'
import { QueueButton } from 'src/types'

import { QueueNote } from './QueueNote'

export class QueueNoteMisc extends QueueNote {
    buttonsWhenDue: QueueButton[] = [QueueButton.ShowNext]
    buttonsWhenNotDue: QueueButton[] = [QueueButton.ShowNext]

    public score() {
        this.qData.due = dateTomorrow3Am()
    }
}
