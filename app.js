const map = L.map('map').setView([25.0330, 121.5654], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let markers = [];
let placesData = [];
let userLat = 25.0330;
let userLng = 121.5654;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

// 📍 定位
navigator.geolocation.getCurrentPosition(async (pos) => {
  userLat = pos.coords.latitude;
  userLng = pos.coords.longitude;

  map.setView([userLat, userLng], 16);

  L.marker([userLat, userLng])
    .addTo(map)
    .bindPopup("📍 你的位置");

  await loadRestaurants();
});

// 🔍 搜尋
async function searchFood() {
  await loadRestaurants();
}

// 🍜 抓餐廳
async function loadRestaurants() {

  const keyword = document.getElementById("searchBox").value;

  // 清除舊資料
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  placesData = [];

  let filter = "restaurant";

  if (keyword.includes("咖啡")) filter = "cafe";
  else if (keyword.includes("炸") || keyword.includes("速食")) filter = "fast_food";

  const query = `
  [out:json];
  (
    node["amenity"="${filter}"](around:1000,${userLat},${userLng});
  );
  out;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  });

  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.elements.forEach((el) => {
    if (!el.lat || !el.lon) return;

    const name = el.tags?.name || "未知餐廳";

    // 🔎 中文關鍵字過濾
    if (keyword && !name.includes(keyword) && keyword !== "") return;

    const place = {
      name,
      lat: el.lat,
      lng: el.lon,
      type: el.tags?.amenity || "restaurant"
    };

    placesData.push(place);

    // 📍 marker
    const marker = L.marker([place.lat, place.lng]).addTo(map);
    marker.bindPopup(`<b>${place.name}</b>`);

    markers.push(marker);

    // 🧾 Uber風格卡片
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${place.name}</h3>
      <small>${place.type}</small>
    `;

    card.onclick = () => {
      map.setView([place.lat, place.lng], 18);
      marker.openPopup();
    };

    list.appendChild(card);
  });
}
