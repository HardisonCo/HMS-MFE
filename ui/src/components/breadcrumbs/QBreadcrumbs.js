import { h, computed } from 'vue'

import useAlign, { useAlignProps } from '../../composables/private.use-align/use-align.js'

import { createComponent } from '../../utils/private.create/create.js'
import { hSlot } from '../../utils/private.render/render.js'
import { getNormalizedVNodes } from '../../utils/private.vm/vm.js'

const disabledValues = [ '', true ]

export default createComponent({
  name: 'QBreadcrumbs',

  props: {
    ...useAlignProps,

    separator: {
      type: String,
      default: '/'
    },
    separatorColor: String,

    activeColor: {
      type: String,
      default: 'primary'
    },

    gutter: {
      type: String,
      validator: v => [ 'none', 'xs', 'sm', 'md', 'lg', 'xl' ].includes(v),
      default: 'sm'
    }
  },

  setup (props, { slots }) {
    const alignClass = useAlign(props)

    const classes = computed(() =>
      `flex items-center ${ alignClass.value }${ props.gutter === 'none' ? '' : ` q-gutter-${ props.gutter }` }`
    )

    const sepClass = computed(() => (props.separatorColor ? ` text-${ props.separatorColor }` : ''))
    const activeClass = computed(() => ` text-${ props.activeColor }`)

    return () => {
      if (slots.default === void 0) return

      const vnodes = getNormalizedVNodes(
        hSlot(slots.default)
      )

      if (vnodes.length === 0) return

      let els = 1

      const
        child = [],
        len = vnodes.filter(c => c.type?.name === 'QBreadcrumbsEl').length,
        separator = slots.separator !== void 0
          ? slots.separator
          : () => props.separator

      vnodes.forEach(comp => {
        if (comp.type?.name === 'QBreadcrumbsEl') {
          const middle = els < len
          const disabled = comp.props !== null && disabledValues.includes(comp.props.disable)
          const cls = (middle === true ? '' : ' q-breadcrumbs--last')
            + (disabled !== true && middle === true ? activeClass.value : '')

          els++

          child.push(
            h('div', {
              class: `flex items-center${ cls }`
            }, [ comp ])
          )

          if (middle === true) {
            child.push(
              h('div', {
                class: 'q-breadcrumbs__separator' + sepClass.value
              }, separator())
            )
          }
        }
        else {
          child.push(comp)
        }
      })

      return h('div', {
        class: 'q-breadcrumbs'
      }, [
        h('div', { class: classes.value }, child)
      ])
    }
  }
})
