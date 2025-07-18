---
title: Knob
desc: The QKnob Vue component is used to take a number input through mouse or touch panning.
keys: QKnob
examples: QKnob
related:
  - /vue-components/circular-progress
---

The QKnob component is used to take a number input from the user through mouse/touch panning. It is based on [QCircularProgress](/vue-components/circular-progress) and inherits all its properties and behavior.

<DocApi file="QKnob" />

## Usage

By default, QKnob inherits current text color (as arc progress color and inner label color) and current font size (as component size). For customization, you can use the size and color related props.

### Basic

<DocExample title="Basic" file="Basic" />

### Show value

In the example below, `show-value` property also enables the default slot, so you can fill it with custom content, like even a QAvatar or a QTooltip. The `font-size` prop refers to the inner label font size. 

If the default slot contains an image, you have to style it with class `no-pointer-events` or set the `draggable` prop to false. Otherwise browser's default image dragging behaviour overrides QKnob's one

<DocExample title="Show value" file="ShowValue" />

### Min and max

<DocExample title="Custom min/max" file="MinMax" />

### Inner min/max <q-badge label="v2.5.4+" />

Sometimes you need to restrict the model value to an interval inside of the track's length. For this purpose, use `inner-min` and `inner-max` props. First prop needs to be higher or equal to `min` prop while the latter needs to be lower or equal to the `max` prop.

<DocExample title="Inner min/max" file="InnerMinMax" />

### Custom step

<DocExample title="Custom step" file="Step" />

### Offset angle

<DocExample title="Offset angle" file="Angle" />

### Disable and readonly

<DocExample title="Disable and readonly" file="DisableReadonly" />

### Native form submit

When dealing with a native form which has an `action` and a `method` (eg. when using Quasar with ASP.NET controllers), you need to specify the `name` property on QKnob, otherwise formData will not contain it (if it should):

<DocExample title="Native form" file="NativeForm" />
