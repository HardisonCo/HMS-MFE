import setCssVar from '../../utils/css-var/set-css-var.js'
import { noop } from '../../utils/event/event.js'
import { onKeyDownComposition } from '../../utils/private.keyboard/key-composition.js'

import { isRuntimeSsrPreHydration, client } from '../platform/Platform.js'

function getMobilePlatform (is) {
  if (is.ios === true) return 'ios'
  if (is.android === true) return 'android'
}

function getBodyClasses ({ is, has, within }, cfg) {
  const cls = [
    is.desktop === true ? 'desktop' : 'mobile',
    `${ has.touch === false ? 'no-' : '' }touch`
  ]

  if (is.mobile === true) {
    const mobile = getMobilePlatform(is)
    mobile !== void 0 && cls.push('platform-' + mobile)
  }

  if (is.nativeMobile === true) {
    const type = is.nativeMobileWrapper

    cls.push(type)
    cls.push('native-mobile')

    if (
      is.ios === true
      && (cfg[ type ] === void 0 || cfg[ type ].iosStatusBarPadding !== false)
    ) {
      cls.push('q-ios-padding')
    }
  }
  else if (is.electron === true) {
    cls.push('electron')
  }
  else if (is.bex === true) {
    cls.push('bex')
  }

  within.iframe === true && cls.push('within-iframe')

  return cls
}

function applyClientSsrCorrections () {
  const { is } = client
  const classes = document.body.className

  const classList = new Set(classes.replace(/ {2}/g, ' ').split(' '))

  if (is.nativeMobile !== true && is.electron !== true && is.bex !== true) {
    if (is.desktop === true) {
      classList.delete('mobile')
      classList.delete('platform-ios')
      classList.delete('platform-android')
      classList.add('desktop')
    }
    else if (is.mobile === true) {
      classList.delete('desktop')
      classList.add('mobile')

      classList.delete('platform-ios')
      classList.delete('platform-android')

      const mobile = getMobilePlatform(is)
      if (mobile !== void 0) {
        classList.add(`platform-${ mobile }`)
      }
    }
  }

  if (client.has.touch === true) {
    classList.delete('no-touch')
    classList.add('touch')
  }

  if (client.within.iframe === true) {
    classList.add('within-iframe')
  }

  const newCls = Array.from(classList).join(' ')

  if (classes !== newCls) {
    document.body.className = newCls
  }
}

function setColors (brand) {
  for (const color in brand) {
    setCssVar(color, brand[ color ])
  }
}

export default {
  install (opts) {
    if (__QUASAR_SSR_SERVER__) {
      const { $q, ssrContext } = opts
      const cls = getBodyClasses($q.platform, $q.config)

      if ($q.config.screen?.bodyClass === true) {
        cls.push('screen--xs')
      }

      ssrContext._meta.bodyClasses += cls.join(' ')

      const brand = $q.config.brand
      if (brand !== void 0) {
        const vars = Object.keys(brand)
          .map(key => `--q-${ key }:${ brand[ key ] };`)
          .join('')

        ssrContext._meta.endingHeadTags += `<style>:root{${ vars }}</style>`
      }

      return
    }

    if (this.__installed === true) return

    if (isRuntimeSsrPreHydration.value === true) {
      applyClientSsrCorrections()
    }
    else {
      const { $q } = opts

      $q.config.brand !== void 0 && setColors($q.config.brand)

      const cls = getBodyClasses(client, $q.config)
      document.body.classList.add.apply(document.body.classList, cls)
    }

    if (client.is.ios === true) {
      // needed for iOS button active state
      document.body.addEventListener('touchstart', noop)
    }

    window.addEventListener('keydown', onKeyDownComposition, true)
  }
}
