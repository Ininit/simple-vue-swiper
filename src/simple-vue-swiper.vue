<template>
  <div class="swiper"
    :class="[direction, {'dragging': dragging}]"
    @touchstart="_onTouchStart"
    @mousedown="_onTouchStart"
    @wheel="_onWheel"
  >
    <div class="swiper-wrap" ref="swiperWrap" :style="swiperWrapStyle"  @transitionend="_onTransitionEnd">
      <slot></slot>
    </div>
    <div class="swiper-pagination" v-if="paginationVisible">
      <span
        class="swiper-pagination-bullet"
        v-for="(_, index) in slideEls"
        :key="`key_${index}`"
        :class="{'active': index + 1 === current}"
        @click="paginationClickable && setPage(index + 1)"
      ></span>
    </div>
  </div>
</template>

<script>
const VERTICAL = 'vertical'
const HORIZONTAL = 'horizontal'
export default {
  props: {
    direction: {
      type: String,
      default: VERTICAL
    },
    mousewheelControl: {
      type: Boolean,
      default: true
    },
    performanceMode: {
      type: Boolean,
      default: false
    },
    paginationVisible: {
      type: Boolean,
      default: false
    },
    paginationClickable: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    speed: {
      type: Number,
      default: 500
    }
  },
  data () {
    return {
      current: 1,
      lastPage: 1,
      translateX: 0,
      translateY: 0,
      startTranslate: 0,
      delta: 0,
      dragging: false,
      startPos: null,
      transitioning: false,
      translateOffset: 0,
      transitionDuration: 0,
      slideEls: [],
      observer: null
    }
  },
  computed: {
    swiperWrapStyle () {
      return {
        transform: `translate3d(${this.translateX}px, ${this.translateY}px, 0)`,
        'transition-duration': `${this.transitionDuration}ms`
      }
    }
  },
  mounted () {
    // solve get swiper wrap error width (less than actual width)
    setTimeout(() => {
      this.slideEls = [...this.$refs.swiperWrap.children]
      if (this.loop) {
        this._createLoop()
        this.setPage(this.current, true)
      } else {
        this.setPage(this.current)
      }
      // use MutationObserver watch slots changed
      this.onMutationObserver()
    }, 100)
  },
  methods: {
    onMutationObserver () {
      this.observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if(mutation.type === 'childList' && mutation.target === this.$refs.swiperWrap) {
            this.updateSlideEls()
          }
        })
      })

      this.observer.observe(
        this.$refs.swiperWrap,
        {attributes: true, childList: true, characterData: true, subtree: true}
      )
    },
    updateSlideEls () {
      this.observer.disconnect()
      const nodeEls = [...this.$refs.swiperWrap.children]
      this.slideEls = nodeEls.filter(child => !child.dataset.loop)
      if(this.current > this.slideEls) {
        this.current = 1
      }

      if(this.loop) {
        const loopEls = nodeEls.filter(child => child.dataset.loop)
        loopEls.forEach(el => this.$refs.swiperWrap.removeChild(el))
        this._createLoop()
        this.setPage(this.current, true)
      } else {
        this.setPage(this.current)
      }
      
      this.onMutationObserver()
    },
    next () {
      const page = this.current
      if (page < this.slideEls.length || this.loop) {
        this.setPage(page + 1)
      } else {
        this._revert()
      }
    },
    prev () {
      const page = this.current
      if (page > 1 || this.loop) {
        this.setPage(page - 1)
      } else {
        this._revert()
      }
    },
    setPage (page, noAnimation) {
      this.lastPage = this.current
      if (page === 0) {
        this.current = this.slideEls.length
      } else if (page === this.slideEls.length + 1) {
        this.current = 1
      } else {
        this.current = page
      }

      if (this.loop) {
        if (this.delta === 0) {
          this._setTranslate(this._getTranslateOfPage(this.lastPage))
        }
        setTimeout(() => {
          this._setTranslate(this._getTranslateOfPage(page))
          if (noAnimation) return
          this._onTransitionStart()
        }, 0)
      } else {
        this._setTranslate(this._getTranslateOfPage(page))
        if (noAnimation) return
        this._onTransitionStart()
      }
    },
    isHorizontal () {
      return this.direction === HORIZONTAL
    },
    isVertical () {
      return this.direction === VERTICAL
    },
    _onTouchStart (e) {
      this.startPos = this._getTouchPos(e)
      this.delta = 0
      this.startTranslate = this._getTranslateOfPage(this.current)
      this.startTime = Date.now()
      this.dragging = true
      this.transitionDuration = 0

      document.addEventListener('touchmove', this._onTouchMove, false)
      document.addEventListener('touchend', this._onTouchEnd, false)
      document.addEventListener('mousemove', this._onTouchMove, false)
      document.addEventListener('mouseup', this._onTouchEnd, false)
    },
    _onTouchMove (e) {
      this.delta = this._getTouchPos(e) - this.startPos
      if (!this.performanceMode) {
        this._setTranslate(this.startTranslate + this.delta)
        this.$emit('slider-move', this._getTranslate())
      }

      // if (this.isVertical() || this.isHorizontal() && Math.abs(this.delta) > 0) {
      //   e.preventDefault()
      // }
    },
    _onTouchEnd (e) {
      if (this.delta !== 0) {
        this.dragging = false
        this.transitionDuration = this.speed
        const isQuickAction = Date.now() - this.startTime < 1000
        if (this.delta < -100 || (isQuickAction && this.delta < -15)) {
          this.next()
        } else if (this.delta > 100 || (isQuickAction && this.delta > 15)) {
          this.prev()
        } else {
          this._revert()
        }
      }
      document.removeEventListener('touchmove', this._onTouchMove)
      document.removeEventListener('touchend', this._onTouchEnd)
      document.removeEventListener('mousemove', this._onTouchMove)
      document.removeEventListener('mouseup', this._onTouchEnd)
    },
    _onWheel (e) {
      if (this.mousewheelControl) {
        if (!this.transitioning) {
          if (e.deltaY > 0) {
            this.next()
          } else {
            this.prev()
          }
        }
        if (this._isPageChanged()) e.preventDefault()
      }
    },
    _revert () {
      this.setPage(this.current)
    },
    _getTouchPos (e) {
      const key = this.isHorizontal() ? 'pageX' : 'pageY'
      return e.changedTouches ? e.changedTouches[0][key] : e[key]
    },
    _onTransitionStart () {
      this.transitioning = true
      this.transitionDuration = this.speed
      if (this._isPageChanged()) {
        this.$emit('slide-change-start', this.current)
      } else {
        this.$emit('slide-revert-start', this.current)
      }
    },
    _onTransitionEnd () {
      this.transitioning = false
      this.transitionDuration = 0
      this.delta = 0
      if (this._isPageChanged()) {
        this.$emit('slide-change-end', this.current)
      } else {
        this.$emit('slide-revert-end', this.current)
      }
    },
    _isPageChanged () {
      return this.lastPage !== this.current
    },
    _setTranslate (value) {
      const translateName = this.isHorizontal() ? 'translateX' : 'translateY'
      this[translateName] = value
    },
    _getTranslate () {
      const translateName = this.isHorizontal() ? 'translateX' : 'translateY'
      return this[translateName]
    },
    _getTranslateOfPage (page) {
      if (page === 0) return 0
      const propName = this.isHorizontal() ? 'clientWidth' : 'clientHeight'
      return -this.slideEls.reduce((total, el, i) => i > page - 2 ? total : total + el[propName]
        , 0) + this.translateOffset
    },
    _createLoop () {
      const propName = this.isHorizontal() ? 'clientWidth' : 'clientHeight'
      const swiperWrapEl = this.$refs.swiperWrap
      const duplicateFirstChild = swiperWrapEl.firstElementChild.cloneNode(true)
      const duplicateLastChild = swiperWrapEl.lastElementChild.cloneNode(true)
      // add tag
      duplicateFirstChild.dataset.loop = true
      duplicateLastChild.dataset.loop = true
      swiperWrapEl.insertBefore(duplicateLastChild, swiperWrapEl.firstElementChild)
      swiperWrapEl.appendChild(duplicateFirstChild)
      this.translateOffset = -duplicateLastChild[propName]
    }
  },
  beforeDestroy() {
    this.observer.disconnect()
  }
}
</script>

<style lang="scss">
.swiper {
  position: relative;
  overflow: hidden;

  &-wrap {
    display: flex;
    width: 100%;
    height: 100%;
    transition: all 0ms ease;

    > div {
      overflow: hidden;
      flex-shrink: 0;
      width: 100%;
      height: 100%;
    }
  }

  &.horizontal .swiper-wrap {
    flex-direction: row;
  }

  &.vertical .swiper-wrap {
    flex-direction: column;
  }

  .swiper-pagination {
    position: absolute;

    .swiper-pagination-bullet {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #000000;
      opacity: 0.2;
      transition: all 0.5s ease;
    }

    .swiper-pagination-bullet.active {
      background: #007aff;
      opacity: 1;
    }
  }

  &.vertical .swiper-pagination {
    right: 10px;
    top: 50%;
    transform: translate3d(0, -50%, 0);

    .swiper-pagination-bullet {
      display: block;
      margin: 6px 0;
    }
  }

  &.horizontal .swiper-pagination {
    bottom: 10px;
    width: 100%;
    text-align: center;

    .swiper-pagination-bullet {
      display: inline-block;
      margin: 0 3px;
    }
  }
}
</style>
