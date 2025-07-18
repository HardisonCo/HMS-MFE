---
title: Color Palette
desc: How to use and customize the Quasar Color Palette.
related:
  - quasar-utils/color-utils
---
Quasar Framework offers a wide selection of colors out of the box. You can use them both as Sass/SCSS variables in your CSS code or directly as CSS classes in your HTML templates.

<DocApi file="Brand" />

<DocInstallation title="Configuration" config="brand" />

## Brand Colors
Most of the colors that Quasar Components use are strongly linked with these eight colors that you can change. Choosing these colors is the first step one should take when differentiating the design of an App. You'll notice immediately upon changing their default values that Quasar Components follow these colors as a guideline.

<script doc>
import BrandColors from './BrandColors.vue'
</script>

<BrandColors />

::: tip TIPS
Also check [Theme Builder](/style/theme-builder) for a tool on customizing the brand colors of your website/app.
:::

## Color List

Here's the list of colors provided out of the box. Within your app's `*.vue` files you can use them as CSS classes (in HTML templates) or as [Sass/SCSS variables](/style/sass-scss-variables) in `<style lang="...">` tags.

<script doc>
import ColorList from './ColorList.vue'
</script>

<ColorList />

## Using as CSS Classes
Use `text-` or `bg-` prefixes as class names to change the color of text or the color of the background.

```html
<!-- changing text color -->
<p class="text-primary">....</p>

<!-- changing background color -->
<p class="bg-positive">...</p>
```

## Using Sass/SCSS Variables

In your app's `*.vue` files you can use the colors as `$primary`, `$red-1`, and so on.

```html
<!-- Notice lang="sass" -->
<style lang="sass">
div
  color: $red-1
  background-color: $grey-5
</style>
```

```html
<!-- Notice lang="scss" -->
<style lang="scss">
div {
  color: $red-1;
  background-color: $grey-5;
}
</style>
```

## Adding Your Own Colors
If you want to use your own colors for your components (let's say we are adding a color named "brand") all you need to do is add the following CSS into your app:

```css
.text-brand {
  color: #a2aa33 !important;
}
.bg-brand {
  background: #a2aa33 !important;
}
```

Now we can use this color for Quasar components:
```html
<q-btn color="brand" ... />
```

You can access a custom color value (hex string) in JS context with the [getPaletteColor](/quasar-utils/color-utils#helper-getpalettecolor) util.

## Dynamic Change of Brand Colors (Dynamic Theme Colors)

### How it works

You can dynamically customize the brand colors during run-time: `primary`, `secondary`, `accent`, `dark`, `positive`, `negative`, `info`, `warning`. That means you can have one build of your application with a default color theme but show it with a runtime selected one.

The main color configuration is done using CSS custom properties, stored on the root element (`:root`). Each property has a name of `--q-${name}` (example: `--q-primary`, `--q-secondary`) and should have a valid CSS color as value.

The CSS Custom properties use the same inheritance rules as normal CSS, so you can only redefine your desired colors and the rest will be inherited from the parent elements.

The recommended workflow is to set your customized color properties on the `html` (`document.documentElement`) or `body` (`document.body`) elements. This will allow you to revert to the default color by just deleting your custom one.

More info on CSS custom properties (variables) on [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables).

### Util: setCssVar

Quasar offers a helper function for setting Quasar CSS variables that can be used for the brand colors too: `setCssVar(colorName, colorValue[, element])`

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `colorName` | String | *Yes* | One of `primary`, `secondary`, `accent`, `dark`, `positive`, `negative`, `info`, `warning` |
| `colorValue` | String | *Yes* | Valid CSS color value |
| `element` | Element | - | (Default: `document.body`) Element where the custom property will be set. |

Example of setting brand colors using the helper:

```js
import { setCssVar } from 'quasar'

setCssVar('light', '#DDD')
setCssVar('primary', '#33F')
setCssVar('primary', '#F33', document.getElementById('rebranded-section-id'))
```

Example of setting brand colors using vanilla JavaScript:

```js
// equivalent of setCssVar('primary') in raw JavaScript:
document.body.style.setProperty('--q-primary', '#0273d4')
```

### Util: getCssVar

Quasar offers a helper function for getting the value of Quasar CSS variables that can be used for brand colors too: `getCssVar(colorName[, element])`

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `colorName` | String | *Yes* | One of `primary`, `secondary`, `accent`, `dark`, `positive`, `negative`, `info`, `warning` |
| `element` | Element | - | (Default: `document.body`) Element where the custom property will be read. |

Example of getting brand colors using the helper:

```js
import { getCssVar } from 'quasar'

getCssVar('primary') // '#33F'
getCssVar('primary', document.getElementById('rebranded-section-id'))
```

What this helper does is wrap the raw JavaScript `getPropertyValue()` and it's available for convenience. Here is an example of equivalent vanilla JavaScript:

```js
// equivalent of getCssVar('primary') in raw JavaScript:
getComputedStyle(document.documentElement)
  .getPropertyValue('--q-primary') // #0273d4
```

### More color utils

Besides the utils above, we also have a dedicated section in docs for handling colors that you might be interested in: [Color utils](/quasar-utils/color-utils).

```js
import { colors, setCssVar } from 'quasar'

const { lighten } = colors

const newPrimaryColor = '#933'
setCssVar('primary', newPrimaryColor)
setCssVar('primary-darkened', lighten(newPrimaryColor, -10))
```

## Setting Up Defaults

You can set up some brand colors without tampering with the Sass/SCSS variables.

See the [Configuration](/style/color-palette#configuration) section above for setting it during initial configuration for Quasar CLI, Quasar Vite plugin, and UMD projects.

If you are using Quasar CLI, you can also use a [@quasar/app-vite Boot File](/quasar-cli-vite/boot-files) or a [@quasar/app-webpack Boot File](/quasar-cli-webpack/boot-files).
This is especially useful if you want to change the colors dynamically at initial load time, perhaps after fetching them from an API.

```js /src/boot/brand-colors.js - or any other name
import { setCssVar } from 'quasar'
import { defineBoot } from '#q-app/wrappers'

export default defineBoot(() => {
  setCssVar('primary', '#ff0000')
})
```

If using SSR mode, disable this boot file when running on server-side:

```js /quasar.config file
boot: [
  { server: false, path: 'brand-colors' }, // or the name you gave it
  // ...
],
```
