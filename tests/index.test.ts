import mapboxgl from 'mapbox-gl';
import mapboxglCompare from '../src/index';

const a = new mapboxgl.Map({
  container: document.createElement('div'),
  style: 'mapbox://styles/mapbox/light-v8'
});

const b = new mapboxgl.Map({
  container: document.createElement('div'),
  style: 'mapbox://styles/mapbox/dark-v8'
});

const container = document.createElement('div');
const compare = new mapboxglCompare(a, b, container);

document.body.appendChild(a.getContainer());
document.body.appendChild(b.getContainer());

describe('Compare', () => {
  test('Maps are clipped', () => {
    expect(a.getContainer().style.clipPath).not.toBe('');
    expect(b.getContainer().style.clipPath).not.toBe('');
  });

  test('Maps parameters are synched', () => {
    b.jumpTo({
      bearing: 20,
      center: {
        lat: 16,
        lng: -155
      },
      pitch: 20,
      zoom: 3
    });

    expect(a.getZoom()).toBe(3);
    expect(a.getPitch()).toBe(20);
    expect(a.getBearing()).toBe(20);
    expect(a.getCenter().lng).toBe(-155);
    expect(a.getCenter().lat).toBe(16);
  });

  test('Slider is moving', () => {
    compare.setSlider(20);

    expect(compare.currentPosition).toBe(20);
  });

  test('Comparing is removed and maps parameters no longer sync', () => {
    compare.remove();

    expect(a.getContainer().style.clipPath).toBe('');
    expect(b.getContainer().style.clipPath).toBe('');

    b.jumpTo({
      bearing: 10,
      center: {
        lat: 26,
        lng: -105
      },
      pitch: 30,
      zoom: 5
    });

    expect(a.getZoom()).toBe(3);
    expect(a.getPitch()).toBe(20);
    expect(a.getBearing()).toBe(20);
    expect(a.getCenter().lng).toBe(-155);
    expect(a.getCenter().lat).toBe(16);
  });
});