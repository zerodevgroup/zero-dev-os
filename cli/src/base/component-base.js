class ComponentBase {
  constructor(options) {
    this.options = options

    this.utils = require(`${this.options.zeroDevOSDir}/cli/src/utils/zero-dev-utils`)
  }
}

module.exports = ComponentBase
