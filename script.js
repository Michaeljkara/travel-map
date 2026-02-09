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
  "United States of America", "United Kingdom","Norway", "Germany", "Luxembourg", "Belgium", "France", "Armenia"
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
        geometry: { type: 'Point', coordinates: [44.5152, 40.1872] }
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
const gnv = [-82.3248, 29.6516]; // Gainesville, FL
const fl  = [-82.5748, 27.4989];    // Bradenton, FL
const miami = [-80.1918, 25.7617];  // Miami, FL
const newcastle = [-1.6178, 54.9783]; // Newcastle, UK
const voss = [6.4147, 60.6287];     // Voss, Norway
const london = [-0.1276, 51.5074];  // London, UK
const berlin = [13.4050, 52.5200];  // Berlin, Germany
const lux = [6.1319, 49.6116];      // Luxembourg City, Luxembourg
const belgium = [5.8199, 49.6825];  // Brussels, Belgium
const paris = [2.3522, 48.8566];    // Paris, France
const yerevan = [44.5152, 40.1872]; // Yerevan, Armenia



// Generate curved arcs
const sa_to_atx_arc = generateArc(sa, atx);
const atx_to_gnv_arc = generateArc(atx, gnv);
const gnv_to_fl_arc = generateArc(gnv, fl);
const fl_to_miami_arc = generateArc(fl, miami);
const miami_to_fl_arc = generateArc(miami, fl);
const fl_to_newcastle_arc = generateArc(fl, newcastle);
const newcastle_to_voss_arc = generateArc(newcastle, voss);
const voss_to_london_arc = generateArc(voss, london);
const london_to_newcastle_arc = generateArc(london, newcastle);
const newcastle_to_berlin_arc = generateArc(newcastle, berlin);
const berlin_to_lux_arc = generateArc(berlin, lux);
const lux_to_belgium_arc = generateArc(lux, belgium);
const belgium_to_lux_arc = generateArc(belgium, lux);
const lux_to_paris_arc = generateArc(lux, paris);
const paris_to_yerevan_arc = generateArc(paris, yerevan);

// Add source
map.addSource('journey-line', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: sa_to_atx_arc },
        properties: { name: "San Antonio → Austin" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: atx_to_gnv_arc },
        properties: { name: "Austin → Gainesville" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: gnv_to_fl_arc },
        properties: { name: "Gainesville → Bradenton" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: fl_to_miami_arc },
        properties: { name: "Bradenton → Miami" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: miami_to_fl_arc },
        properties: { name: "Miami → Bradenton" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: fl_to_newcastle_arc },
        properties: { name: "Bradenton → Newcastle" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: newcastle_to_voss_arc },
        properties: { name: "Newcastle → Voss" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: voss_to_london_arc },
        properties: { name: "Voss → London" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: london_to_newcastle_arc },
        properties: { name: "London → Newcastle" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: newcastle_to_berlin_arc },
        properties: { name: "Newcastle → Berlin" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: berlin_to_lux_arc },
        properties: { name: "Berlin → Luxembourg" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: lux_to_belgium_arc },
        properties: { name: "Luxembourg → Belgium" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: belgium_to_lux_arc },
        properties: { name: "Belgium → Luxembourg" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: lux_to_paris_arc },
        properties: { name: "Luxembourg → Paris" }
      },
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: paris_to_yerevan_arc },
        properties: { name: "Paris → Yerevan" }
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
  dates: "📍Dec 2025",
  description: `
    The journey starts here. Said goodbye to my family and friends,
    packed my car with all of my belongings and began a road trip
    across the country back to Florida.
  `,
  popupImage: "photos/photoSA.JPG",
  icon: "icons/sa.JPG"
},

