import Dsv from '~/models/Dsv'
import DsvInfo from '~/models/DsvInfo'

/**
 * Trailer DeSmuME and DraStic write at the very end of a DSV file.
 */
export const DESMUME_COOKIE: string = '|-DESMUME SAVE-|'

/**
 * DSV Footer payload byte indexes.
 */
const ACTUALLY_WRITTEN_SIZE_INDEX: number = 0
const ADDRESS_SIZE_INDEX: number = 12
const COOKIE_INDEX: number = 24
const DSV_FOOTER_LENGTH: number = 24 + 16
const PADDED_SIZE_INDEX: number = 4
const SAVE_SIZE_INDEX: number = 16
const SAVE_TYPE_INDEX: number = 8
const VERSION_NUMBER_INDEX: number = 20

/**
 * Decodes a byte range the way Node's `Buffer.toString('ascii')` does: one
 * character per byte, with the high bit masked off.
 * @param bytes Bytes to read from.
 * @param start First byte index, inclusive.
 * @param end Last byte index, exclusive.
 * @returns the decoded string.
 */
function readAscii (bytes: Uint8Array, start: number, end: number): string {
  let text: string = ''
  for (let i = start; i < end; i++) {
    text += String.fromCodePoint((bytes[i] ?? 0) & 0x7f)
  }
  return text
}

/**
 * Encodes bytes as base64, chunked to stay clear of the argument limit of
 * `String.fromCodePoint`.
 * @param bytes Bytes to encode.
 * @returns the base64 representation.
 */
function toBase64 (bytes: Uint8Array): string {
  const CHUNK_LENGTH: number = 0x8000
  let binary: string = ''
  for (let i = 0; i < bytes.length; i += CHUNK_LENGTH) {
    binary += String.fromCodePoint(...bytes.subarray(i, i + CHUNK_LENGTH))
  }
  return btoa(binary)
}

/**
 * Tries to parse a DSV file buffer to fetch DSV informations.
 * @param bytes Bytes of the DSV file.
 * @returns a DsvInfo object about the DSV file.
 */
export function bufferToDsvInfo (bytes: Uint8Array): DsvInfo {
  const info: DsvInfo = new DsvInfo()

  const payloadIndex: number = bytes.length - DSV_FOOTER_LENGTH
  if (payloadIndex > 0) {
    const view: DataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

    info.actuallyWrittenSize = view.getUint32(payloadIndex + ACTUALLY_WRITTEN_SIZE_INDEX, true)
    info.addressSize = view.getUint32(payloadIndex + ADDRESS_SIZE_INDEX, true)
    info.cookie = readAscii(bytes, payloadIndex + COOKIE_INDEX, bytes.length)
    info.paddedSize = view.getUint32(payloadIndex + PADDED_SIZE_INDEX, true)
    info.saveSize = view.getUint32(payloadIndex + SAVE_SIZE_INDEX, true)
    info.saveType = view.getUint32(payloadIndex + SAVE_TYPE_INDEX, true)
    info.versionNumber = view.getUint32(payloadIndex + VERSION_NUMBER_INDEX, true)

    // The footer is appended straight after the save data, so most files have
    // no header region at all and `paddedSize + DSV_FOOTER_LENGTH` is exactly
    // the file length. Anything longer carries a header between the two.
    if (bytes.length >= info.paddedSize + DSV_FOOTER_LENGTH) {
      info.header = readAscii(bytes, info.paddedSize, payloadIndex)
    } else {
      const msg: string = `buffer size (${bytes.length}) < info.paddedSize (${info.paddedSize}) + DSV_FOOTER_LENGTH (${DSV_FOOTER_LENGTH})`
      throw new Error(`Corrupted DSV buffer information:\n\t${msg}.`)
    }
  } else {
    throw new Error('DSV buffer is too small to have a valid content.')
  }

  return info
}

/**
 * Reads a picked file into a Dsv model. Accepts both a DSV and a raw save;
 * only the former carries footer information.
 * @param file File to read.
 * @returns the parsed Dsv, carrying an `error` when a DSV footer is present
 *          but unreadable.
 */
