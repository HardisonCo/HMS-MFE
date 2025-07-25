import fs from 'fs-extra'
import path from 'node:path'
import { merge } from 'webpack-merge'
import semver from 'semver'
import { parseJSON, stringifyJSON } from 'confbox'

import { warn, fatal } from '../../utils/logger.js'
import { getPackageJson } from '../../utils/get-package-json.js'
import { getCallerPath } from '../../utils/get-caller-path.js'
import { BaseAPI } from './BaseAPI.js'

/**
 * API for extension's /install.js script
 */
export class InstallAPI extends BaseAPI {
  prompts

  constructor (opts, appExtJson) {
    super(opts)

    this.prompts = opts.prompts
    this.#appExtJson = appExtJson
  }

  /**
   * Get the internal persistent config of this extension.
   * Returns empty object if it has none.
   *
   * @return {object} cfg
   */
  getPersistentConf () {
    return this.#appExtJson.getInternal(this.extId)
  }

  /**
   * Set the internal persistent config of this extension.
   * If it already exists, it is overwritten.
   *
   * @param {object} cfg
   */
  setPersistentConf (cfg) {
    this.#appExtJson.setInternal(this.extId, cfg || {})
  }

  /**
   * Deep merge into the internal persistent config of this extension.
   * If extension does not have any config already set, this is
   * essentially equivalent to setting it for the first time.
   *
   * @param {object} cfg
   */
  mergePersistentConf (cfg = {}) {
    const currentCfg = this.getPersistentConf()
    this.setPersistentConf(merge({}, currentCfg, cfg))
  }

  /**
   * Ensure the App Extension is compatible with
   * host app installed package through a
   * semver condition.
   *
   * If the semver condition is not met, then
   * @quasar/app-vite errors out and halts execution
   *
   * Example of semver condition:
   *   '1.x || >=2.5.0 || 5.0.0 - 7.2.3'
   *
   * @param {string} packageName
   * @param {string} semverCondition
   */
  compatibleWith (packageName, semverCondition) {
    const json = getPackageJson(packageName, this.appDir)

    if (json === void 0) {
      fatal(`Extension(${ this.extId }): Dependency not found - ${ packageName }. Please install it.`)
    }

    if (!semver.satisfies(json.version, semverCondition)) {
      fatal(`Extension(${ this.extId }): is not compatible with ${ packageName } v${ json.version }. Required version: ${ semverCondition }`)
    }
  }

  /**
   * Check if an app package is installed. Can also
   * check its version against specific semver condition.
   *
   * Example of semver condition:
   *   '1.x || >=2.5.0 || 5.0.0 - 7.2.3'
   *
   * @param {string} packageName
   * @param {string} semverCondition
   * @return {boolean} package is installed and meets optional semver condition
   */
  hasPackage (packageName, semverCondition) {
    const json = getPackageJson(packageName, this.appDir)

    if (json === void 0) {
      return false
    }

    return semverCondition !== void 0
      ? semver.satisfies(json.version, semverCondition)
      : true
  }

  /**
   * Check if another app extension is installed
   * (app extension npm package is installed and it was invoked)
   *
   * @param {string} extId
   * @return {boolean} has the extension installed & invoked
   */
  hasExtension (extId) {
    return this.#appExtJson.has(extId)
  }

  /**
   * Get the version of an an app's package.
   *
   * @param {string} packageName
   * @return {string|undefined} version of app's package
   */
  getPackageVersion (packageName) {
    const json = getPackageJson(packageName, this.appDir)
    return json !== void 0
      ? json.version
      : void 0
  }

  /**
   * Extend package.json with new props.
   * If specifying existing props, it will override them.
   *
   * @param {object|string} extPkg - Object to extend with or relative path to a JSON file
   */
  extendPackageJson (extPkg) {
    if (!extPkg) return

    if (typeof extPkg === 'string') {
      const dir = getCallerPath()
      const source = path.resolve(dir, extPkg)

      if (!fs.existsSync(source)) {
        warn()
        warn(`Extension(${ this.extId }): extendPackageJson() - cannot locate ${ extPkg }. Skipping...`)
        warn()
        return
      }
      if (fs.lstatSync(source).isDirectory()) {
        warn()
        warn(`Extension(${ this.extId }): extendPackageJson() - "${ extPkg }" is a folder instead of file. Skipping...`)
        warn()
        return
      }

      try {
        extPkg = JSON.parse(
          fs.readFileSync(source, 'utf-8')
        )
      }
      catch (_) {
        warn(`Extension(${ this.extId }): extendPackageJson() - "${ extPkg }" is malformed`)
        warn()
        process.exit(1)
      }
    }

    if (
      Object(extPkg) !== extPkg
      || Object.keys(extPkg).length === 0
    ) return

    const pkg = merge({}, this.ctx.pkg.appPkg, extPkg)

    fs.writeFileSync(
      this.resolve.app('package.json'),
      stringifyJSON(pkg),
      'utf-8'
    )

    if (
      extPkg.dependencies
      || extPkg.devDependencies
      || extPkg.optionalDependencies
      || extPkg.bundleDependencies
      || extPkg.peerDependencies
    ) {
      this.#needsNodeModulesUpdate = true
    }
  }

