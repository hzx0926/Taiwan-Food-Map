const map = L.map('map').setView([25.0330, 121.5654], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let markers = [];
let userLat = 25.0330;
let userLng = 121.5654;

// 📍 定位
navigator.geolocation.getCurrentPosition(async (pos) => {
  userLat = pos.coords.latitude;
  userLng = pos.coords.longitude;

  map.setView([userLat, userLng], 16);

  L.marker([userLat, userLng])
    .addTo(map)
    .bindPopup("📍 你的位置");

  await loadRestaurants(userLat, userLng, "");
});

// 🔍 搜尋按鈕
async function searchFood() {
  const keyword = document.getElementById("searchBox").value;
  await loadRestaurants(userLat, userLng, keyword);
}

// 🍜 Overpass API 查詢
async function loadRestaurants(lat, lng, keyword) {

  // 清除舊 markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  let filter = "";

  // 關鍵字轉 OSM 類型
  if (keyword.includes("咖啡")) filter = "cafe";
  else if (keyword.includes("速食") || keyword.includes("炸")) filter = "fast_food";
  else filter = "restaurant";

  const query = `
  [out:json];
  (
    node["amenity"="${filter}"](around:1000,${lat},${lng});
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

    // 🔎 關鍵字過濾（中文模糊搜尋）
    if (keyword && !name.includes(keyword) && keyword !== "") return;

    const marker = L.marker([el.lat, el.lon]).addTo(map);

    marker.bindPopup(`
      <b>${name}</b><br/>
      類型：${el.tags?.amenity || "restaurant"}
    `);

    markers.push(marker);
  });
}
