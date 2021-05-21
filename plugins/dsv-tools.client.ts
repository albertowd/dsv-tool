import Vue from 'vue'

import Dsv from '~/models/Dsv'
import DsvInfo from '~/models/DsvInfo'

declare module 'vue/types/vue' {
  interface Vue {
    $bufferToDsvInfo(buffer: Buffer): DsvInfo
    $fileToDsv(file: File): Promise<Dsv>
  }
}

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
 * Tries to parse a DSV file buffer to fetch DSV informations.
 * @param buffer Buffer to read the DSV file.
 * @returns a DsvInfo object about the DSV file.
 */
function bufferToDsvInfo (buffer: Buffer): DsvInfo {
  const info: DsvInfo = new DsvInfo()

  const payloadIndex: number = buffer.length - DSV_FOOTER_LENGTH
  if (payloadIndex > 0) {
    info.actuallyWrittenSize = buffer.readUInt32LE(payloadIndex + ACTUALLY_WRITTEN_SIZE_INDEX)
    info.addressSize = buffer.readUInt32LE(payloadIndex + ADDRESS_SIZE_INDEX)
    info.cookie = buffer.toString('ascii', payloadIndex + COOKIE_INDEX)
    info.paddedSize = buffer.readUInt32LE(payloadIndex + PADDED_SIZE_INDEX)
    info.saveSize = buffer.readUInt32LE(payloadIndex + SAVE_SIZE_INDEX)
    info.saveType = buffer.readUInt32LE(payloadIndex + SAVE_TYPE_INDEX)
    info.versionNumber = buffer.readUInt32LE(payloadIndex + VERSION_NUMBER_INDEX)

    if (buffer.length > info.paddedSize + DSV_FOOTER_LENGTH) {
      info.header = buffer.toString('ascii', info.paddedSize, payloadIndex)
    } else {
      const msg: string = `buffer size (${buffer.length}) < info.paddedSize (${info.paddedSize}) + DSV_FOOTER_LENGTH (${DSV_FOOTER_LENGTH})`
      throw new Error(`Corrupted DSV buffer information:\n\t${msg}.`)
    }
  } else {
    throw new Error('DSV buffer is too small to have a valid content.')
  }

  return info
}

async function fileToDsv (file: File): Promise<Dsv> {
  const dsv: Dsv = new Dsv()
  dsv.name = file.name
  dsv.lastModified = file.lastModified
  dsv.size = file.size

  try {
    const buffer: Buffer = Buffer.from(await file.arrayBuffer())
    dsv.base64 = buffer.toString('base64')
    dsv.info = bufferToDsvInfo(buffer)
  } catch (error) {
    dsv.error = error
    console.error(`Error trying to parse file ${file.name}: ${error.message}`)
    console.error(error)
  }

  return dsv
}

Vue.prototype.$bufferToDsvInfo = bufferToDsvInfo
Vue.prototype.$fileToDsv = fileToDsv