export async function fileToDsv (file: File): Promise<Dsv> {
  const dsv: Dsv = new Dsv()
  dsv.name = file.name
  dsv.lastModified = file.lastModified
  dsv.size = file.size

  try {
    const bytes: Uint8Array = new Uint8Array(await file.arrayBuffer())
    dsv.base64 = toBase64(bytes)
    // A raw `.sav` is a supported input, not a failure. Only read a footer
    // when the cookie says there is one; otherwise the last 40 bytes of save
    // data would be parsed as garbage field values.
    if (isDsv(bytes)) {
      dsv.info = bufferToDsvInfo(bytes)
    }
  } catch (cause) {
    const error: Error = cause instanceof Error ? cause : new Error(String(cause))
    dsv.error = error
    console.error(`Error trying to parse file ${file.name}: ${error.message}`)
    console.error(error)
  }

  return dsv
}

/**
 * Decodes a base64 payload back into bytes.
 * @param base64 Base64 to decode.
 * @returns the decoded bytes.
 */
export function fromBase64 (base64: string): Uint8Array {
  const binary: string = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Tells a DSV apart from a raw save by its trailing cookie.
 * @param bytes Bytes to inspect.
 * @returns whether the bytes end with a DeSmuME footer.
 */
export function isDsv (bytes: Uint8Array): boolean {
  if (bytes.length < DSV_FOOTER_LENGTH) {
    return false
  }
  const start: number = bytes.length - DSV_FOOTER_LENGTH + COOKIE_INDEX
  return readAscii(bytes, start, bytes.length) === DESMUME_COOKIE
}

/**
 * Strips the DSV footer, leaving the raw save a cartridge would hold.
 * @param bytes Bytes of a DSV file.
 * @returns the raw save bytes.
 */
export function dsvToSav (bytes: Uint8Array): Uint8Array {
  const info: DsvInfo = bufferToDsvInfo(bytes)
  return bytes.slice(0, info.paddedSize)
}

/**
 * Appends a DeSmuME footer to raw save data.
 * @param bytes Bytes of a raw save file.
 * @param info Footer values to preserve. Supplied when the save came from a
 *             DSV in the first place, so a round trip keeps the emulator's
 *             own save type and bus width; otherwise they are derived from
 *             the save length.
 * @returns the DSV bytes.
 */
export function savToDsv (bytes: Uint8Array, info?: DsvInfo): Uint8Array {
  const dsv = new Uint8Array(bytes.length + DSV_FOOTER_LENGTH)
  dsv.set(bytes)

  // A raw save carries an all-zero DsvInfo rather than none at all, so the
  // size fields fall back on 0 as well as on a missing info.
  const sized = (value: number | undefined): number => (value ?? 0) > 0 ? value! : bytes.length

  const footer: number = bytes.length
  const view: DataView = new DataView(dsv.buffer)
  view.setUint32(footer + ACTUALLY_WRITTEN_SIZE_INDEX, sized(info?.actuallyWrittenSize), true)
  // `paddedSize` is where the reader slices, so it must match this payload
  // rather than whatever the original file said.
  view.setUint32(footer + PADDED_SIZE_INDEX, bytes.length, true)
  view.setUint32(footer + SAVE_TYPE_INDEX, info?.saveType ?? 0, true)
  view.setUint32(footer + ADDRESS_SIZE_INDEX, info?.addressSize ?? 0, true)
  view.setUint32(footer + SAVE_SIZE_INDEX, sized(info?.saveSize), true)
  view.setUint32(footer + VERSION_NUMBER_INDEX, info?.versionNumber ?? 0, true)
  for (let i = 0; i < DESMUME_COOKIE.length; i++) {
    dsv[footer + COOKIE_INDEX + i] = DESMUME_COOKIE.charCodeAt(i)
  }

  return dsv
}

/**
 * Swaps a file name's extension.
 * @param name Original file name.
 * @param extension Extension to end up with, without the dot.
 * @returns the renamed file.
 */
export function renameExtension (name: string, extension: string): string {
  return `${name.replace(/\.[^.]*$/, '')}.${extension}`
}

/**
 * Hands bytes to the browser as a download.
 * @param name File name to save as.
 * @param bytes Content of the file.
 */
export function downloadBytes (name: string, bytes: Uint8Array): void {
  const url: string = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/octet-stream' }))
  const link: HTMLAnchorElement = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      bufferToDsvInfo,
      downloadBytes,
      dsvToSav,
      fileToDsv,
      fromBase64,
      isDsv,
      renameExtension,
      savToDsv
    }
  }
})
