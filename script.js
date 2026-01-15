const api_key = "863242cfb2b1d357e6093d9a4df19a4b";
const searchBtn = document.querySelector('#searchBtn');
const cityInput = document.querySelector('#cityInput');

// 1. Ob-havo ma'lumotlarini olish funksiyasi
async function get_weather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${api_key}&lang=uz`;
    fetchData(url);
}

// 2. Koordinatalar bo'yicha ob-havoni olish (GPS uchun)
async function get_weather_by_coords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}&lang=uz`;
    fetchData(url);
}

// Ma'lumotlarni ekranga chiqarish (umumiy funksiya)
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if(data.cod === "404") {
            alert("Shahar topilmadi!");
            return;
        }

        document.getElementById('cityName').innerText = data.name;
        document.getElementById('temp').innerText = Math.round(data.main.temp) + "°C";
        document.getElementById('desc').innerText = data.weather[0].description;
        document.getElementById('humidity').innerText = data.main.humidity + "%";
        document.getElementById('wind').innerText = data.wind.speed + " km/s";
        
        const iconCode = data.weather[0].icon;
        document.getElementById('mainIcon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    } catch (error) {
        console.log("Xatolik yuz berdi");
    }
}

// 3. Foydalanuvchi joylashgan nuqtani aniqlash (Geolocation API)
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            get_weather_by_coords(lat, lon);
        }, () => {
            // Agar foydalanuvchi GPS-ga ruxsat bermasa, Toshkentni ko'rsatamiz
            get_weather("Tashkent");
        });
    } else {
        get_weather("Tashkent");
    }
}

// Sayt yuklanishi bilan joylashuvni aniqlashni boshlash
window.onload = getLocation;

searchBtn.addEventListener('click', () => {
    get_weather(cityInput.value);
});

cityInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') get_weather(cityInput.value);
});
