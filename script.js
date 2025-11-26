mapboxgl.accessToken = 'pk.eyJ1IjoibWljaGFlbGprYXJhIiwiYSI6ImNtYXZ6eWtjaDA5dHMycXB1bGhvMmFxc3IifQ.T_KW1Imu0r__UTSp3VT_GA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/michaeljkara/cmbmpgyyi00bl01qq1npreyty',
  center: [0, 20],
  zoom: 1.5,
  projection: 'globe'
});

// 🌍 2026 Journey Countries (story map)
const journeyCountries = [
  "United States of America",
  "United Kingdom",
  "Norway",
  "France",
  "Luxembourg",
  "Armenia"
  // Add new ones here as the journey continues
];

// Curved arc generator using Turf's greatCircle (MUCH smoother, no kinks)
function generateArc(start, end) {
  const gc = turf.greatCircle(start, end, {
    npoints: 500,  // smoothness
    offset: 0.4     // arc height; increase for more dramatic curve
  });
  return gc.geometry.coordinates;
}

map.on('load', () => {
  // ----------------------------------------
  // LOAD COUNTRIES
  // ----------------------------------------
  map.addSource('custom-countries', {
    type: 'geojson',
    data: 'data/custom.geo.json'
  });

  map.addLayer({
    id: 'custom-country-fills',
    type: 'fill',
    source: 'custom-countries',
    paint: {
      'fill-color': [
        'case',
        ['in', ['get', 'name'], ['literal', journeyCountries]],  'rgba(210,140,40,0.22)',
        'rgba(0,0,0,0)'
      ],
      'fill-opacity': 1
    }
  });

  map.addLayer({
    id: 'custom-country-borders',
    type: 'line',
    source: 'custom-countries',
    paint: {
      'line-color': 'rgba(150,100,40,0.4)',
      'line-width': 0.5
    }
  });

  // ----------------------------------------
  // COUNTRY HOVER POPUP
  // ----------------------------------------
  const hoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

  map.on('mousemove', 'custom-country-fills', (e) => {
    const feature = e.features[0];
    const name = feature.properties.name || 'Unknown';
    const onJourney = journeyCountries.includes(name);

    hoverPopup
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${name}</strong><br>${onJourney ? 'On my 2026 journey' : 'Not on this journey (yet)'}`)
      .addTo(map);
  });

  map.on('mouseleave', 'custom-country-fills', () => hoverPopup.remove());

  document.getElementById('counter').innerText =
    `🌍 2026 Journey Countries: ${journeyCountries.length}`;

  // ----------------------------------------
  // CURRENT LOCATION PULSING DOT
  // ----------------------------------------
  map.addSource('current-location', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-82.5748, 27.4989] }
      }]
    }
  });

  const size = 125;
  const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    onAdd: function () {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      this.context = canvas.getContext('2d');
    },
    render: function () {
      const duration = 2000;
      const t = (performance.now() % duration) / duration;
      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;
      const ctx = this.context;

      ctx.clearRect(0, 0, size, size);

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(176,46,12, ${1 - t})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#B02E0C';
      ctx.strokeStyle = 'rgba(70,30,15,1)';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      const imageData = ctx.getImageData(0, 0, size, size);
      this.data.set(imageData.data);

      map.triggerRepaint();
      return true;
    }
  };

  map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

  map.addLayer({
    id: 'current-location-dot',
    type: 'symbol',
    source: 'current-location',
    layout: {
      'icon-image': 'pulsing-dot',
      'icon-size': 0.5
    }
  });

  // ----------------------------------------
  // JOURNEY LINES (arcs)
  // ----------------------------------------
  const sa = [-98.4936, 29.4241];     // San Antonio
const atx = [-97.7431, 30.2672];    // Austin
const fl  = [-82.5748, 27.4989];    // Bradenton, FL
const newcastle = [-1.6178, 54.9783];

// Generate curved arcs
const sa_to_atx_arc = generateArc(sa, atx);
const atx_to_fl_arc = generateArc(atx, fl);
const atx_to_newcastle_arc = generateArc(fl, newcastle);

// Add source
map.addSource('journey-line', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: sa_to_atx_arc
        },
        properties: { name: "San Antonio → Austin" }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: atx_to_fl_arc
        },
        properties: { name: "Austin → Florida" }
      },
      {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: atx_to_newcastle_arc
  },
  properties: { name: "Florida → Newcastle" }
}
    ]
  }
});
// Drop Shadow for Line Layer
map.addLayer({
  id: 'journey-line-shadow',
  type: 'line',
  source: 'journey-line',
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  },
  paint: {
    'line-color': 'rgba(0, 0, 0, 0.45)',
    'line-width': 8,
    'line-blur': 6,
    'line-opacity': .8
  }
});

// ----------------------------
// Main Journey Line (Glowing)
// ----------------------------
map.addLayer({
  id: 'journey-line-layer',
  type: 'line',
  source: 'journey-line',
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  },
  paint: {
    'line-color': '#0A84FF',   // deep blue base color
    'line-width': 3.5,
    'line-opacity': 1,
    'line-blur': 1.3
  }
});

  // ----------------------------------------
  // JOURNEY STOP POPUPS
  // ----------------------------------------
  const stops = [
    {
      coords: sa,
      title: "Start of the Journey — San Antonio",
      description: `
        Everything starts here. I lived with my sister, saved money, trained,
        and got ready for a year of traveling the world.
      `,
      popupImage: "photos/photoSA.JPG",
      icon: "icons/sa.JPG"
    },
     {
      coords: atx,
      title: "Celebrating the New Years Right",
      description: `
        Beginning the journey in with my first stop in Austin, Texas to celebrate the beginning of 2026 right. 
        <br><br>
        <a href="https://medium.com/@michaelkarapetian/"
       target="_blank"
       style="color:#B87300; font-weight:bold; text-decoration:underline;">
       Read the full story on Medium →
       </a>
      `,
      popupImage: "photos/Austintest.JPG",
      icon: "icons/austintest.JPG"
    }
  ];

  stops.forEach((stop) => {
    // Thumbnail Icon Styles 
    const el = document.createElement('div');
    el.className = 'photo-marker';
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.borderRadius = '50%';
    el.style.backgroundImage = `url(${stop.icon})`;
    el.style.backgroundSize = 'cover';
    el.style.border = '3px solid black';
    el.style.cursor = 'pointer';

    el.addEventListener('click', () => {
  map.flyTo({
    center: stop.coords,
    zoom: 6,           // adjust how close you want it
    speed: 0.8,        // smooth fly
    curve: 1.4,        // prettier animation
    essential: true
  });
});

    // Add marker to map
    new mapboxgl.Marker(el)
      .setLngLat(stop.coords)
      .setPopup(
        new mapboxgl.Popup().setHTML(`
          <div style="max-width: 260px;">
            <h3>${stop.title}</h3>
            <img src="${stop.popupImage}" style="width:100%; border-radius:10px; margin-bottom:8px;" />
            <p>${stop.description}</p>
          </div>
        `)
      )
      .addTo(map);
  });
});



