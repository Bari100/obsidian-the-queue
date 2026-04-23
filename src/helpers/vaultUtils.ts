// functions are separated because they require obs specific stuff
// ...and thus, side effects

import type { FrontMatterCache, TFile } from 'obsidian'
import type { QueueNote } from 'src/models/QueueNote'
import { QueueNoteStage, QueueNoteTemplate } from 'src/types'

import { getPluginContext } from '../contexts/pluginContext'

export function getFrontmatterOfFile(file: TFile): FrontMatterCache | undefined {
    return getPluginContext().app.metadataCache.getFileCache(file)?.frontmatter
}

export function getAllMdFiles(): TFile[] {
    const files = getPluginContext().app.vault.getMarkdownFiles()
    return files
}

export function openFile(file: TFile) {
    getPluginContext().app.workspace.getLeaf(false).openFile(file)
}

// SAVING

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function saveNoteToVault(note: QueueNote) {
    if (!note) {
        return
    }

    getPluginContext()
        .app.fileManager.processFrontMatter(note.file, (frontmatter) => {
            const fm = frontmatter as Record<string, unknown>
            if (!isRecord(fm['q'])) {
                fm['q'] = {}
            }
            const q = fm['q'] as Record<string, unknown>

            if (note.qData.template !== QueueNoteTemplate.Misc) {
                const template = Object.keys(QueueNoteTemplate).find(
                    (key) =>
                        QueueNoteTemplate[key as keyof typeof QueueNoteTemplate] ===
                        note.qData.template,
                )
                q['template'] = template?.toLowerCase()
            }

            if (note.qData.stage !== undefined && note.qData.stage !== QueueNoteStage.Unstarted) {
                const stage = Object.keys(QueueNoteStage).find(
                    (key) =>
                        QueueNoteStage[key as keyof typeof QueueNoteStage] === note.qData.stage,
                )
                q['stage'] = stage?.toLowerCase()
            }

            if (note.qData.due !== undefined) q['due'] = note.qData.due
            if (note.qData.seen !== undefined) q['seen'] = note.qData.seen
            if (
                note.qData.interval !== undefined &&
                note.qData.interval !== 1 &&
                note.qData.interval !== 0
            )
                q['interval'] = note.qData.interval
            if (note.qData.stability !== undefined) q['stability'] = note.qData.stability
            if (note.qData.difficulty !== undefined) q['difficulty'] = note.qData.difficulty
            if (note.qData.elapsed !== undefined) q['elapsed'] = note.qData.elapsed
            if (note.qData.scheduled !== undefined) q['scheduled'] = note.qData.scheduled
            if (note.qData.reps !== undefined) q['reps'] = note.qData.reps
            if (note.qData.lapses !== undefined) q['lapses'] = note.qData.lapses
            if (note.qData.state !== undefined) q['state'] = note.qData.state
            if (note.qData.history !== undefined) q['history'] = note.qData.history

            deletePropertiesWithOldPrefix(fm)
        })
        // TODO: do something better
        .catch((err) => console.error(err))
}

// TODO: put this behind a settings toggle
function deletePropertiesWithOldPrefix(obj: Record<string, unknown>): void {
    for (const key of Object.keys(obj)) {
        if (key.startsWith('q-')) {
            delete obj[key]
        }
    }
}
