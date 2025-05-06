import mapboxgl from 'mapbox-gl';
import mapboxglCompare, { CompareOptions } from '../src/index';

import '../src/style.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

let before: mapboxgl.Map;
let after: mapboxgl.Map;
let compare: mapboxglCompare;

const options: CompareOptions = {
  orientation: 'vertical',
  mousemove: false,
}

const init = () => {
  before?.remove();
  after?.remove();
  compare?.remove();

  before = new mapboxgl.Map({
    container: 'before',
    style: 'mapbox://styles/mapbox/light-v8'
  });

  after = new mapboxgl.Map({
    container: 'after',
    style: 'mapbox://styles/mapbox/dark-v8'
  });

  console.log('options', options);

  compare = new mapboxglCompare(
    before,
    after, 
    '#wrapper',
    options
  );

  compare.on('slideend', () => {
    console.log('Event: slideend', compare.currentPosition);
  });

  setTimeout(() => {
    compare.fire('slideend', 'Event: slideend fired');
  }, 3000);
}

const closeButton = document.getElementById('close-button');
const orientationButton = document.getElementById('orientation-button');
const mouseMoveButton = document.getElementById('mousemove-button');

closeButton?.addEventListener('click', function(e) {
  after.getContainer().style.display = 'none';
  compare.remove();
  after.remove();
  document.getElementsByClassName('controls')[0].remove();
});

orientationButton?.addEventListener('click', function(e) {
  if (compare) {
    options.orientation = options.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    init();
  }
});

mouseMoveButton?.addEventListener('click', function(e) {
  if (compare) {
    options.mousemove = !options.mousemove;
    init();
  }
});

init ();