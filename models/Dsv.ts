import DsvInfo from './DsvInfo'

let DsvUID: number = 0

export default class Dsv {
  __base64: string = ''
  __error: Error | null = null
  __id: number = DsvUID++
  __info: DsvInfo = new DsvInfo()
  __lastModified: number = Date.now()
  __name: string = '-'
  __size: number = 0

  get base64 (): string {
    return this.__base64
  }

  get error (): Error | null {
    return this.__error
  }

  get id (): number {
    return this.__id
  }

  get info (): DsvInfo {
    return this.__info
  }

  get lastModified (): number {
    return this.__lastModified
  }

  get name (): string {
    return this.__name
  }

  get size (): number {
    return this.__size
  }

  set base64 (base64: string) {
    this.__base64 = base64
  }

  set error (error: Error | null) {
    this.__error = error
  }

  set info (info: DsvInfo) {
    this.__info.actuallyWrittenSize = info.actuallyWrittenSize
    this.__info.addressSize = info.addressSize
    this.__info.cookie = info.cookie
    this.__info.header = info.header
    this.__info.paddedSize = info.paddedSize
    this.__info.saveSize = info.saveSize
    this.__info.saveType = info.saveType
    this.__info.versionNumber = info.versionNumber
  }

  set lastModified (lastModified: number) {
    this.__lastModified = lastModified
  }

  set name (name: string) {
    this.__name = name
  }

  set size (size: number) {
    this.__size = size
  }
}
