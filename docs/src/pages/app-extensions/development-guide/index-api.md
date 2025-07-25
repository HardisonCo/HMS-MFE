---
title: App Extension Index API
desc: The API for the index script of a Quasar App Extension. Provides access to Quasar context, registers new CLI commands, extends Webpack config and more.
---

This page refers to `src/index.js` file, which is executed on `quasar dev` and `quasar build`. This is the main process where you can modify the build to suit the needs of your App Extension. For instance, registering a boot file, modifying the webpack process, registering CSS, registering a UI component, registering a Quasar CLI command, etc.

Example of basic structure of the file:

```js
// can be async
export default function (api) {
  // props & methods for "api" Object described below
}
```

### api.ctx
Same as the `ctx` from the `/quasar.config` file. Helps you make decisions based on the context in which `quasar dev` or `quasar build` runs.

Example: You might want to use one of the api methods if running for electron mode only.

```js
if (api.ctx.dev === true && api.ctx.mode.electron === true) {
  api.beforeDev((api) => {
    // do something when running quasar dev and
    // with Electron mode
  })
}
```

### api.engine
Contains the Quasar CLI engine (as String) being used. Examples: `@quasar/app-vite` or `@quasar/app-webpack`.

### api.hasVite
Boolean - is running on `@quasar/app-vite` or not.

### api.hasWebpack
Boolean - is running on `@quasar/app-webpack` or not.

### api.extId
Contains the `ext-id` (String) of this App Extension.

### api.prompts
Is an Object which has the answers to the prompts when this App Extension got installed. For more info on prompts, check out [Prompts API](/app-extensions/development-guide/prompts-api).

### api.resolve
Resolves paths within the app on which this App Extension is running. Eliminates the need to import `path` and resolve the paths yourself.

```js
// resolves to root of app
api.resolve.app('src/my-file.js')

// resolves to root/src of app
api.resolve.src('my-file.js')

// resolves to root/public of app
// (@quasar/app-webpack v3.4+ or @quasar/app-vite v1+)
api.resolve.public('my-image.png')

// resolves to root/src-pwa of app
api.resolve.pwa('some-file.js')

// resolves to root/src-ssr of app
api.resolve.ssr('some-file.js')

// resolves to root/src-cordova of app
api.resolve.cordova('config.xml')

// resolves to root/src-electron of app
api.resolve.electron('some-file.js')

// resolves to root/src-electron of app
api.resolve.electron('some-file.js')

// resolves to root/src-bex of app
api.resolve.bex('some-file.js')
```

### api.appDir
Contains the full path (String) to the root of the app on which this App Extension is running.

### api.hasTypescript <q-badge label="@quasar/app-vite 1.6+" /> <q-badge label="@quasar/app-webpack 3.11+" />

```js
/**
 * @return {Promise<boolean>} host project has Typescript active or not
 */
await api.hasTypescript()
```

### api.hasLint <q-badge label="@quasar/app-vite 1.6+" /> <q-badge label="@quasar/app-webpack 3.11+" />

```js
/**
 * @return {Promise<boolean>} host project has ESLint or not
 */
await api.hasLint()
```

### api.getStorePackageName <q-badge label="@quasar/app-vite 1.6+" /> <q-badge label="@quasar/app-webpack 3.11+" />

```js
/**
 * @return {Promise<string|undefined>} 'pinia' | 'vuex' | undefined
 */
await api.getStorePackageName()
```

### api.getNodePackagerName <q-badge label="@quasar/app-vite 1.6+" /> <q-badge label="@quasar/app-webpack 3.11+" />

```js
/**
 * @return {Promise<'npm' | 'yarn' | 'pnpm' | 'bun'>}
 */
await api.getNodePackagerName()
```

### api.compatibleWith

Ensure the App Extension is compatible with a package installed in the host app through a semver condition.

If the semver condition is not met, then @quasar/app errors out and halts execution.

Example of semver condition: `'1.x || >=2.5.0 || 5.0.0 - 7.2.3'`.

```js
/**
 * @param {string} packageName
 * @param {string} semverCondition
 */
api.compatibleWith('@quasar/app', '1.x')
```

