const map = L.map('map').setView([25.0330, 121.5654], 15);

// OpenStreetMap 底圖
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let markers = [];

// 📍 使用者定位
navigator.geolocation.getCurrentPosition(async (pos) => {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  map.setView([lat, lng], 16);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup("📍 你的位置");

  await loadRestaurants(lat, lng);
});

// 🍜 用 Overpass API 抓餐廳
async function loadRestaurants(lat, lng) {

  const query = `
  [out:json];
  (
    node["amenity"="restaurant"](around:1000,${lat},${lng});
    node["amenity"="cafe"](around:1000,${lat},${lng});
    node["amenity"="fast_food"](around:1000,${lat},${lng});
  );
  out;
  `;

  const url = "https://overpass-api.de/api/interpreter";

  const res = await fetch(url, {
    method: "POST",
    body: query
  });

  const data = await res.json();

  data.elements.forEach(el => {
    if (!el.lat || !el.lon) return;

    const name = el.tags?.name || "未知餐廳";

    const marker = L.marker([el.lat, el.lon]).addTo(map);

    marker.bindPopup(`
      <b>${name}</b><br/>
      類型：${el.tags?.amenity || "restaurant"}
    `);

    markers.push(marker);
  });
}
