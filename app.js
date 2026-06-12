const map = L.map('map').setView([25.0330, 121.5654], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let markers = [];
let placesData = [];

let userLat = 25.0330;
let userLng = 121.5654;

// ⭐ 收藏資料
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
  list.innerHTML = "<h3>🍽️ 附近餐廳</h3>";

  data.elements.forEach((el) => {
    if (!el.lat || !el.lon) return;

    const name = el.tags?.name || "未知餐廳";

    if (keyword && keyword !== "" && !name.includes(keyword)) return;

    const place = {
      name,
      lat: el.lat,
      lng: el.lon,
      type: el.tags?.amenity || "restaurant"
    };

    placesData.push(place);

    const marker = L.marker([place.lat, place.lng]).addTo(map);
    marker.bindPopup(`<b>${place.name}</b>`);

    markers.push(marker);

    // 🧾 卡片
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${place.name}</h3>
      <small>${place.type}</small>
      <br/>
      <button class="fav-btn">
        ${isFavorite(place.name) ? "❤️ 已收藏" : "🤍 收藏"}
      </button>
    `;

    // 點卡片 → 地圖移動
    card.onclick = () => {
      map.setView([place.lat, place.lng], 18);
      marker.openPopup();
    };

    // ❤️ 收藏
    card.querySelector(".fav-btn").onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(place);
    };

    list.appendChild(card);
  });

  renderFavorites();
}

// ❤️ 收藏 / 取消收藏
function toggleFavorite(place) {
  const index = favorites.findIndex(f => f.name === place.name);

  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(place);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));

  loadRestaurants();
  renderFavorites();
}

// 🔎 是否收藏
function isFavorite(name) {
  return favorites.some(f => f.name === name);
}

// ❤️ 渲染收藏區
function renderFavorites() {
  const fav = document.getElementById("favorites");

  fav.innerHTML = "<h3>❤️ 我的收藏</h3>";

  favorites.forEach(place => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${place.name}</h3>
      <small>${place.type}</small>
    `;

    div.onclick = () => {
      map.setView([place.lat, place.lng], 18);
    };

    fav.appendChild(div);
  });
}