```js A more complex example
if (api.hasVite === true) {
  api.compatibleWith('@quasar/app-vite', '^2.0.0')
}
else {
  api.compatbileWith('@quasar/app-webpack', '^4.0.0')
}
```

### api.hasPackage

Determine if some package is installed in the host app through a semver condition.

Example of semver condition: `'1.x || >=2.5.0 || 5.0.0 - 7.2.3'`.

```js
/**
 * @param {string} packageName
 * @param {string} (optional) semverCondition
 * @return {boolean} package is installed and meets optional semver condition
 */
if (api.hasPackage('vuelidate')) {
  // hey, this app has it (any version of it)
}
if (api.hasPackage('quasar', '^2.0.0')) {
  // hey, this app has Quasar UI v2 installed
}
```

### api.hasExtension
Check if another app extension is npm installed and Quasar CLI has invoked it.

```js
/**
 * Check if another app extension is installed
 *
 * @param {string} extId
 * @return {boolean} has the extension installed & invoked
 */
if (api.hasExtension(extId)) {
  // hey, we have it
}
```

### api.getPackageVersion

Get the version of a host app package.

```js
/**
 * @param {string} packageName
 * @return {string|undefined} version of app's package
 */
console.log( api.getPackageVersion(packageName) )
// output examples:
//   1.1.3
//   undefined (when package not found)
```

### api.extendQuasarConf
Extends quasar.config file

```js
/**
 * @param {function} fn
 *   (cfg: Object, ctx: Object) => undefined
 */
api.extendQuasarConf ((conf, api) => {
  // do something with quasar.config file:
  // add, change anything
})
```

```js A more complex example:
api.extendQuasarConf ((conf, api) => {
  if (api.hasVite === true) {
    // do something with quasar.config file that is specific
    // to @quasar/app-vite
  }
  else { // api.hasWebpack === true
    // do something with quasar.config file that is specific
    // to @quasar/app-webpack
  }
})
```

#### Registering boot and css files

```js
export default function (api, ctx) {
  api.extendQuasarConf((conf, api) => {
    // make sure my-ext boot file is registered
    conf.boot.push('~quasar-app-extension-my-ext/src/boot/my-ext-bootfile.js')

    if (api.hasVite !== true) {
      // make sure boot file transpiles
      conf.build.webpackTranspileDependencies.push(/quasar-app-extension-my-ext[\\/]src[\\/]boot/)
      // if boot file imports anything, make sure that
      // the regex above matches those files too!
    }

    // make sure my-ext css goes through webpack
    conf.css.push('~quasar-app-extension-my-ext/src/component/my-ext.sass')
  })
}
```

::: tip
Notice the tidle (`~`) in front of the paths. This tells Quasar CLI that the path is a dependency from node_modules instead of a relative path to App Extension index script file.
:::

### api.registerCommand
Register a command that will become available as `quasar run <ext-id> <cmd> [args]` (or the short form: `quasar <ext-id> <cmd> [args]`).

```js
/**
 * @param {string} commandName
 * @param {function} fn
 *   ({ args: [ string, ... ], params: {object} }) => ?Promise
 */
api.registerCommand('start', ({ args, params }) => {
  // do something here

  // this registers the "start" command
  // and this handler is executed when running
  // $ quasar run <ext-id> start
})
```

### api.registerDescribeApi
Register an API file for `$ quasar describe` command.

```js
/**
 * @param {string} name
 * @param {string} relativePath
 *   (relative path starting from the file where you have this call)
 */
api.registerDescribeApi(
  'MyComponent',
  './relative/path/to/my/component/file.json'
)
```

The above will then respond to `$ quasar describe MyComponent`.

For syntax of such a JSON file, look into `/node_modules/quasar/dist/api` (in your project folder). Be aware that your JSON must contain a `type` property ("component", "directive", "plugin"). For instance:

```json
{
  "type": "component",
  "props": {
  },
  ...
}
```

::: tip
Always test with the `quasar describe` command to ensure you got the syntax right and there are no errors.
:::

### api.getPersistentConf

Get the internal persistent config of this extension. Returns empty object if it has none.

```js
/**
 * @return {object} cfg
 */
api.getPersistentConf()
```

### api.setPersistentConf

Set the internal persistent config of this extension. If it already exists, it is overwritten.

