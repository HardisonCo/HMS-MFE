import { h, ref, computed, watch, onMounted, getCurrentInstance } from 'vue'

import QIcon from '../icon/QIcon.js'
import QBtn from '../btn/QBtn.js'
import QBtnGroup from '../btn-group/QBtnGroup.js'
import QMenu from '../menu/QMenu.js'

import { getBtnDesignAttr, nonRoundBtnProps } from '../btn/use-btn.js'
import useId from '../../composables/use-id/use-id.js'
import { useTransitionProps } from '../../composables/private.use-transition/use-transition.js'

import { createComponent } from '../../utils/private.create/create.js'
import { stop } from '../../utils/event/event.js'
import { hSlot } from '../../utils/private.render/render.js'

const btnPropsList = Object.keys(nonRoundBtnProps)

export function passBtnProps (props) {
  return btnPropsList.reduce((acc, key) => {
    const val = props[ key ]
    if (val !== void 0) {
      acc[ key ] = val
    }
    return acc
  }, {})
}

export default createComponent({
  name: 'QBtnDropdown',

  props: {
    ...nonRoundBtnProps,
    ...useTransitionProps,

    modelValue: Boolean,
    split: Boolean,
    dropdownIcon: String,

    contentClass: [ Array, String, Object ],
    contentStyle: [ Array, String, Object ],

    cover: Boolean,
    persistent: Boolean,
    noEscDismiss: Boolean,
    noRouteDismiss: Boolean,
    autoClose: Boolean,
    noRefocus: Boolean,
    noFocus: Boolean,

    menuAnchor: {
      type: String,
      default: 'bottom end'
    },
    menuSelf: {
      type: String,
      default: 'top end'
    },
    menuOffset: Array,

    disableMainBtn: Boolean,
    disableDropdown: Boolean,

    noIconAnimation: Boolean,

    toggleAriaLabel: String
  },

  emits: [ 'update:modelValue', 'click', 'beforeShow', 'show', 'beforeHide', 'hide' ],

  setup (props, { slots, emit }) {
    const { proxy } = getCurrentInstance()

    const showing = ref(props.modelValue)
    const menuRef = ref(null)
    const targetUid = useId()

    const ariaAttrs = computed(() => {
      const acc = {
        'aria-expanded': showing.value === true ? 'true' : 'false',
        'aria-haspopup': 'true',
        'aria-controls': targetUid.value,
        'aria-label': props.toggleAriaLabel || proxy.$q.lang.label[ showing.value === true ? 'collapse' : 'expand' ](props.label)
      }

      if (
        props.disable === true
        || (
          (props.split === false && props.disableMainBtn === true)
          || props.disableDropdown === true
        )
      ) {
        acc[ 'aria-disabled' ] = 'true'
      }

      return acc
    })

    const iconClass = computed(() =>
      'q-btn-dropdown__arrow'
      + (showing.value === true && props.noIconAnimation === false ? ' rotate-180' : '')
      + (props.split === false ? ' q-btn-dropdown__arrow-container' : '')
    )

    const btnDesignAttr = computed(() => getBtnDesignAttr(props))
    const btnProps = computed(() => passBtnProps(props))

    watch(() => props.modelValue, val => {
      menuRef.value?.[ val ? 'show' : 'hide' ]()
    })

    watch(() => props.split, hide)

    function onBeforeShow (e) {
      showing.value = true
      emit('beforeShow', e)
    }

    function onShow (e) {
      emit('show', e)
      emit('update:modelValue', true)
    }

    function onBeforeHide (e) {
      showing.value = false
      emit('beforeHide', e)
    }

    function onHide (e) {
      emit('hide', e)
      emit('update:modelValue', false)
    }

    function onClick (e) {
      emit('click', e)
    }

    function onClickHide (e) {
      stop(e)
      hide()
      emit('click', e)
    }

    function toggle (evt) {
      menuRef.value?.toggle(evt)
    }

    function show (evt) {
      menuRef.value?.show(evt)
    }

    function hide (evt) {
      menuRef.value?.hide(evt)
    }

    // expose public methods
    Object.assign(proxy, {
      show, hide, toggle
    })

    onMounted(() => {
      props.modelValue === true && show()
    })

    return () => {
      const Arrow = [
        h(QIcon, {
          class: iconClass.value,
          name: props.dropdownIcon || proxy.$q.iconSet.arrow.dropdown
        })
      ]

      props.disableDropdown !== true && Arrow.push(
        h(QMenu, {
          ref: menuRef,
          id: targetUid.value,
          class: props.contentClass,
          style: props.contentStyle,
          cover: props.cover,
          fit: true,
          persistent: props.persistent,
          noEscDismiss: props.noEscDismiss,
          noRouteDismiss: props.noRouteDismiss,
          autoClose: props.autoClose,
          noFocus: props.noFocus,
          noRefocus: props.noRefocus,
          anchor: props.menuAnchor,
          self: props.menuSelf,
          offset: props.menuOffset,
          separateClosePopup: true,
          transitionShow: props.transitionShow,
          transitionHide: props.transitionHide,
          transitionDuration: props.transitionDuration,
          onBeforeShow,
          onShow,
          onBeforeHide,
          onHide
        }, slots.default)
      )

      if (props.split === false) {
        return h(QBtn, {
          class: 'q-btn-dropdown q-btn-dropdown--simple',
          ...btnProps.value,
          ...ariaAttrs.value,
          disable: props.disable === true || props.disableMainBtn === true,
          noWrap: true,
          round: false,
          onClick
        }, {
          default: () => hSlot(slots.label, []).concat(Arrow),
          loading: slots.loading
        })
      }

      return h(QBtnGroup, {
        class: 'q-btn-dropdown q-btn-dropdown--split no-wrap q-btn-item',
        rounded: props.rounded,
        square: props.square,
        ...btnDesignAttr.value,
        glossy: props.glossy,
        stretch: props.stretch
      }, () => [
        h(QBtn, {
          class: 'q-btn-dropdown--current',
          ...btnProps.value,
          disable: props.disable === true || props.disableMainBtn === true,
          noWrap: true,
          round: false,
          onClick: onClickHide
        }, {
          default: slots.label,
          loading: slots.loading
        }),

        h(QBtn, {
          class: 'q-btn-dropdown__arrow-container q-anchor--skip',
          ...ariaAttrs.value,
          ...btnDesignAttr.value,
          disable: props.disable === true || props.disableDropdown === true,
          rounded: props.rounded,
          color: props.color,
          textColor: props.textColor,
          dense: props.dense,
          size: props.size,
          padding: props.padding,
          ripple: props.ripple
        }, () => Arrow)
      ])
    }
  }
})
