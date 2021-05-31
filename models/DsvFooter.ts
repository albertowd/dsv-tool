export default class DsvFooter {
  static readonly actuallyWrittenSize = {
    default: 524288,
    index: 0
  }

  static readonly addressSize = {
    default: 3,
    index: 12
  }

  static readonly cookie = {
    default: '|-DESMUME SAVE-|',
    index: 24
  }

  static readonly header = {
    default: '|<--Snip above here to create a raw sav by excluding this DeSmuME savedata footer:',
    index: -82
  }

  static readonly paddedSize = {
    default: 524288,
    index: 4
  }

  static readonly saveSize = {
    default: 524288,
    index: 16
  }

  static readonly saveType = {
    default: 0,
    index: 8
  }

  static readonly versionNumber = {
    default: 0,
    index: 20
  }
}
