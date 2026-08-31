/**
 * Reads saves from, and writes them back to, a folder, memory card or drive
 * the user points at.
 *
 * WebUSB is the wrong tool for this and cannot do it: it talks to a USB device
 * as a device, with no idea of partitions or files, so it cannot enumerate a
 * mounted card. Reading and writing a card the way a file manager does is the
 * File System Access API's job - `showDirectoryPicker` hands back a directory
 * the user chose, and the walk and write below use it.
 *
 * That API is desktop Chromium only. Everywhere else falls back to what the
 * platform does have: a directory `<input>` for importing, and ordinary
 * downloads for exporting. Neither can address a folder directly, but between
 * them a card can still be read and written.
 */

/** Extensions a DS save is written with, including DeSmuME's `.nds.sav`. */
const SAVE_EXTENSIONS: readonly string[] = ['.dsv', '.sav']

/**
 * Ceiling on entries the walk will visit. A card holds an entire filesystem,
 * and without a bound a wrong pick - a home directory, a system drive - would
 * spin for a very long time with nothing to show for it.
 */
const MAX_ENTRIES: number = 20000

/**
 * Ceiling on saves returned. Every save is held decoded in memory once
 * imported, so an unbounded import is a way to run the tab out of it.
 */
const MAX_SAVES: number = 500

/**
 * How a scan ended.
 */
export interface ScanResult {
  /** Saves found, in the order they were met. */
  files: File[]
  /** Whether the walk stopped early on one of the ceilings above. */
  truncated: boolean
}

/**
 * The slice of the File System Access API this uses. The DOM lib does not
 * describe it, and the parts that matter here are small enough to say
 * outright.
 */
interface DirectoryHandle {
  kind: 'directory' | 'file'
  name: string
  values: () => AsyncIterableIterator<DirectoryHandle | FileHandle>
}

interface FileHandle {
  kind: 'directory' | 'file'
  name: string
  getFile: () => Promise<File>
  createWritable?: () => Promise<WritableStream<Uint8Array>>
}

interface WritableDirectoryHandle extends DirectoryHandle {
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileHandle>
}

interface DirectoryPicker {
  showDirectoryPicker?: (options?: { id?: string, mode?: 'read' | 'readwrite' }) => Promise<DirectoryHandle>
}

/**
 * One save on its way out to a folder.
 */
export interface OutgoingSave {
  name: string
  bytes: Uint8Array
}

/**
 * How an export ended.
 */
export interface WriteResult {
  written: number
  failed: number
}

/**
 * Tells whether a file name looks like a DS save.
 * @param name File name to judge.
 * @returns whether it carries a save extension.
 */
export function isSaveName (name: string): boolean {
  const lowered: string = name.toLowerCase()
  return SAVE_EXTENSIONS.some((extension: string): boolean => lowered.endsWith(extension))
}

/**
 * Whether this browser can be handed a directory to read.
 * @returns whether `showDirectoryPicker` is available.
 */
export function canPickDirectory (): boolean {
  return typeof window !== 'undefined'
    && typeof (window as DirectoryPicker).showDirectoryPicker === 'function'
}

/**
 * Keeps only the saves out of an arbitrary set of files.
 * @param files Files to sift, as a directory `<input>` yields them.
 * @returns the saves, capped at what an import will hold.
 */
export function filterSaves (files: ArrayLike<File> | Iterable<File>): ScanResult {
  const found: File[] = []
  // `Array.from` takes both a `FileList` and a plain array of files.
  for (const file of Array.from(files)) {
    if (isSaveName(file.name)) {
      if (found.length >= MAX_SAVES) {
        return { files: found, truncated: true }
      }
      found.push(file)
    }
  }
  return { files: found, truncated: false }
}

/**
 * Asks the user for a directory to scan.
 * @returns the chosen directory, or null if they dismissed the picker.
 */
export async function pickDirectory (mode: 'read' | 'readwrite' = 'read'): Promise<DirectoryHandle | null> {
  const picker = (window as DirectoryPicker).showDirectoryPicker
  if (!picker) {
    return null
  }
  try {
    // `id` makes the browser reopen wherever the last one left off. Asking for
    // `readwrite` is what prompts for permission to write into the folder.
    return await picker({ id: 'dsv-tool-saves', mode })
  } catch {
    // Dismissing the picker rejects, and so does refusing write access. Both
    // are the user's answer, not a failure to report.
    return null
  }
}

/**
 * Writes saves into a directory, overwriting files of the same name.
 * @param directory Directory to write into, from `pickDirectory('readwrite')`.
 * @param saves Saves to write.
 * @returns how many landed and how many did not.
 */
export async function writeSaves (
  directory: DirectoryHandle,
  saves: readonly OutgoingSave[]
): Promise<WriteResult> {
  const writable = directory as WritableDirectoryHandle
  let written: number = 0
  let failed: number = 0

  for (const save of saves) {
    try {
      const handle: FileHandle = await writable.getFileHandle(save.name, { create: true })
      const stream = await handle.createWritable?.()
      if (!stream) {
        failed++
        continue
      }
      const writer = stream.getWriter()
      await writer.write(save.bytes)
      await writer.close()
      written++
    } catch {
      // A name the filesystem will not take, or a card pulled out mid-export,
      // should not cost the saves that would still write.
      failed++
    }
  }

  return { written, failed }
}

/**
 * Walks a directory tree for saves.
 * @param directory Directory to read, from `pickDirectory`.
 * @returns the saves found, and whether the walk was cut short.
 */
export async function scanDirectory (directory: DirectoryHandle): Promise<ScanResult> {
  const found: File[] = []
  let visited: number = 0
  let truncated: boolean = false

  const walk = async (handle: DirectoryHandle): Promise<void> => {
    if (truncated) {
      return
    }
    for await (const entry of handle.values()) {
      if (++visited > MAX_ENTRIES || found.length >= MAX_SAVES) {
        truncated = true
        return
      }
      if (entry.kind === 'directory') {
        await walk(entry as DirectoryHandle)
        if (truncated) {
          return
        }
      } else if (isSaveName(entry.name)) {
        try {
          found.push(await (entry as FileHandle).getFile())
        } catch {
          // A file the browser will not hand over - open elsewhere, or no
          // longer there - should not abandon the rest of the card.
        }
      }
    }
  }

  await walk(directory)
  return { files: found, truncated }
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      canPickDirectory,
      filterSaves,
      isSaveName,
      pickDirectory,
      scanDirectory,
      writeSaves
    }
  }
})
