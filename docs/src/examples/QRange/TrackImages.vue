<template>
  <div class="q-pa-lg">
    <q-range
      v-model="model"
      color="deep-orange"
      :max="10"
      track-size="8px"
      track-color="grey-2"
      inner-track-color="transparent"
      selection-color="transparent"
      :track-img="img"
    />

    <q-range
      v-model="model"
      color="deep-orange"
      :max="10"
      track-size="8px"
      track-color="white"
      inner-track-color="transparent"
      :track-img="img"
    />

    <q-range
      v-model="model"
      color="deep-orange"
      :max="10"
      track-size="8px"
      inner-track-color="transparent"
      :selection-img="img"
    />

    <q-range
      v-model="model"
      color="deep-orange"
      :max="10"
      :inner-min="2"
      :inner-max="8"
      track-size="8px"
      inner-track-color="white"
      :inner-track-img="img"
      selection-color="transparent"
    />
  </div>
</template>

<script>
import { ref } from 'vue'

// supports URL too!
// or relative path (if on Quasar CLI / Vite Plugin)
// or ~assets/some-image.png (if on Quasar CLI)
const img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAH0lEQVQoU2NkYGAwZkAFZ5G5jPRRgOYEVDeB3EBjBQBOZwTVugIGyAAAAABJRU5ErkJggg=='

export default {
  setup () {
    return {
      model: ref({
        min: 3,
        max: 7
      }),
      img
    }
  }
}
</script>
