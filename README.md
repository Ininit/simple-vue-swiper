
# simple-vue-swiper
swiper component. Easy to use. Base on [vue-swiper](https://github.com/weilao/vue-swiper)

## demo
[simple-vue-swiper](http://ininit.github.io/simple-vue-swiper/example)

## how to use
```bash
yarn add simple-vue-swiper # or npm i simple-vue-swiper -swiper
```

```vue
<template>
  ...
  <swiper
    direction="horizontal"
    :mousewheel-control="true"
    :performance-mode="false"
    :pagination-visible="true"
    :pagination-clickable="true"
    :loop="true"
    @slide-change-start="onSlideChangeStart"
    @slide-change-end="onSlideChangeEnd"
    @slide-revert-start="onSlideRevertStart"
    @slide-revert-end="onSlideRevertEnd"
    @slider-move="onSliderMove"
  >
    <div>page one</div>
    <div>page two</div>
    <div>page three</div>
    <div>page four</div>
    <div>page five</div>
  </swiper>
  ...
</template>

<script>
import Swiper from 'simple-vue-swiper'
export default {
  components: {
    Swiper
  },
  methods: {
    onSlideChangeStart: function(currentPage) {
      console.log("onSlideChangeStart", currentPage);
    },
    onSlideChangeEnd: function(currentPage) {
      console.log("onSlideChangeEnd", currentPage);
    },
    onSlideRevertStart: function(currentPage) {
      console.log("onSlideRevertStart", currentPage);
    },
    onSlideRevertEnd: function(currentPage) {
      console.log("onSlideRevertEnd", currentPage);
    },
    onSliderMove: function(offset) {
      console.log("onSliderMove", offset);
    },
  }
}
</script>
```

## Api
### Properties
| Name                 | Type      | Default      | Description                                                        |
|----------------------|-----------|--------------|--------------------------------------------------------------------|
| direction            | `String`  | `"vertical"` | Could be 'horizontal' or 'vertical' (for vertical slider).         |
| mousewheel-control   | `Boolean` | `true`       | Set to true to enable navigation through slides using mouse wheel. |
| pagination-visible   | `Boolean` | `false`      | Toggle (hide/true) pagination container visibility when click on Slider's container    |
| pagination-clickable | `Boolean` | `false`      | If true then clicking on pagination button will cause transition to appropriate slide. |
| performace-mode      | `Boolean` | `false`      | Disable advance effect for better performance.                     |
| loop                 | `Boolean` | `false`      | Set to true to enable continuous loop mode                         |
| ==================== | ========= | ============ | =================== |

### Methods
| Method            | Description              |
|-------------------|--------------------------|
| next()            | Go next page.            |
| prev()            | Go previous page.        |
| setPage(`Number`) | Set current page number. |

### Events
| Name                            | Parameters | Description                                                                                                                                                  |
|--------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| slide-change-start | `pageNumber`     | Fire in the beginning of animation to other slide (next or previous).                                                                                        |
| slide-change-end   | `pageNumber`     | Will be fired after animation to other slide (next or previous).                                                                                             |
| slide-revert-start | `pageNumber`     | Fire in the beginning of animation to revert slide (no change).                                                                                              |
| slide-revert-end   | `pageNumber`     | Will be fired after animation to revert slide (no change).                                                                                                   |
| slider-move        | `offset`         | Callback function, will be executed when user touch and move finger over Swiper and move it. Receives swiper instance and 'touchmove' event as an arguments. |
| ================== | ================ | ============================ |