```js
/**
 * @param {object} cfg
 */
api.setPersistentConf({
  // ....
})
```

### api.mergePersistentConf

Deep merge into the internal persistent config of this extension. If extension does not have any config already set, this is essentially equivalent to setting it for the first time.

```js
/**
 * @param {object} cfg
 */
api.mergePersistentConf({
  // ....
})
```

### api.beforeDev

Prepare external services before `$ quasar dev` command runs, like starting some backend or any other service that the app relies on.

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   (api, { quasarConf }) => ?Promise
 */
api.beforeDev((api, { quasarConf }) => {
  // do something
})
```

### api.afterDev

Run hook after Quasar dev server is started (`$ quasar build`). At this point, the dev server has been started and is available should you wish to do something with it.

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   (api, { quasarConf }) => ?Promise
 */
api.afterDev((api, { quasarConf }) => {
  // do something
})
```

### api.beforeBuild

Run hook before Quasar builds app for production (`$ quasar build`). At this point, the distributables folder hasn't been created yet.

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   (api, { quasarConf }) => ?Promise
 */
api.beforeBuild((api, { quasarConf }) => {
  // do something
})
```

### api.afterBuild

Run hook after Quasar built app for production (`$ quasar build`). At this point, the distributables folder has been created and is available should you wish to do something with it.

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   (api, { quasarConf }) => ?Promise
 */
api.afterBuild((api, { quasarConf }) => {
  // do something
})
```

### api.onPublish

Run hook if publishing was requested (`$ quasar build -P`), after Quasar built app for production and the afterBuild hook (if specified) was executed.

Can use async/await or directly return a Promise.

```js
/**
 * @param {function} fn
 *   () => ?Promise
 * @param {object} opts
 *   * arg - argument supplied to "--publish"/"-P" parameter
 *   * distDir - folder where distributables were built
 */
api.onPublish((api, opts) => {
  // do something
})
```

## @quasar/app-vite only

### api.extendViteConf

```js
/**
 * @param {function} fn
 *   (viteConf: Object, invoke: Object {isClient, isServer}, api) => undefined
 */
if (api.hasVite === true) {
  api.extendViteConf((viteConf, { isClient, isServer }, api) => {
    // add/remove/change Quasar CLI generated Vite config object
  })
}
```

### api.extendSSRWebserverConf

```js
/**
 * @param {function} fn
 *   (esbuildConf: Object, api) => undefined
 */
if (api.hasVite === true) {
  api.extendSSRWebserverConf((esbuildConf, api) => {
    // add/remove/change Quasar CLI generated esbuild config object
    // that is used for the SSR webserver (includes SSR middlewares)
  })
}
```

### api.extendElectronMainConf

```js
/**
 * @param {function} fn
 *   (esbuildConf: Object, api) => undefined
 */
if (api.hasVite === true) {
  api.extendElectronMainConf((esbuildConf, api) => {
    // add/remove/change Quasar CLI generated esbuild config object
    // that is used for the SSR webserver (includes SSR middlewares)
  })
}
```

### api.extendElectronPreloadConf

```js
/**
 * @param {function} fn
 *   (esbuildConf: Object, api) => undefined
 */
if (api.hasVite === true) {
  api.extendElectronPreloadConf((esbuildConf, api) => {
    // add/remove/change Quasar CLI generated esbuild config object
    // that is used for the SSR webserver (includes SSR middlewares)
  })
}
```

### api.extendPWACustomSWConf

```js
/**
 * @param {function} fn
 *   (esbuildConf: Object, api) => undefined
 */
if (api.hasVite === true) {
  api.extendPWACustomSWConf((esbuildConf, api) => {
    // add/remove/change Quasar CLI generated esbuild config object
    // that is used for the SSR webserver (includes SSR middlewares)
  })
}
```

### api.extendBexScriptsConf

```js
/**
 * @param {function} fn
 *   (esbuildConf: Object, api) => undefined
 */
if (api.hasVite === true) {
  api.extendBexScriptsConf((esbuildConf, api) => {
    // add/remove/change Quasar CLI generated esbuild config object
    // that is used for the SSR webserver (includes SSR middlewares)
  })
}
```

## @quasar/app-webpack only

