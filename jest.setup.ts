import type mapboxgl from 'mapbox-gl';

jest.mock('mapbox-gl', () => {
  const actualMapboxgl = jest.requireActual('mapbox-gl');
  return {
    ...actualMapboxgl,
    Map: jest.fn().mockImplementation((options: mapboxgl.MapOptions) => {
      const container = options.container as HTMLElement;
      const mockMapInstance = {
        getContainer: jest.fn(() => container),
        on: jest.fn((event, listener) => {
          // Store listeners if needed for triggering events
        }),
        off: jest.fn(),
        getZoom: jest.fn(function(this: any) { return this._zoom; }),
        getPitch: jest.fn(function(this: any) { return this._pitch; }),
        getBearing: jest.fn(function(this: any) { return this._bearing; }),
        getCenter: jest.fn(function(this: any) { return this._center; }),
        jumpTo: jest.fn(function(this: any, options: mapboxgl.CameraOptions) {
          // Update internal state based on options
          this._zoom = options.zoom ?? this._zoom;
          this._pitch = options.pitch ?? this._pitch;
          this._bearing = options.bearing ?? this._bearing;
          this._center = options.center ?? this._center;

          // Simulate the 'move' event which triggers sync ONCE
          const moveListener = this.on.mock.calls.find((call: any) => call[0] === 'move');
          if (moveListener && moveListener[1] && !this._moveSimulated) {
            this._moveSimulated = true;
            moveListener[1]({ target: this });
          }
          this._moveSimulated = false;
        }),
        // Internal state for jumpTo mock
        _zoom: 0,
        _pitch: 0,
        _bearing: 0,
        _center: { lat: 0, lng: 0 },
        _moveSimulated: false,
      };
      return mockMapInstance;
    })
  };
});

// jsdom always returns 0 for values getBoundingClientRect
// https://github.com/jsdom/jsdom/issues/1590#issuecomment-1379728739
window.HTMLElement.prototype.getBoundingClientRect = (): DOMRect => ({
  x: 10,
  y: 20,
  bottom: 44,
  height: 24,
  left: 10,
  right: 35.67,
  top: 20,
  width: 25.67,
  toJSON: () => ({}),
});

// ReferenceError: TextDecoder is not defined
// https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextDecoder, TextEncoder });