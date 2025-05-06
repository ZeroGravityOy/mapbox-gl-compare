import syncMove from '@zerogravity/mapbox-gl-sync-move';
import { EventEmitter } from 'events';
import type { Map } from 'mapbox-gl';

export interface CompareOptions {
  orientation?: 'horizontal' | 'vertical';
  mousemove?: boolean;
}

/**
 * @param {Object} a The first Mapbox GL Map
 * @param {Object} b The second Mapbox GL Map
 * @param {string|HTMLElement} container An HTML Element, or an element selector string for the compare container. It should be a wrapper around the two map Elements.
 * @param {Object} options
 * @param {string} [options.orientation=vertical] The orientation of the compare slider. `vertical` creates a vertical slider bar to compare one map on the left (map A) with another map on the right (map B). `horizontal` creates a horizontal slider bar to compare on mop on the top (map A) and another map on the bottom (map B).
 * @param {boolean} [options.mousemove=false] If `true` the compare slider will move with the cursor, otherwise the slider will need to be dragged to move.
 * @example
 * var compare = new mapboxgl.Compare(beforeMap, afterMap, '#wrapper', {
 *   orientation: 'vertical',
 *   mousemove: true
 * });
 * @see [Swipe between maps](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-compare/)
 */
class Compare {
  options: CompareOptions;
  _mapA: Map;
  _mapB: Map;
  _horizontal: boolean;
  currentPosition: number
  _ev: EventEmitter;
  _swiper: HTMLElement;
  _controlContainer: HTMLElement;
  _clearSync: any
  _bounds: DOMRect;
  _onResize: () => void;

  constructor(a: Map, b: Map, container: string | HTMLElement, options?: CompareOptions) {
    this.options = options ? options : {};
    this._mapA = a;
    this._mapB = b;
    this._horizontal = this.options.orientation === 'horizontal';
    this._ev = new EventEmitter();
    this._swiper = document.createElement('div');
    this._swiper.className = this._horizontal ? 'compare-swiper-horizontal' : 'compare-swiper-vertical';
    this._controlContainer = document.createElement('div');
    this._controlContainer.className = this._horizontal ? 'mapboxgl-compare mapboxgl-compare-horizontal' : 'mapboxgl-compare';
    this._controlContainer.className = this._controlContainer.className;
    this._controlContainer.appendChild(this._swiper);

    if (typeof container === 'string' && document.body.querySelectorAll) {
      // get container with a selector
      const appendTarget = document.body.querySelectorAll(container)[0];
      if (!appendTarget) {
        throw new Error('Cannot find element with specified container selector.')
      }
      appendTarget.appendChild(this._controlContainer)
    } else if (container instanceof Element && container.appendChild) {
      // get container directly
      container.appendChild(this._controlContainer)
    } else {
      throw new Error('Invalid container specified. Must be CSS selector or HTML element.')
    }

    this._bounds = b.getContainer().getBoundingClientRect();
    const swiperPosition = (this._horizontal ? this._bounds.height : this._bounds.width) / 2;
    this.currentPosition = swiperPosition
    this._setPosition(swiperPosition);

    this._clearSync = syncMove(a, b);

    // Bind methods to the instance to preserve 'this'
    this._onMove = this._onMove.bind(this);
    this._onDown = this._onDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onResize = () => {
      this._bounds = b.getContainer().getBoundingClientRect();
      if (this.currentPosition) this._setPosition(this.currentPosition);
    }

    b.on('resize', this._onResize);

    if (this.options && this.options.mousemove) {
      a.getContainer().addEventListener('mousemove', this._onMove);
      b.getContainer().addEventListener('mousemove', this._onMove);
    }

    this._swiper.addEventListener('mousedown', this._onDown);
    this._swiper.addEventListener('touchstart', this._onDown);
  }

  private _setPointerEvents(v: string) {
    this._controlContainer.style.pointerEvents = v;
    this._swiper.style.pointerEvents = v;
  }

