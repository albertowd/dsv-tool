export default class DSVInfo {
  __actuallyWrittenSize: number = 0
  __addressSize: number = 0
  __cookie: string = ''
  __header: string = ''
  __paddedSize: number = 0
  __saveSize: number = 0
  __saveType: number = 0
  __versionNumber: number = 0

  get actuallyWrittenSize (): number {
    return this.__actuallyWrittenSize
  }

  get addressSize (): number {
    return this.__addressSize
  }

  get cookie (): string {
    return this.__cookie
  }

  get header (): string {
    return this.__header
  }

  get paddedSize (): number {
    return this.__paddedSize
  }

  get saveSize (): number {
    return this.__saveSize
  }

  get saveType (): number {
    return this.__saveType
  }

  get versionNumber (): number {
    return this.__versionNumber
  }

  set actuallyWrittenSize (actuallyWrittenSize: number) {
    this.__actuallyWrittenSize = actuallyWrittenSize
  }

  set addressSize (addressSize: number) {
    this.__addressSize = addressSize
  }

  set cookie (cookie: string) {
    this.__cookie = cookie
  }

  set header (header: string) {
    this.__header = header
  }

  set paddedSize (paddedSize: number) {
    this.__paddedSize = paddedSize
  }

  set saveSize (saveSize: number) {
    this.__saveSize = saveSize
  }

  set saveType (saveType: number) {
    this.__saveType = saveType
  }

  set versionNumber (versionNumber: number) {
    this.__versionNumber = versionNumber
  }
}
