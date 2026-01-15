const apiKey = "863242cfb2b1d357e6093d9a4df19a4b"; // Ob-havo ma'lumotlarini olish uchun kalit
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");

async function checkWeather(city) {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    
    if(response.status == 404) {
        alert("Shahar nomi noto'g'ri yozilgan!");
    } else {
        var data = await response.json();

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = "Namlik: " + data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = "Shamol: " + data.wind.speed + " km/s";
        
        console.log("Ma'lumotlar yuklandi!");
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchInput.value);
});

// Sayt ochilganda birinchi bo'lib ko'rinadigan xabar
window.onload = function() {
    alert("Ob-havo saytimizga xush kelibsiz! Shahar nomini yozib qidiring.");
};