  private _onDown(e: MouseEvent | TouchEvent) {
    if (e instanceof TouchEvent) {
      document.addEventListener('touchmove', this._onMove);
      document.addEventListener('touchend', this._onTouchEnd);
    } else {
      document.addEventListener('mousemove', this._onMove);
      document.addEventListener('mouseup', this._onMouseUp);
    }
  }

  private _setPosition(x: number) {
    x = Math.min(x, this._horizontal
      ? this._bounds.height
      : this._bounds.width);
    const pos = this._horizontal
      ? 'translate(0, ' + x + 'px)'
      : 'translate(' + x + 'px, 0)';
    this._controlContainer.style.transform = pos;

    const clipPathA = `inset(
      ${this._horizontal
        ? `0px 0px ${this._bounds.height - x}px 0px`
        : `0px ${this._bounds.width - x}px 0px 0px`}
    )`;
    const clipPathB = `inset(
      ${this._horizontal
        ? `${x}px 0px 0px 0px`
        : `0px 0px 0px ${x}px`}
    )`;

    this._mapA.getContainer().style.clipPath = clipPathA;
    this._mapB.getContainer().style.clipPath = clipPathB;

    this.currentPosition = x;
  }

  private _onMove(e: MouseEvent | TouchEvent) {
    if (this.options && this.options.mousemove) {
      const isTouchEvent = e instanceof TouchEvent;
      this._setPointerEvents(isTouchEvent ? 'auto' : 'none');
    }
    this._horizontal
      ? this._setPosition(this._getY(e))
      : this._setPosition(this._getX(e));
  }

  private _onMouseUp() {
    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    this.fire('slideend', { currentPosition: this.currentPosition });
  }

  private _onTouchEnd() {
    document.removeEventListener('touchmove', this._onMove);
    document.removeEventListener('touchend', this._onTouchEnd);
    this.fire('slideend', { currentPosition: this.currentPosition });
  }

  private _getX(e: MouseEvent | TouchEvent) {
    const event = e instanceof TouchEvent ? e.touches[0] : e;
    var x = event.clientX - this._bounds.left;
    if (x < 0) x = 0;
    if (x > this._bounds.width) x = this._bounds.width;
    return x;
  }

  private _getY(e: MouseEvent | TouchEvent) {
    const event = e instanceof TouchEvent ? e.touches[0] : e;
    var y = event.clientY - this._bounds.top;
    if (y < 0) y = 0;
    if (y > this._bounds.height) y = this._bounds.height;
    return y;
  }

  /**
   * Set the position of the slider.
   *
   * @param {number} x Slider position in pixels from left/top.
   */
  setSlider(x: number) {
    this._setPosition(x);
  }

  /**
   * Adds a listener for events of a specified type.
   *
   * @param {string} type The event type to listen for; one of `slideend`.
   * @param {Function} listener The function to be called when the event is fired.
   * @returns {Compare} `this`
   */
  on(type: string, fn: () => void) {
    this._ev.on(type, fn);
    return this;
  }

  /**
   * Fire an event of a specified type.
   *
   * @param {string} type The event type to fire; one of `slideend`.
   * @param {Object} data Data passed to the event listener.
   * @returns {Compare} `this`
   */
  fire(type: string, data: any) {
    this._ev.emit(type, data);
    return this;
  }

  /**
   * Removes an event listener previously added with `Compare#on`.
   *
   * @param {string} type The event type previously used to install the listener.
   * @param {Function} listener The function previously installed as a listener.
   * @returns {Compare} `this`
   */
  off(type: string, fn: () => void) {
    this._ev.removeListener(type, fn);
    return this;
  }

  remove() {
    this._clearSync();
    this._mapB.off('resize', this._onResize);

    const aContainer = this._mapA.getContainer();
    if (!!aContainer) {
      aContainer.style.clipPath = '';
      aContainer.removeEventListener('mousemove', this._onMove);
    }

    const bContainer = this._mapB.getContainer();
    if (!!bContainer) {
      bContainer.style.clipPath = '';
      bContainer.removeEventListener('mousemove', this._onMove);
    }

    this._swiper.removeEventListener('mousedown', this._onDown);
    this._swiper.removeEventListener('touchstart', this._onDown);
    this._controlContainer.remove();
  }
}

export default Compare;