import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  canPickDirectory,
  filterSaves,
  isSaveName,
  pickDirectory,
  scanDirectory,
  writeSaves
} from '~/plugins/save-folder.client'

/**
 * Builds a file entry as the File System Access API hands one over.
 * @param name File name.
 * @returns the handle.
 */
function file (name: string): object {
  return {
    kind: 'file',
    name,
    getFile: () => Promise.resolve(new File([new Uint8Array(8)], name))
  }
}

/**
 * Builds a directory entry holding the given children.
 * @param name Directory name.
 * @param children Entries it holds.
 * @returns the handle.
 */
function directory (name: string, children: object[]): object {
  return {
    kind: 'directory',
    name,
    values: async function * () {
      for (const child of children) {
        yield child
      }
    }
  }
}

/**
 * Builds a plain File, as a directory `<input>` yields.
 * @param name File name.
 * @returns the file.
 */
function plain (name: string): File {
  return new File([new Uint8Array(8)], name)
}

describe('isSaveName', () => {
  test('takes the extensions a DS save is written with', () => {
    expect(isSaveName('pokemon.sav')).toBe(true)
    expect(isSaveName('pokemon.dsv')).toBe(true)
    expect(isSaveName('pokemon.nds.sav')).toBe(true)
  })

  test('ignores case, since a card is usually case insensitive', () => {
    expect(isSaveName('POKEMON.SAV')).toBe(true)
    expect(isSaveName('Pokemon.Dsv')).toBe(true)
  })

  test('leaves everything else alone', () => {
    for (const name of ['pokemon.nds', 'readme.txt', 'save', 'sav', '.sav.bak']) {
      expect(isSaveName(name)).toBe(false)
    }
  })
})

describe('filterSaves', () => {
  test('keeps only the saves out of a folder', () => {
    const result = filterSaves([plain('a.sav'), plain('rom.nds'), plain('b.dsv'), plain('notes.txt')])

    expect(result.files.map((f: File) => f.name)).toEqual(['a.sav', 'b.dsv'])
    expect(result.truncated).toBe(false)
  })

  test('reports nothing found rather than failing', () => {
    expect(filterSaves([plain('rom.nds')]).files).toEqual([])
  })
})

describe('scanDirectory', () => {
  test('finds saves nested anywhere in the tree', async () => {
    const tree = directory('card', [
      file('root.sav'),
      file('bios.bin'),
      directory('saves', [
        file('pokemon.dsv'),
        directory('backup', [file('old.sav')])
      ])
    ])

    const result = await scanDirectory(tree as never)

    expect(result.files.map((f: File) => f.name).sort())
      .toEqual(['old.sav', 'pokemon.dsv', 'root.sav'])
    expect(result.truncated).toBe(false)
  })

  test('walks past a file it cannot open', async () => {
    const unreadable = {
      kind: 'file',
      name: 'locked.sav',
      getFile: () => Promise.reject(new Error('in use'))
    }
    const tree = directory('card', [unreadable, file('fine.sav')])

    const result = await scanDirectory(tree as never)

    expect(result.files.map((f: File) => f.name)).toEqual(['fine.sav'])
  })

  test('says so when it gives up on a directory too large to walk', async () => {
    // Well past the entry ceiling, so the walk has to stop short.
    const many = Array.from({ length: 20100 }, (_, i) => file(`save-${i}.sav`))
    const result = await scanDirectory(directory('card', many) as never)

    expect(result.truncated).toBe(true)
  })

  test('finds nothing in an empty directory without complaint', async () => {
    const result = await scanDirectory(directory('card', []) as never)

    expect(result.files).toEqual([])
    expect(result.truncated).toBe(false)
  })
})

/**
 * Builds a directory that records what was written into it.
 * @param rejectNamed A file name the filesystem will refuse.
 * @returns the handle and the files it collected.
 */
function writableDirectory (rejectNamed?: string): { handle: object, written: Map<string, Uint8Array> } {
  const written = new Map<string, Uint8Array>()
  const handle = {
    kind: 'directory',
    name: 'card',
    getFileHandle: (name: string) => {
      if (name === rejectNamed) {
        return Promise.reject(new Error('illegal name'))
      }
      return Promise.resolve({
        kind: 'file',
        name,
        getFile: () => Promise.resolve(new File([], name)),
        createWritable: () => Promise.resolve({
          getWriter: () => ({
            write: (bytes: Uint8Array) => {
              written.set(name, bytes)
              return Promise.resolve()
            },
            close: () => Promise.resolve()
          })
        })
      })
    }
  }
  return { handle, written }
}

describe('writeSaves', () => {
  test('writes every save into the directory', async () => {
    const { handle, written } = writableDirectory()

    const result = await writeSaves(handle as never, [
      { name: 'one.dsv', bytes: new Uint8Array([1, 2]) },
      { name: 'two.sav', bytes: new Uint8Array([3]) }
    ])

    expect(result).toEqual({ written: 2, failed: 0 })
    expect([...written.keys()]).toEqual(['one.dsv', 'two.sav'])
    expect(written.get('one.dsv')).toEqual(new Uint8Array([1, 2]))
  })

  test('keeps going when one save cannot be written', async () => {
    const { handle, written } = writableDirectory('bad*name.sav')

    const result = await writeSaves(handle as never, [
      { name: 'bad*name.sav', bytes: new Uint8Array([1]) },
      { name: 'fine.sav', bytes: new Uint8Array([2]) }
    ])

    expect(result).toEqual({ written: 1, failed: 1 })
    expect([...written.keys()]).toEqual(['fine.sav'])
  })

  test('has nothing to report for an empty export', async () => {
    const { handle } = writableDirectory()

    expect(await writeSaves(handle as never, [])).toEqual({ written: 0, failed: 0 })
  })
})

describe('canPickDirectory', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'showDirectoryPicker')
  })

  test('is false where the browser has no directory picker', () => {
    expect(canPickDirectory()).toBe(false)
  })

  test('is true once the picker is there', () => {
    Object.assign(window, { showDirectoryPicker: () => Promise.resolve({}) })

    expect(canPickDirectory()).toBe(true)
  })
})

describe('pickDirectory', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'showDirectoryPicker')
  })

  test('hands back the directory the user chose', async () => {
    const chosen = { kind: 'directory', name: 'card' }
    Object.assign(window, { showDirectoryPicker: () => Promise.resolve(chosen) })

    expect(await pickDirectory()).toBe(chosen)
  })

  test('asks for the access the caller needs', async () => {
    const picker = vi.fn(() => Promise.resolve({}))
    Object.assign(window, { showDirectoryPicker: picker })

    await pickDirectory('readwrite')

    expect(picker).toHaveBeenCalledWith(expect.objectContaining({ mode: 'readwrite' }))
  })

  test('reads by default, so importing cannot ask to write', async () => {
    const picker = vi.fn(() => Promise.resolve({}))
    Object.assign(window, { showDirectoryPicker: picker })

    await pickDirectory()

    expect(picker).toHaveBeenCalledWith(expect.objectContaining({ mode: 'read' }))
  })

  test('treats a dismissed picker as a choice, not a failure', async () => {
    Object.assign(window, {
      showDirectoryPicker: () => Promise.reject(new Error('AbortError'))
    })

    await expect(pickDirectory()).resolves.toBeNull()
  })

  test('has nothing to offer where there is no picker', async () => {
    expect(await pickDirectory()).toBeNull()
  })
})
