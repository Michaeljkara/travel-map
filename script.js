mapboxgl.accessToken = 'pk.eyJ1IjoibWljaGFlbGprYXJhIiwiYSI6ImNtYXZ6eWtjaDA5dHMycXB1bGhvMmFxc3IifQ.T_KW1Imu0r__UTSp3VT_GA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/michaeljkara/cmbmpgyyi00bl01qq1npreyty',
  center: [0, 20],
  zoom: 1.5,
  projection: 'mercator'
});

// 🌍 Visited countries data
const visitedInfo = {
  "Costa Rica": {
    status: "Visited Spring 2022",
    popup: "Been three times. La Fortuna, Puerto Viejo, and most recently, Tamarindo. Turns out I'm a great surfer."
  },
  "United States of America": {
    status: "Home Base",
    popup: "Born and Raised, and currently live here. USA USA USA RAAAAA"
  },
  "Bahamas": {
    status: "Visited Summer 2018",
    popup: "First country I've ever visited. Beautiful island, and great beaches"
  },
  "Singapore": {
    status: "Visted Fall 2022",
    popup: "Saw the Pearl. Coolest airport I've ever seen."
  },
  "Philippines": {
    status: "Visited Fall 2022",
    popup: "Went for Miss Earth 2022, and visited El Nido. Incredible country"
  },
  "Taiwan": {
    status: "Visited Fall 2022",
    popup: "First visited in 2022, but returned in 2023 for Asian Environmental Summit. Boba tea here is top tier."
  },
  "Estonia": {
    status: "Visited Winter 2023",
    popup: "First european country. Went for Let's Do It World 2023 confernece. Old town is incredible."
  },
   "Canada": {
    status: "Visited Summer 2023",
    popup: "Visited for 3 hours just to jump out of a plane. Great view."
  },
  "Japan": {
    status: "Visited Fall 2023",
    popup: "Visited for Miss International 2023. Kyoto is my favorite city so far."
  },
  "United Kingdom": {
    status: "Visited Winter 2023",
    popup: "Went on a top secret mission."
  },
  "Austria": {
    status: "Visited Spring 2024",
    popup: "Layover on the way to Armenia. Did a cleanup off of the Danube then fell asleep on a massage chair in the airport."
  },
  "Armenia": {
    status: "Visited Spring 2024",
    popup: "Went for Earth Day 2024. Explored the country, reunited with my family, picked up trash on Lake Yerevan, and hitchhiked across the country."
  },
  "Netherlands": {
    status: "Visited Fall 2024",
    popup: "Started a short backpacking trip here and had my chain jacked. Still 10/10 and can't wait to go back."
  },
  "Belgium": {
    status: "Visited Fall 2024",
    popup: "On the way to Lux, and enjoyed a few stops through the country on a very beautiful train."
  },
  "Luxembourg": {
    status: "Visited Fall 2024",
    popup: "Visited a friend, and explored the incredible city of Luxembourg. It's like a giant castle they turned into a city. Absolutely gorgeous."
  },
  "Spain": {
    status: "Visited Fall 2024",
    popup: "Dancing and whole lot of Jamón Serrano."
  },
  "Andorra": {
    status: "Visted Fall 2024",
    popup: "Found out about this country when looking at a map one day. Who knew there was a country between Spain and France. I had to visit. Amazing hiking, and incredibly nice people. Highly recommend."
  },
  "Mexico": {
    status: "Visited Winter 2025",
    popup: "Short weekend trip filled mostly with dancing to salsa. Also the food is as good as it gets, I think."
  },
  "Nicaragua": {
    status: "Visited Summer 2025",
    popup: "Crossed the border from Costa Rica, drove bikes across Ometepe Island, and then boarded down a Volcano in Leon."
  },

};

map.on('load', () => {
  // ✅ Load countries GeoJSON
  map.addSource('custom-countries', {
    type: 'geojson',
    data: 'data/custom.geo.json' // Make sure this file exists in that path
  });

  // 🎨 Country fill colors
  map.addLayer({
    id: 'custom-country-fills',
    type: 'fill',
    source: 'custom-countries',
    layout: {},
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'name'], 'United States of America'], '#4CAF50',
        ['in', ['get', 'name'], ['literal', Object.keys(visitedInfo)]], '#2274A5',
        'rgba(0,0,0,0)'
      ],
      'fill-opacity': 0.4
    }
  });

  // 🟫 Borders
  map.addLayer({
    id: 'custom-country-borders',
    type: 'line',
    source: 'custom-countries',
    layout: {},
    paint: {
      'line-color': '#083D77',
      'line-width': 0.5
    }
  });

  // 🐭 Hover popup
  const hoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

  map.on('mousemove', 'custom-country-fills', (e) => {
    const feature = e.features[0];
    const name = feature.properties.name || feature.properties.ADMIN || 'Unknown';
    const visited = visitedInfo[name];
    const status = visited ? visited.status : 'Not Visited';

    hoverPopup.setLngLat(e.lngLat).setHTML(`<strong>${name}</strong><br>${status}`).addTo(map);
  });

  map.on('mouseleave', 'custom-country-fills', () => hoverPopup.remove());

  // 🖱 Click for visited popups
  map.on('click', 'custom-country-fills', (e) => {
    const feature = e.features[0];
    const name = feature.properties.name || feature.properties.ADMIN || 'Unknown';
    const visited = visitedInfo[name];
    if (!visited) return;

    map.flyTo({ center: e.lngLat, zoom: 4 });

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`<h3>${name}</h3><p>${visited.popup}</p>`)
      .addTo(map);
  });

  // ✅ Display number of visited countries
  document.getElementById('counter').innerText = `🌍 Countries visited: ${Object.keys(visitedInfo).length}`;

  // ✅ Add current location source
  map.addSource('current-location', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-98.491142, 29.4243492] // San Antonio
          },
          properties: {}
        }
      ]
    }
  });

  // ✅ Define pulsing dot
  const size = 125;

  const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd: function () {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext('2d');
      this.map = map;
        this.image = {
    width: this.width,
    height: this.height,
    data: new Uint8Array(this.width * this.height * 4)
        };
    },

    render: function () {
      const duration = 2000;
      const t = (performance.now() % duration) / duration;

      const radius = (this.width / 2) * 0.3;
      const outerRadius = (this.width / 2) * 0.7 * t + radius;
      const context = this.context;

      context.clearRect(0, 0, this.width, this.height);

      // Outer ring
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
      context.fillStyle = `rgba(34, 197, 94, ${1 - t})`; // Outer green
      context.shadowColor = 'rgba(34, 197, 94, 0.4)';
      context.shadowBlur = 10;
      context.fill();

      // Inner dot
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(34, 197, 94, 1)'; // Inner green
      context.strokeStyle = '#ffffff';
      context.lineWidth = 2 + 2 * (1 - t);
      context.fill();
      context.stroke();

      const imageData = context.getImageData(0, 0, size, size);
      this.data.set(imageData.data);

      this.map.triggerRepaint();
      return true;
    }
  };

  // ✅ Add image and layer
  map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

map.addLayer({
  id: 'current-location-dot',
  type: 'symbol',
  source: 'current-location',
  layout: {
    'icon-image': 'pulsing-dot',
    'icon-size': 0.5 // Adjust this if it's too small or large
  }
  
  });
});


