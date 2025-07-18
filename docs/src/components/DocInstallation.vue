<template>
  <q-card :id="id" class="doc-installation q-my-xl" flat bordered>
    <div class="header-toolbar row items-center">
      <DocCardTitle :title="props.title" />
    </div>

    <q-tabs class="header-tabs" v-model="currentTab" align="left" active-color="brand-primary" indicator-color="brand-primary" dense :breakpoint="0" shrink>
      <q-tab v-for="tab in tabList" :key="`installation-${tab}`" :name="tab" class="header-btn" no-caps>
        {{ tab }}
      </q-tab>
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="currentTab" animated>
      <q-tab-panel class="q-pa-none" name="Quasar CLI">
        <DocCode :code="QuasarCli" />
      </q-tab-panel>

      <q-tab-panel class="q-pa-none" name="Vite plugin">
        <DocCode :code="ExternalCli" />
      </q-tab-panel>

      <q-tab-panel class="q-pa-none" name="UMD">
        <DocCode :code="UMD" />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'

import DocCode from './DocCode.vue'
import DocCardTitle from './DocCardTitle.vue'

import { slugify } from 'src/assets/page-utils.js'

const props = defineProps({
  components: [ Array, String ],
  directives: [ Array, String ],
  plugins: [ Array, String ],
  config: String,
  title: {
    type: String,
    default: 'Installation'
  }
})

const tabList = [ 'Quasar CLI', 'Vite plugin', 'UMD' ]
const currentTab = ref('Quasar CLI')

const id = computed(() => slugify(props.title))

function nameAsString (name, indent, quotes = true) {
  const wrapper = quotes
    ? str => `'${str}'`
    : str => str

  return Array.isArray(name)
    ? name.map(wrapper).join(',\n' + ''.padStart(indent, ' '))
    : wrapper(name)
}

const quasarConf = computed(() => {
  return props.config !== void 0
    ? `${props.config}: /* look at QuasarConfOptions from the API card */`
    : null
})

const QuasarCli = computed(() => {
  if (props.plugins === void 0 && quasarConf.value === null) {
    return `/*
 * No installation step is necessary.
 * It gets installed by default by @quasar/app-vite or @quasar/app-webpack.
 */`
  }

  const parts = []

  if (props.plugins !== void 0) {
    parts.push(`plugins: [
      ${nameAsString(props.plugins, 6)}
    ]`)
  }

  if (quasarConf.value !== null) {
    parts.push(`config: {
      ${quasarConf.value}
    }`)
  }

  return `// quasar.config file

return {
  framework: {
    ${parts.join(',\n    ')}
  }
}`
})

const UMD = computed(() => {
  const config = quasarConf.value !== null
    ? `

// Optional;
// Place the global quasarConfig Object in a script tag BEFORE your Quasar script tag
app.use(Quasar, {
  config: {
    ${quasarConf.value}
  }
}`
    : ''

  const content = `/*
 * No installation step is necessary.
 * It gets installed by default.
 */`

  return content + config
})

const ExternalCli = computed(() => {
  const types = []
  const imports = ['Quasar']

  ;[ 'components', 'directives', 'plugins' ].forEach(type => {
    if (props[ type ] !== void 0) {
      imports.push(nameAsString(props[ type ], 2, false))
      types.push(`${type}: {
    ${nameAsString(props[ type ], 4, false)}
  }`)
    }
  })

  if (quasarConf.value !== null) {
    types.push(`config: {
    ${quasarConf.value}
  }`)
  }

  return `// main.js

import {
  ${imports.join(',\n  ')}
} from 'quasar'

app.use(Quasar, {
  ${types.join(',\n  ')}
})`
})
</script>
