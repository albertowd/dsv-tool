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

export default defineNuxtPlugin(() => {
  return {
    provide: {
      bufferToDsvInfo,
      fileToDsv,
      isDsv
    }
  }
})
