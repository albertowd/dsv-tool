import Vue from 'vue'

import Sav from '~/models/Sav'
import DsvFooter from '~/models/DsvFooter'
import DsvInfo from '~/models/DsvInfo'

declare module 'vue/types/vue' {
  interface Vue {
    $downloadableDsv(sav: Sav): string
    $downloadableHistory(savs: Sav[]): string
    $downloadableSav(sav: Sav): string
    $fileToSav(file: File): Promise<Sav>
  }
}

/**
 * Tries to parse a DSV file buffer to fetch DSV informations.
 * @param buffer Buffer to read the DSV file.
 * @returns a DsvInfo object about the DSV file.
 */
function bufferToDsvInfo (buffer: Buffer): DsvInfo {
  const dsv: DsvInfo = new DsvInfo()

  const footerLength: number = DsvFooter.cookie.index + DsvFooter.cookie.default.length
  const payloadIndex: number = buffer.length - footerLength
  if (payloadIndex > 0) {
    dsv.actuallyWrittenSize = buffer.readUInt32LE(payloadIndex + DsvFooter.actuallyWrittenSize.index)
    dsv.addressSize = buffer.readUInt32LE(payloadIndex + DsvFooter.addressSize.index)
    dsv.cookie = buffer.toString('ascii', payloadIndex + DsvFooter.cookie.index)
    dsv.paddedSize = buffer.readUInt32LE(payloadIndex + DsvFooter.paddedSize.index)
    dsv.saveSize = buffer.readUInt32LE(payloadIndex + DsvFooter.saveSize.index)
    dsv.saveType = buffer.readUInt32LE(payloadIndex + DsvFooter.saveType.index)
    dsv.versionNumber = buffer.readUInt32LE(payloadIndex + DsvFooter.versionNumber.index)

    if (buffer.length > dsv.paddedSize + footerLength) {
      dsv.header = buffer.toString('ascii', dsv.paddedSize, payloadIndex)
    } else {
      const msg: string = `buffer size (${buffer.length}) < dsv.paddedSize (${dsv.paddedSize}) + footerLength (${footerLength})`
      throw new Error(`Corrupted DSV buffer information:\n\t${msg}.`)
    }
  } else {
    throw new Error('DSV buffer is too small to have a valid content.')
  }

  return dsv
}

/**
 * Returns the downloadable address, if its a Dsv file or the
 * converted Dsv File if its was a Sav file.
 * @param sav Sav object to convert to File.
 * @returns The original or converted downloadable address.
 */
function downloadableDsv (sav: Sav): string {
  // Test if its a Dsv file.
  if (sav.dsv.addressSize > 0) {
    const blob: Blob = new Blob([Buffer.from(sav.base64, 'base64')], { type: 'application/octet-stream' })
    return window.URL.createObjectURL(blob)
  } else {
    // If its a Sav file, add the default footer to it.
    const dsvBuffer = Buffer.concat([Buffer.from(sav.base64, 'base64'), defaultDsvCookieBuffer()])
    const blob: Blob = new Blob([dsvBuffer], { type: 'application/octet-stream' })
    return window.URL.createObjectURL(blob)
  }
}

function downloadableHistory (savs: Sav[]): string {
  const blob: Blob = new Blob([Buffer.from(JSON.stringify(savs))], { type: 'application/octet-stream' })
  return window.URL.createObjectURL(blob)
}

/**
 * Returns the downloadable address, if its a Sav file or the
 * converted Sav File if its was a Dsv file.
 * @param sav Sav object to convert to File.
 * @returns The original or converted downloadable address.
 */
function downloadableSav (sav: Sav): string {
  // Test if its a Dsv file.
  if (sav.dsv.addressSize > 0) {
    // If its a Dsv file, remove the Dsv footer.
    const blob = new Blob([Buffer.from(sav.base64, 'base64').buffer.slice(0, sav.dsv.paddedSize)])
    return window.URL.createObjectURL(blob)
  } else {
    const blob = new Blob([Buffer.from(sav.base64, 'base64')])
    return window.URL.createObjectURL(blob)
  }
}

function defaultDsvCookieBuffer (): Buffer {
  const footerLength: number = DsvFooter.cookie.index + DsvFooter.cookie.default.length
  const footerOffset: number = -DsvFooter.header.index
  const footer: Buffer = Buffer.alloc(footerLength + footerOffset)

  footer.write(DsvFooter.header.default, 'ascii')
  footer.write(DsvFooter.cookie.default, footerOffset + DsvFooter.cookie.index, 'ascii')
  footer.writeUInt32LE(DsvFooter.actuallyWrittenSize.default, footerOffset + DsvFooter.actuallyWrittenSize.index)
  footer.writeUInt32LE(DsvFooter.addressSize.default, footerOffset + DsvFooter.addressSize.index)
  footer.writeUInt32LE(DsvFooter.paddedSize.default, footerOffset + DsvFooter.paddedSize.index)
  footer.writeUInt32LE(DsvFooter.saveSize.default, footerOffset + DsvFooter.saveSize.index)
  footer.writeUInt32LE(DsvFooter.saveType.default, footerOffset + DsvFooter.saveType.index)
  footer.writeUInt32LE(DsvFooter.versionNumber.default, footerOffset + DsvFooter.versionNumber.index)
  return footer
}

async function fileToSav (file: File): Promise<Sav> {
  const sav: Sav = new Sav()
  sav.name = file.name
  sav.lastModified = file.lastModified
  sav.size = file.size

  try {
    // Saves the file as a Base64 string.
    const buffer: Buffer = Buffer.from(await file.arrayBuffer())
    sav.base64 = buffer.toString('base64')

    // Tries to parse the Dsv info, if its a Dsv file.
    if (sav.name.endsWith('.dsv')) {
      sav.dsv = bufferToDsvInfo(buffer)
    }
  } catch (error) {
    sav.error = error
  }

  return sav
}

Vue.prototype.$downloadableDsv = downloadableDsv
Vue.prototype.$downloadableHistory = downloadableHistory
Vue.prototype.$downloadableSav = downloadableSav
Vue.prototype.$fileToSav = fileToSav