### api.chainWebpack
Chain webpack config

```js
/**
 * @param {function} fn
 *   (chain: ChainObject, invoke: Object {isClient, isServer}, api) => undefined
 */
if (api.hasWebpack === true) {
  api.chainWebpack((chain, { isClient, isServer }, api) => {
    // add/remove/change chain (Webpack chain Object)
  })
}
```

The configuration is a Webpack chain Object. The API for it is described on [webpack-chain](https://github.com/neutrinojs/webpack-chain) docs.

### api.extendWebpack
Extend webpack config

```js
/**
 * @param {function} fn
 *   (cfg: Object, invoke: Object {isClient, isServer}, api) => undefined
 */
if (api.hasWebpack === true) {
  api.extendWebpack((cfg, { isClient, isServer }, api) => {
    // add/remove/change cfg (Webpack configuration Object)
  })
}
```

### api.chainWebpackMainElectronProcess
Chain webpack config of the main electron process

```js
/**
 * @param {function} fn
 *   (chain: ChainObject) => undefined
 */
if (api.hasWebpack === true) {
  api.chainWebpackMainElectronProcess((chain, { isClient, isServer }, api) => {
    // add/remove/change chain (Webpack chain Object)
  })
}
```

### api.extendWebpackMainElectronProcess
Extend webpack config Object of the main electron process

```js
/**
 * @param {function} fn
 *   (cfg: Object) => undefined
 */
if (api.hasWebpack === true) {
  api.extendWebpackMainElectronProcess((cfg, { isClient, isServer }, api) => {
    // add/remove/change cfg (Webpack configuration Object)
  })
}
```

### api.chainWebpackPreloadElectronProcess
Chain webpack config of the preload electron process

```js
/**
 * @param {function} fn
 *   (chain: ChainObject) => undefined
 */
if (api.hasWebpack === true) {
  api.chainWebpackPreloadElectronProcess((chain, { isClient, isServer }, api) => {
    // add/remove/change chain (Webpack chain Object)
  })
}
```

### api.extendWebpackPreloadElectronProcess
Extend webpack config Object of the preload electron process

```js
/**
 * @param {function} fn
 *   (cfg: Object) => undefined
 */
if (api.hasWebpack === true) {
  api.extendWebpackPreloadElectronProcess((cfg, { isClient, isServer }, api) => {
    // add/remove/change cfg (Webpack configuration Object)
  })
}
```

### api.chainWebpackWebserver

Chain webpack config of SSR webserver (includes the SSR middlewares from /src-ssr/middlewares)

```js
/**
 * @param {function} fn
 *   (chain: ChainObject) => undefined
 */
if (api.hasWebpack === true) {
  api.chainWebpackWebserver ((chain, { isClient, isServer }, api) => {
    // add/remove/change chain (Webpack chain Object)
    // isClient is always "false" and isServer is always "true"
  })
}
```

### api.extendWebpackWebserver

Extend webpack config Object of SSR webserver (includes the SSR middlewares from /src-ssr/middlewares)

```js
/**
 * @param {function} fn
 *   (cfg: Object) => undefined
 */
if (api.hasWebpack === true) {
  api.extendWebpackWebserver((cfg, { isClient, isServer }, api) => {
    // add/remove/change cfg (Webpack configuration Object)
    // isClient is always "false" and isServer is always "true"
  })
}
```

### api.chainWebpackCustomSW

Chain webpack config for the custom service worker when using InjectManifest (content of /src-pwa/custom-service-worker.js):

```js
/**
 * @param {function} fn
 *   (cfg: ChainObject) => undefined
 */
if (api.hasWebpack === true) {
  api.chainWebpackCustomSW ((cfg, { isClient, isServer }, api) => {
    // add/remove/change cfg (Webpack chain Object)
  })
}
```

### api.extendWebpackCustomSW

Extend webpack config Object for the custom service worker when using InjectManifest (content of /src-pwa/custom-service-worker.js):

```js
/**
 * @param {function} fn
 *   (chain: Object) => undefined
 */
if (api.hasWebpack === true) {
  api.extendWebpackCustomSW((chain, { isClient, isServer }, api) => {
    // add/remove/change chain (Webpack configuration Object)
  })
}
```
