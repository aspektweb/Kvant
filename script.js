const container = document.querySelector('.app-container');
const searchBtn = document.querySelector('#searchBtn');
const cityInput = document.querySelector('#cityInput');

searchBtn.addEventListener('click', () => {
    const APIKey = '863242cfb2b1d357e6093d9a4df19a4b'; // Aktiv kalit
    const city = cityInput.value;

    if (city === '') return;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}&lang=uz`)
        .then(response => response.json())
        .then(json => {
            if (json.cod === '404') {
                alert("Kechirasiz, shahar topilmadi!");
                return;
            }

            // Ma'lumotlarni o'rnatish
            const image = document.querySelector('#weatherIcon');
            const temperature = document.querySelector('.temperature');
            const description = document.querySelector('.description');
            const humidity = document.querySelector('#humidityVal');
            const wind = document.querySelector('#windVal');

            // Ikonkani yangilash
            image.src = `https://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png`;
            
            temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
            description.innerHTML = `${json.weather[0].description}`;
            humidity.innerHTML = `${json.main.humidity}%`;
            wind.innerHTML = `${parseInt(json.wind.speed)}Km/h`;

            console.log("Muvaffaqiyatli yangilandi!");
        });
});
