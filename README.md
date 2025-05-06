# @zerogravity/mapbox-gl-compare

Swipe and sync between two maps

![Swipe example](http://i.imgur.com/MvjwVLu.gif)

Map movements are synced with [@zerogravity/mapbox-gl-sync-move](https://github.com/ZeroGravityOy/mapbox-gl-sync-move).

## Installation

```
npm i @zerogravity/mapbox-gl-compare
```

## Usage

```js
import mapboxgl from 'mapbox-gl';
import mapboxglCompare from '@zerogravity/mapbox-gl-compare'

import 'mapbox-gl/dist/mapbox-gl.css';
import '@zerogravity/mapbox-gl-compare/dist/style.css';

const before = new mapboxgl.Map({
  container: 'before', // Container ID
  style: 'mapbox://styles/mapbox/light-v9'
});

const after = new mapboxgl.Map({
  container: 'after', // Container ID
  style: 'mapbox://styles/mapbox/dark-v9'
});

// A selector or reference to HTML element
const container = '#comparison-container';

const compare = new mapboxglCompare(before, after, container, {
  mousemove: true, // Optional. Set to true to enable swiping during cursor movement.
  orientation: 'vertical' // Optional. Sets the orientation of swiper to horizontal or vertical, defaults to vertical
});
```

## Methods

```js
compare = new mapboxgl.Compare(before, after, container, {
  mousemove: true, // Optional. Set to true to enable swiping during cursor movement.
  orientation: 'vertical' // Optional. Sets the orientation of swiper to horizontal or vertical, defaults to vertical
});

//Get Current position - this will return the slider's current position, in pixels
compare.currentPosition;

//Set Position - this will set the slider at the specified (x) number of pixels from the left-edge or top-edge of viewport based on swiper orientation
compare.setSlider(x);

//Listen to slider movement - and return current position on each slideend
compare.on('slideend', (e) => {
  console.log(e.currentPosition);
});

//Remove - this will remove the compare control from the DOM and stop synchronizing the two maps.
compare.remove();
```

Demo: https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-compare/

## Testing and Developing

There are unit tests with mocked maps, and there's a page for manual testing.

Run the unit tests with `npm test`.

To manually test, ensure you have a `VITE_MAPBOX_ACCESS_TOKEN` environment variable set in file /example/.env. Then start the server with `npm run dev`.

## Publishing to NPM registery

- Update the version key in [package.json](https://github.com/ZeroGravityOy/mapbox-gl-compare/blob/main/package.json)
- Create and merge a Pull Request
- Open repository in IDE and choose latest main branch
- Run commands: `git tag v1.0.0` and `git push origin v1.0.0`