{
  coords: atx,
  title: "Celebrating the New Years Right in Austin, TX",
  dates: "📍Jan 1–2, 2026",
  description: `
    Beginning the journey with my first stop in Austin, Texas
    to celebrate the beginning of 2026 right.
    <br><br>
    <a href="https://medium.com/@michaeljkarapetian/"
       target="_blank"
       style="color:#B87300; font-weight:bold; text-decoration:underline;">
       Check out my Medium to read more of my adventures.
    </a>
  `,
  popupImage: "photos/PhotoAustin.JPG",
  icon: "icons/IconAustin.JPG"
},

{
  coords: gnv,
  title: "Gainesville, Florida — Stop on the way to Tampa",
  dates: "📍Jan 2-3, 2026",
  description: `
    Stayed with our friend Shadee who cooked us a delicious Persian meal.
    Perfect after driving for hours on end.
  `,
  popupImage: "photos/gnvphoto.JPG",
  icon: "icons/gnvicon.JPG"
},

{
  coords: fl,
  title: "Bradenton / Tampa Area",
  dates: "📍Jan 3-23, 2026",
  description: `
    TODO: Add description for your Florida stay.
  `,
  popupImage: "photos/fl.jpg",
  icon: "icons/flcopy.jpg"
},

{
  coords: miami,
  title: "Miami",
  dates: "📍Jan 17-19, 2026",
  description: `
    Short stop with an old friend before I left for a year.
    Part of the goodbye tour.
  `,
  popupImage: "photos/miami.jpeg",
  icon: "icons/miamicopy.jpeg"
},

{
  coords: newcastle,
  title: "Newcastle, UK",
  dates: "📍Jan 24 - Feb 4, 2026",
  description: `
    The trip officially starts! Visited family in Newcastle, UK
    to start the trip. Cold and rainy but a ton of fun.
  `,
  popupImage: "photos/morpeth.jpg",
  icon: "icons/morpethcopy.jpg"
},

{
  coords: voss,
  title: "Voss, Norway",
  dates: "📍Jan 27 - 30, 2026",
  description: `
    Traveled to Voss, Norway to snowboard for the first time.
    Lake Vangsvatnet was completely frozen and we walked across it.
  `,
  popupImage: "photos/norway.jpg",
  icon: "icons/norwaycopy.jpg"
},

{
  coords: london,
  title: "London, UK",
  dates: "📍Jan 30 - Feb 1, 2026",
  description: `
    First time in London exploring a city founded in 47 AD,
    with history everywhere you look.
  `,
  popupImage: "photos/london.jpg",
  icon: "icons/londoncopy.jpg"
},

{
  coords: berlin,
  title: "Berlin, Germany",
  dates: "📍Feb 4 - 7 2026",
  description: `
    Explored the city through ice and snow.
    Seeing kids sledding where the Berlin Wall once stood was unforgettable.
  `,
  popupImage: "photos/berlin.jpg",
  icon: "icons/berlincopy.jpg"
},

{
  coords: lux,
  title: "Luxembourg City",
  dates: "📍Feb 7 - 10, 2026",
  description: `
    Visited an old friend. One giant castle disguised as a city.
    Easily one of my favorite places.
  `,
  popupImage: "photos/lux.jpg",
  icon: "icons/luxcopy.jpg"
},

{
  coords: belgium,
  title: "Brussels, Belgium",
  dates: "📍Feb 7 2026",
  description: `
    Crossed into Belgium for fries and metralletas.
  `,
  popupImage: "photos/belgium.jpg",
  icon: "icons/belgiumcopy.jpg"
},

{
  coords: paris,
  title: "Paris, France",
  dates: "📍Feb 10 - Feb 13, 2026",
  description: `
    Rested in Paris before officially heading to Armenia.
  `,
  popupImage: "photos/placeholder.jpg",
  icon: "icons/placeholder.jpg"
},
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
            <h4>${stop.dates}</h4>
            <img src="${stop.popupImage}" style="width:100%; border-radius:10px; margin-bottom:8px;" />
            <p>${stop.description}</p>
          </div>
        `)
      )
      .addTo(map);
  });
});



