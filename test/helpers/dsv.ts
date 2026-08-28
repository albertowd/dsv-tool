/**
 * Builders for synthetic DSV byte buffers, mirroring the footer layout that
 * `app/plugins/dsv-tools.client.ts` parses.
 */

export const DSV_FOOTER_LENGTH: number = 40
export const DESMUME_COOKIE: string = '|-DESMUME SAVE-|'

export interface DsvParts {
  actuallyWrittenSize?: number
  addressSize?: number
  cookie?: string
  header?: string
  paddedSize?: number
  saveSize?: number
  saveType?: number
  versionNumber?: number
}

/**
 * Builds a DSV buffer: `paddedSize` bytes of save data, then the header text,
 * then the 40 byte footer.
 * @param parts Footer values to encode; each defaults to a distinct number so
 *              a mis-indexed read shows up as the wrong field.
 * @returns the assembled bytes.
 */
export function buildDsvBuffer (parts: DsvParts = {}): Uint8Array {
  const {
    actuallyWrittenSize = 512,
    addressSize = 24,
    cookie = DESMUME_COOKIE,
    header = 'HEADER',
    paddedSize = 64,
    saveSize = 256,
    saveType = 3,
    versionNumber = 1
  } = parts

  const headerBytes: number[] = [...header].map((c: string): number => c.charCodeAt(0))
  const bytes = new Uint8Array(paddedSize + headerBytes.length + DSV_FOOTER_LENGTH)

  // Save data: non-zero so an off-by-one header read is visible.
  bytes.fill(0x41, 0, paddedSize)
  bytes.set(headerBytes, paddedSize)

  const footer: number = paddedSize + headerBytes.length
  const view = new DataView(bytes.buffer)
  view.setUint32(footer + 0, actuallyWrittenSize, true)
  view.setUint32(footer + 4, paddedSize, true)
  view.setUint32(footer + 8, saveType, true)
  view.setUint32(footer + 12, addressSize, true)
  view.setUint32(footer + 16, saveSize, true)
  view.setUint32(footer + 20, versionNumber, true)
  bytes.set([...cookie].map((c: string): number => c.charCodeAt(0)), footer + 24)

  return bytes
}

/**
 * Wraps bytes in a `File`, as the file input would hand them over.
 * @param bytes Content of the file.
 * @param name File name.
 * @param lastModified Modification timestamp.
 * @returns the file.
 */
export function toFile (bytes: Uint8Array, name: string = 'save.dsv', lastModified: number = 1_700_000_000_000): File {
  return new File([bytes as BlobPart], name, { lastModified })
}
