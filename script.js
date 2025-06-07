// 1) Initialize the map centered on Salzburg
const map = L.map("map").setView([47.8095, 13.0550], 13);

// 2) Add base map layer
L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png",
  {
    attribution:
      'Map tiles by <a href="https://stamen.com">Stamen Design</a>, CC BY 3.0 — ' +
      'Data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 20,
  }
).addTo(map);

// 3) Define categories with labels, colors, and icon names
const categories = {
  museum: "Museums",
  gallery: "Galleries",
  memorial: "Memorials",
  arts_centre: "Cultural Centres",
  other: "Other",
};
const categoryColors = {
  museum: "#e74c3c",
  gallery: "#3498db",
  memorial: "#2ecc71",
  arts_centre: "#f1c40f",
  other: "#7f8c8d",
};
const categoryIcons = {
  museum: "landmark",
  gallery: "paint-brush",
  memorial: "archway",
  arts_centre: "theater-masks",
  other: "map-marker-alt",
};

// 4) Cluster settings: uniform purple color, size varies by number of markers
const clusterOptions = {
  showCoverageOnHover: false,
  maxClusterRadius: 50,
  iconCreateFunction: (cluster) => {
    const count = cluster.getChildCount();
    let size = "small";
    if (count >= 20) size = "large";
    else if (count >= 10) size = "medium";

    const color = "#9b59b6"; // purple for all clusters
    const dimensions = size === "small" ? 30 : size === "medium" ? 40 : 50;
    const anchor = dimensions / 2;

    return L.divIcon({
      html: `<div style="background-color:${color}"><span>${count}</span></div>`,
      className: `marker-cluster marker-cluster-${size}`,
      iconSize: L.point(dimensions, dimensions),
      iconAnchor: [anchor, anchor],
    });
  },
};

// 5) Create a marker cluster group for each category and add it to the map
const categoryClusters = {};
Object.keys(categories).forEach((key) => {
  const group = L.markerClusterGroup(clusterOptions);
  group.addTo(map);
  categoryClusters[key] = group;
});

// 6) Add a legend / layer control for the five categories
const overlays = {};
Object.entries(categories).forEach(([key, label]) => {
  const color = categoryColors[key];
  const icon = categoryIcons[key];
  const html = `<i class="fas fa-${icon}" style="color:${color}; margin-right:6px"></i>${label}`;
  overlays[html] = categoryClusters[key];
});
L.control.layers(null, overlays, { collapsed: false }).addTo(map);

// Helper: compute a simple centroid for (multi)polygons
function centroid(rings) {
  const allPoints = rings.flat();
  const lng = allPoints.reduce((sum, pt) => sum + pt[0], 0) / allPoints.length;
  const lat = allPoints.reduce((sum, pt) => sum + pt[1], 0) / allPoints.length;
  return [lng, lat];
}

// 7) Load GeoJSON, classify features, and add markers to clusters
fetch("data/cultural_locations.geojson")
  .then((res) => {
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  })
  .then((data) => {
    data.features.forEach((feature) => {
      let coords;
      const geom = feature.geometry;
      if (geom.type === "Point") {
        coords = geom.coordinates;
      } else if (geom.type === "Polygon") {
        coords = centroid(geom.coordinates);
      } else if (geom.type === "MultiPolygon") {
        coords = centroid(geom.coordinates.flat());
      } else {
        return; // skip unsupported geometry types
      }

      const [lng, lat] = coords;
      const latlng = L.latLng(lat, lng);
      const props = feature.properties;

      // Build popup content
      const details = [];
      if (props.description) details.push(`<p>${props.description}</p>`);
      const address = [
        props["addr:street"],
        props["addr:housenumber"],
        props["addr:postcode"],
        props["addr:city"],
      ]
        .filter(Boolean)
        .join(", ");
      if (address) details.push(`<p>${address}</p>`);
      details.push(`<p>${props.opening_hours || "Opening hours not available"}</p>`);
      if (props.wheelchair) {
        details.push(`<p>Wheelchair access: <strong>${props.wheelchair}</strong></p>`);
      }
      if (props.website) {
        details.push(
          `<p><a href="${props.website}" target="_blank">Website</a></p>`
        );
      }
      const popupContent =
        `<strong>${props.name || "Unnamed"}</strong>` + details.join("");

      // Determine category
      let type = "other";
      if (props.tourism === "museum") type = "museum";
      else if (
        ["gallery", "art_gallery"].includes(props.tourism) ||
        props.amenity === "gallery" ||
        props.leisure === "gallery"
      )
        type = "gallery";
      else if (props.historic === "memorial") type = "memorial";
      else if (
        props["arts:centre"] ||
        props.amenity === "arts_centre" ||
        props.tourism === "attraction" ||
        props["cultural_centre"]
      )
        type = "arts_centre";

      // Create and style the marker
      const col = categoryColors[type];
      const iconName = categoryIcons[type];
      const marker = L.marker(latlng, {
        icon: L.divIcon({
          className: "custom-marker",
          html: `
            <div class="marker-icon" style="border-color: ${col};">
              <i class="fas fa-${iconName}" style="color: ${col}; font-size:14px;"></i>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        }),
      }).bindPopup(popupContent);

      categoryClusters[type].addLayer(marker);
    });
  })
  .catch((err) => {
    console.error(err);
    alert("Could not load GeoJSON: " + err.message);
  });