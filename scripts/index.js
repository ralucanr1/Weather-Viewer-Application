document.addEventListener("DOMContentLoaded", (_event) => {
    
    const inputElement = document.getElementById("city-input"); 
    const suggestionList = document.getElementById("suggestions"); 
    const weatherCard = document.getElementById("weather-card"); 
    const favoritesList = document.getElementById("favorites-list"); 
    const forecastCard = document.getElementById("forecast-card"); 

    const favorites = JSON.parse(localStorage.getItem("favorites")) || []; 

    
    function displayFavorites() {
        favoritesList.innerHTML = ''; 

        if (favorites.length === 0) {
            favoritesList.innerHTML = '<li>Nu există orașe favorite.</li>';
        } else {
            favorites.forEach(city => {
                const listItem = document.createElement("li"); 

                const cityName = document.createElement("span");
                cityName.textContent = city;

                const heartIcon = document.createElement("span");
                heartIcon.textContent = "❤️"; 
                heartIcon.style.cursor = "pointer"; 
                heartIcon.style.marginLeft = "10px"; 

               
                heartIcon.addEventListener("click", () => {
                    getWeather(city); 
                    setBackgroundImage(city); 
                    getForecast(city); 
                });

               
                listItem.appendChild(cityName);
                listItem.appendChild(heartIcon);

                favoritesList.appendChild(listItem);
            });
        }
    }

    function addToFavorites(city) {
        if (!favorites.includes(city)) {
            favorites.push(city);
            localStorage.setItem("favorites", JSON.stringify(favorites)); 
            displayFavorites();
        }
    }

   
    function getWeather(city) {
        const apiKey = "483e5f8f7ba84aeea87ed425236645c4"; 
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    weatherCard.innerHTML = `
                        <h2>Vremea în ${data.name}</h2>
                        <p>Temperatură: ${data.main.temp}°C</p>
                        <p>Condiții meteo: ${data.weather[0].description}</p>
                        <p>Umiditate: ${data.main.humidity}%</p>
                    `;
                } else {
                    weatherCard.innerHTML = `<p>Nu am găsit informații pentru acest oraș.</p>`;
                }
            })
            .catch(error => {
                console.error("Eroare la obținerea datelor meteo:", error);
                weatherCard.innerHTML = `<p>Eroare la obținerea datelor meteo.</p>`;
            });
    }

    
    function setBackgroundImage(city) {
        const apiKey = "iG7hDwVO9f1AjzKSQ9IHRT9KbRDfZWk9crqkfUOkeqlsNYwejCrL7cjj"; 
        fetch(`https://api.pexels.com/v1/search?query=${city}&per_page=1`, {
            headers: {
                Authorization: apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.photos && data.photos.length > 0) {
                const imageUrl = data.photos[0].src.original;
                document.body.style.backgroundImage = `url(${imageUrl})`;
            } else {
                document.body.style.backgroundImage = 'url(default-background.jpg)'; 
            }
        })
        .catch(error => {
            console.error("Eroare la obținerea imaginii de fundal:", error);
            document.body.style.backgroundImage = 'url(default-background.jpg)'; 
        });
    }

    
    function getForecast(city) {
        const apiKey = "e47fb742e7a0841d6057259b35754232"; 
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === "200") {
                    let forecastHTML = `<h2>Prognoza pe 5 zile pentru ${data.city.name}</h2>`;
                    const forecasts = data.list.filter((_, index) => index % 8 === 0); 
                    forecasts.forEach(forecast => {
                        const date = new Date(forecast.dt * 1000).toLocaleDateString("ro-RO");
                        forecastHTML += `
                            <div>
                                <p><strong>${date}</strong></p>
                                <p>Temperatură: ${forecast.main.temp}°C</p>
                                <p>Condiții: ${forecast.weather[0].description}</p>
                                <p>Umiditate: ${forecast.main.humidity}%</p>
                            </div>
                        `;
                    });
                    forecastCard.innerHTML = forecastHTML;
                } else {
                    forecastCard.innerHTML = `<p>Nu am găsit prognoza pentru acest oraș.</p>`;
                }
            })
            .catch(error => {
                console.error("Eroare la obținerea prognozei meteo:", error);
                forecastCard.innerHTML = `<p>Eroare la obținerea prognozei meteo.</p>`;
            });
    }

    inputElement.addEventListener("input", function () {
        const query = inputElement.value.trim();
        if (query.length >= 3) {
            const apiKey = "483e5f8f7ba84aeea87ed425236645c4"; 
            fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    const suggestions = data.features || [];
                    suggestionList.innerHTML = ''; 

                    if (suggestions.length === 0) {
                        suggestionList.innerHTML = '<li>Nu am găsit sugestii pentru acest oraș.</li>';
                    } else {
                        suggestions.forEach(suggestion => {
                            const cityName = suggestion.properties.formatted;
                            const listItem = document.createElement("li");
                            listItem.textContent = cityName;
                            listItem.addEventListener("click", () => {
                                inputElement.value = cityName;
                                getWeather(cityName); 
                                setBackgroundImage(cityName); 
                                addToFavorites(cityName); 
                                getForecast(cityName); 
                            });
                            suggestionList.appendChild(listItem);
                        });
                    }
                })
                .catch(error => {
                    console.error("Eroare la obținerea sugestiilor:", error);
                    suggestionList.innerHTML = '<li>Eroare la obținerea sugestiilor.</li>';
                });
        } else {
            suggestionList.innerHTML = ''; 
        }
    });

    displayFavorites();
});
