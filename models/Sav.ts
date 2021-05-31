import DsvInfo from './DsvInfo'

let SavUID: number = 0

export default class Sav {
  __base64: string = ''
  __dsv: DsvInfo = new DsvInfo()
  __error: Error | null = null
  __id: number = SavUID++
  __lastModified: number = Date.now()
  __name: string = '-'
  __size: number = 0

  get base64 (): string {
    return this.__base64
  }

  get dsv (): DsvInfo {
    return this.__dsv
  }

  get error (): Error | null {
    return this.__error
  }

  get id (): number {
    return this.__id
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

  set dsv (dsv: DsvInfo) {
    this.__dsv.actuallyWrittenSize = dsv.actuallyWrittenSize
    this.__dsv.addressSize = dsv.addressSize
    this.__dsv.cookie = dsv.cookie
    this.__dsv.header = dsv.header
    this.__dsv.paddedSize = dsv.paddedSize
    this.__dsv.saveSize = dsv.saveSize
    this.__dsv.saveType = dsv.saveType
    this.__dsv.versionNumber = dsv.versionNumber
  }

  set error (error: Error | null) {
    this.__error = error
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