  /**
   * Extend a JSON file with new props (deep merge).
   * If specifying existing props, it will override them.
   *
   * @param {string} file (relative path to app root folder)
   * @param {object} newData (Object to merge in)
   */
  extendJsonFile (file, newData) {
    if (newData !== void 0 && Object(newData) === newData && Object.keys(newData).length > 0) {
      const filePath = this.resolve.app(file)

      // Try to parse the JSON with Node native tools.
      // It will soft-fail and log a warning if the JSON isn't parseable
      //  which usually means we are dealing with an extended JSON flavour,
      //  for example JSON with comments or JSON5.
      // Notable examples are TS 'tsconfig.json' or VSCode 'settings.json'
      // TODO: use parseJSONC/stringifyJSONC from confbox
      try {
        const existingData = fs.existsSync(filePath) ? parseJSON(fs.readFileSync(filePath, 'utf-8')) : {}
        const data = merge({}, existingData, newData)

        fs.writeFileSync(
          this.resolve.app(file),
          // if file exists, preserve indentation, otherwise use 2 spaces
          stringifyJSON(data, { indent: Object.keys(existingData).length > 0 ? undefined : 2 }),
          'utf-8'
        )
      }
      catch (_) {
        warn()
        warn(`Extension(${ this.extId }): extendJsonFile() - "${ filePath }" doesn't conform to JSON format: this could happen if you are trying to update flavoured JSON files (eg. JSON with Comments or JSON5). Skipping...`)
        warn(`Extension(${ this.extId }): extendJsonFile() - The extension tried to apply these updates to "${ filePath }" file: ${ JSON.stringify(newData) }`)
        warn()
      }
    }
  }

  /**
   * Render a folder from extension templates into devland.
   * Needs a path (to a folder) relative to the path of the file where render() is called
   *
   * @param {string} templatePath (relative path to folder to render in app)
   * @param {object} scope (optional; rendering scope variables)
   */
  render (templatePath, scope) {
    const dir = getCallerPath()
    const source = path.resolve(dir, templatePath)
    const rawCopy = !scope || Object.keys(scope).length === 0

    if (!fs.existsSync(source)) {
      warn()
      warn(`Extension(${ this.extId }): render() - cannot locate ${ templatePath }. Skipping...\n`)
      return
    }
    if (!fs.lstatSync(source).isDirectory()) {
      warn()
      warn(`Extension(${ this.extId }): render() - "${ templatePath }" is a file instead of folder. Skipping...\n`)
      return
    }

    this.#hooks.renderFolders.push({
      source,
      rawCopy,
      scope
    })
  }

  /**
   * Render a file from extension template into devland
   * Needs a path (to a file) relative to the path of the file where renderFile() is called
   *
   * @param {string} relativeSourcePath (file path relative to the folder from which the install script is called)
   * @param {string} relativeTargetPath (file path relative to the root of the app -- including filename!)
   * @param {object} scope (optional; rendering scope variables)
   */
  renderFile (relativeSourcePath, relativeTargetPath, scope) {
    const dir = getCallerPath()
    const sourcePath = path.resolve(dir, relativeSourcePath)
    const targetPath = this.resolve.app(relativeTargetPath)
    const rawCopy = !scope || Object.keys(scope).length === 0

    if (!fs.existsSync(sourcePath)) {
      warn()
      warn(`Extension(${ this.extId }): renderFile() - cannot locate ${ relativeSourcePath }. Skipping...\n`)
      return
    }
    if (fs.lstatSync(sourcePath).isDirectory()) {
      warn()
      warn(`Extension(${ this.extId }): renderFile() - "${ relativeSourcePath }" is a folder instead of a file. Skipping...\n`)
      return
    }

    this.#hooks.renderFiles.push({
      sourcePath,
      targetPath,
      rawCopy,
      scope,
      overwritePrompt: true
    })
  }

  /**
   * Add a message to be printed after App CLI finishes up install.
   *
   * @param {string} msg
   */
  onExitLog (msg) {
    this.#hooks.exitLog.push(msg)
  }

  /**
   * Private stuff; to NOT be used in devland
   */

  #appExtJson
  #needsNodeModulesUpdate = false

  __getNodeModuleNeedsUpdate (appExtJson) {
    // protect against external access
    if (appExtJson === this.#appExtJson) {
      return this.#needsNodeModulesUpdate
    }
  }

  #hooks = {
    renderFolders: [],
    renderFiles: [],
    exitLog: []
  }

  __getHooks (appExtJson) {
    // protect against external access
    if (appExtJson === this.#appExtJson) {
      return this.#hooks
    }
  }
}
