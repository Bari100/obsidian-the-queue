import type { QueueNoteData } from 'src/types'
import { QueueNoteStage, QueueNoteTemplate } from 'src/types'

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getNoteDataFromFrontmatter(frontmatter: Record<string, unknown>): QueueNoteData {
    const noteData: QueueNoteData = {
        template: QueueNoteTemplate.Misc,
    }

    const qData = frontmatter['q']
    if (!isRecord(qData)) return noteData

    const templateString = typeof qData['template'] === 'string' ? qData['template'] : ''
    if (templateString === 'learn') noteData.template = QueueNoteTemplate.Learn
    else if (templateString === 'todo') noteData.template = QueueNoteTemplate.Todo
    else if (templateString === 'habit') noteData.template = QueueNoteTemplate.Habit
    else if (templateString === 'check') noteData.template = QueueNoteTemplate.Check
    else if (templateString === 'shortmedia') noteData.template = QueueNoteTemplate.ShortMedia
    else if (templateString === 'longmedia') noteData.template = QueueNoteTemplate.LongMedia
    else if (templateString === 'exclude') noteData.template = QueueNoteTemplate.Exclude

    const stageString = typeof qData['stage'] === 'string' ? qData['stage'] : ''
    if (stageString === 'unstarted') noteData.stage = QueueNoteStage.Unstarted
    else if (stageString === 'ongoing') noteData.stage = QueueNoteStage.Ongoing
    else if (stageString === 'finished') noteData.stage = QueueNoteStage.Finished
    else noteData.stage = QueueNoteStage.Unstarted

    if (qData['due'] !== undefined) noteData.due = new Date(qData['due'] as string | number | Date)
    if (qData['seen'] !== undefined)
        noteData.seen = new Date(qData['seen'] as string | number | Date)
    if (typeof qData['interval'] === 'number') noteData.interval = qData['interval']
    if (typeof qData['stability'] === 'number') noteData.stability = qData['stability']
    if (typeof qData['difficulty'] === 'number') noteData.difficulty = qData['difficulty']
    if (typeof qData['elapsed'] === 'number') noteData.elapsed = qData['elapsed']
    if (typeof qData['scheduled'] === 'number') noteData.scheduled = qData['scheduled']
    if (typeof qData['reps'] === 'number') noteData.reps = qData['reps']
    if (typeof qData['lapses'] === 'number') noteData.lapses = qData['lapses']
    if (typeof qData['state'] === 'number') noteData.state = qData['state']

    return noteData
}

export function getNoteDataFromFrontmatterWithLegacyParadigm(
    frontmatter: Record<string, unknown>,
): QueueNoteData {
    const noteData: QueueNoteData = {
        template: QueueNoteTemplate.Misc,
    }

    const templateString = typeof frontmatter['q-type'] === 'string' ? frontmatter['q-type'] : ''
    if (templateString === 'learn-started' || templateString === 'learn')
        noteData.template = QueueNoteTemplate.Learn
    else if (templateString === 'todo') noteData.template = QueueNoteTemplate.Todo
    else if (templateString === 'habit') noteData.template = QueueNoteTemplate.Habit
    else if (templateString === 'check') noteData.template = QueueNoteTemplate.Check
    else if (templateString === 'article') noteData.template = QueueNoteTemplate.ShortMedia
    else if (templateString === 'book-started' || templateString === 'book')
        noteData.template = QueueNoteTemplate.LongMedia
    else if (templateString === 'exclude' || templateString === 'todo-finished')
        noteData.template = QueueNoteTemplate.Exclude

    // check stages
    if (templateString === 'learn-started' || templateString === 'book-started')
        noteData.stage = QueueNoteStage.Ongoing
    else if (templateString === 'book-finished') noteData.stage = QueueNoteStage.Finished
    else noteData.stage = QueueNoteStage.Unstarted

    const queueData = frontmatter['q-data']
    if (isRecord(queueData)) {
        // due-at changes for learn notes
        if (noteData.template == QueueNoteTemplate.Learn) {
            const fsrsData = queueData['fsrs-data']
            if (isRecord(fsrsData)) {
                const dueString = fsrsData['due']
                if (dueString !== undefined)
                    noteData.due = new Date(dueString as string | number | Date)
                if (typeof fsrsData['stability'] === 'number')
                    noteData.stability = fsrsData['stability']
                if (typeof fsrsData['difficulty'] === 'number')
                    noteData.difficulty = fsrsData['difficulty']
                if (typeof fsrsData['elapsed_days'] === 'number')
                    noteData.elapsed = fsrsData['elapsed_days']
                if (typeof fsrsData['scheduled_days'] === 'number')
                    noteData.scheduled = fsrsData['scheduled_days']
                if (typeof fsrsData['reps'] === 'number') noteData.reps = fsrsData['reps']
                if (typeof fsrsData['lapses'] === 'number') noteData.lapses = fsrsData['lapses']
                if (typeof fsrsData['state'] === 'number') noteData.state = fsrsData['state']
                if (fsrsData['last_review'] !== undefined)
                    noteData.seen = new Date(fsrsData['last_review'] as string | number | Date)
            }
        } else {
            const dueString = queueData['due-at']
            if (dueString !== undefined)
                noteData.due = new Date(dueString as string | number | Date)
        }
    }

    const intervalVal = frontmatter['q-interval']
    if (typeof intervalVal === 'number') noteData.interval = intervalVal

    return noteData
}
