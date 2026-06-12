// 初始化地圖（預設台北）
const map = L.map('map').setView([25.0330, 121.5654], 13);

// 加入 OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// 🍜 模擬台灣美食資料
const foods = [
  {
    name: "永和豆漿",
    type: "早餐",
    lat: 25.034,
    lng: 121.564,
    desc: "經典蛋餅 + 豆漿"
  },
  {
    name: "阿宗麵線",
    type: "小吃",
    lat: 25.042,
    lng: 121.506,
    desc: "西門町必吃麵線"
  },
  {
    name: "鼎泰豐",
    type: "小籠包",
    lat: 25.0336,
    lng: 121.5645,
    desc: "世界知名小籠包"
  }
];

// 顯示美食 marker
foods.forEach(food => {
  const marker = L.marker([food.lat, food.lng]).addTo(map);

  marker.bindPopup(`
    <b>${food.name}</b><br/>
    類型：${food.type}<br/>
    ${food.desc}
  `);
});

// 📍 使用者定位
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((pos) => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;

    L.marker([userLat, userLng])
      .addTo(map)
      .bindPopup("📍 你的位置")
      .openPopup();

    map.setView([userLat, userLng], 15);
  });
}
