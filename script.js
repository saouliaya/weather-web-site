const API_KEY = "348f79f939d14e98b6b4dda005dcb73b";

const appContainer = document.querySelector('.app-container');
  
const searchInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const mylocationButton = document.querySelector(".my_location-btn");
  
const cityWeather = document.querySelector(".weather-info");
const notFound = document.querySelector(".not-found");
const sideContainer = document.querySelector(".side-container");
const city = document.querySelector(".country-txt");
const temperature = document.querySelector(".temp-txt");
const sunrise = document.querySelector(".sunrise-time")
const sunset = document.querySelector(".sunset-time")
const condition = document.querySelector(".condition-txt");
const humid = document.querySelector(".humidity-value-txt");
const wind = document.querySelector(".wind-value-txt");
const icon = document.querySelector(".weather-image");
const date = document.querySelector(".current-date-txt");
const h2 = document.querySelector(".titles");
const forcastsdate = document.querySelector(".forecast-date-container");
const forcaststime = document.querySelector(".forecast-time-container");
const chart = document.querySelector(".charts-section");
const wD = document.getElementById('windDirection');

searchButton.addEventListener("click", async () => {
    if (!searchInput.value.trim()) {
        alert("Please enter the city");
        return;
    }
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchInput.value.trim()}&units=metric&appid=${API_KEY}`;
    const weatherData = await getWeatherData(apiUrl);
    displayweatherdata (weatherData)
    if (!sideContainer.classList.toggle("sidebar")) {
        sideContainer.classList.toggle("sidebar");
    }
    sideContainer.classList.toggle("sidebar");
    searchInput.value = '';
});
  
searchInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        if (!searchInput.value.trim()) {
            alert("Please enter the city");
            return;
        } 
        else {
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchInput.value.trim()}&units=metric&appid=${API_KEY}`;
            const weatherData = await getWeatherData(apiUrl);
            displayweatherdata (weatherData)
            if (!sideContainer.classList.toggle("sidebar")) {
                sideContainer.classList.toggle("sidebar");
            }
            searchInput.value = '';
        }
    }
});
    
mylocationButton.addEventListener("click",()=>{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
            const weatherData = await getWeatherData(apiUrl);
            displayweatherdata (weatherData);
            if (!sideContainer.classList.toggle("sidebar")) {
                sideContainer.classList.toggle("sidebar");
            }
            console.log(position);
            },() => {
                alert('Unable to retrieve your location');
            }
        );
    } 
    else {
        alert('Geolocation is not supported by your browser');
    }
});

async function displayweatherdata (weatherData){
    if (weatherData.cod != 200) {
        notFound.style.display = 'contents';
        forcastsdate.style.display = 'none'
        cityWeather.style.display = 'none';
        chart.style.display='none';
        h2.style.display = 'none';
        appContainer.background='none';
    }
    else{
        console.log(weatherData)
        let input =weatherData.name;
        city.textContent = input;
        date.textContent = getDate(new Date());
        temperature.textContent = `${weatherData.main.temp.toFixed(1)} °C`;
        condition.textContent = weatherData.weather[0].main;
        sunrise.textContent = getTime (weatherData.sys.sunrise * 1000);
        sunset.textContent = getTime (weatherData.sys.sunset * 1000);
        humid.textContent = `${weatherData.main.humidity}%`;
        wind.textContent = `${weatherData.wind.speed} m/s`;
        icon.src = `assets/weather/${getIcon(weatherData.weather[0].id)}`;
        await updateHourlyForecast(input);
        await updateDayForecast(input);
        updateWeatherAnimation(weatherData.weather[0].main)
        cityWeather.style.display = 'contents';
        h2.style.display = 'contents';
        forcastsdate.style.display='flex';
        chart.style.display='flex';
        notFound.style.display = 'none';
    }
}

async function getWeatherData(apiUrl) {  
    const apiResponse = await fetch(apiUrl);
    return apiResponse.json();
}

async function updateHourlyForecast(input) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${input}&units=metric&appid=${API_KEY}`;
    const forecasts = await getWeatherData(apiUrl);
    console.log(forecasts)
    forcaststime.innerHTML = '';
    const hours = forecasts.list.slice(0, 7);
    const times = [];
    const temps = [];
    const humidity =[];
    hours.forEach(hour => {
        const time = getTime(hour.dt * 1000);
        const temp = hour.main.temp.toFixed(1);
        const icon = getIcon(hour.weather[0].id)
        const forcastsItem = `
            <div class="forecast-item-time">  
                <h5 class="forecast-item-time-txt">${time}</h5>
                <img src="assets/weather/${icon}" class="forecast-item-time-img">  
                <h5 class="forecast-item-time-temp">${temp}°C</h5>  
            </div> `;
        forcaststime.insertAdjacentHTML('beforeend', forcastsItem);
        const humid = hour.main.humidity
        times.push(time);
        temps.push(temp);
        humidity.push(humid);
    });
    await updateTimeChart(times,temps,humidity);
    windTable(hours);
}

async function updateDayForecast(input) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${input}&units=metric&appid=${API_KEY}`;
    const forecasts = await getWeatherData(apiUrl);
    const time1 = '12:00:00';
    const time2 = '00:00:00';
    const day = new Date().toISOString().split('T')[0];
    const days = [];
    const temps = [];
    const humidity =[];
    forcastsdate.innerHTML = '';
    forecasts.list.forEach(forecast => {
        if ((forecast.dt_txt.includes(time1) || forecast.dt_txt.includes(time2)) && !forecast.dt_txt.includes(day)) {
            const date = getDate(forecast.dt_txt);
            const temp =forecast.main.temp.toFixed(1);
            const icon = getIcon(forecast.weather[0].id)
            const time = getTime(forecast.dt_txt);
            const forcastsItem = `
                <div class="forecast-item-date">  
                    <h5 class="forecast-item-date-txt regular-txt">${date}</h5>                        
                    <h5 class="forecast-item-time-txt"> ${time} </h5>
                    <img src="assets/weather/${icon}" class="forecast-item-date-img">  
                    <h5 class="forecast-item-date-temp regular-txt">${temp}°C</h5>  
                </div> `;
            forcastsdate.insertAdjacentHTML('beforeend', forcastsItem);
            const humid = forecast.main.humidity
            days.push(date);
            temps.push(temp);                
            humidity.push(humid);
        }  
    })
    await updateDateChart(days,temps,humidity);
}

function getIcon(id) {
    if (id <= 232) return 'storm.png';
    if (id <= 321) return 'mist.png';
    if (id <= 531) return 'rain.png';
    if (id <= 622) return 'snow.png';
    if (id <= 800) return 'clear.png';
    else return 'clouds.png';
}

function getDate(date) {
    const currentDate =new Date (date)
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'};
    return currentDate.toLocaleDateString('en-GB', options);
}

function getTime (time){
    time = new Date(time);
    const options ={ 
        hour: '2-digit', 
        minute: '2-digit' };
    return time.toLocaleTimeString('en-US',options);
}

function getWindDirection(degrees) {
    if (degrees >= 22.5 && degrees < 67.5) return 'NorthEast.png';
    if (degrees >= 67.5 && degrees < 112.5) return 'East.png';
    if (degrees >= 112.5 && degrees < 157.5) return 'SouthEast.png';
    if (degrees >= 157.5 && degrees < 202.5) return 'South.png';
    if (degrees >= 202.5 && degrees < 247.5) return 'SouthWest.png';
    if (degrees >= 247.5 && degrees < 292.5) return 'West.png';
    if (degrees >= 292.5 && degrees < 337.5) return 'NorthWest.png';
    return 'North.png'; // for 360° or 0°
}
function windTable(Data) {
    let i = 0;
    Data.forEach((data) => {
        const time = getTime(data.dt * 1000);  // Assuming getTime converts timestamp to readable time
        const speed = data.wind.speed;
        const degrees = data.wind.deg;

        // Update the image source based on the wind direction
        const directionImage = getWindDirection(degrees);  // Assuming this function returns a direction (e.g., 'North', 'NE')
        wD.rows[0].cells[i].getElementsByTagName('img')[0].src = `assets/wind/${directionImage}`;

        // Update wind speed
        wD.rows[1].cells[i].innerHTML = `${speed} km/h`; // Assuming you want to display speed in km/h

        // Update the time
        wD.rows[2].cells[i].innerHTML = time;

        i++;
    });
}
let timeTemp;
let timeHumidity;
async function updateTimeChart(times,temps,humidity) {
    const tT = document.getElementById('timeTemp').getContext('2d');
    if (timeTemp) {
        timeTemp.destroy();
        timeHumidity.destroy();
    }
    timeTemp = new Chart(tT, {
        type: 'bar',
        data: {
            labels: times, // X-axis labels
            datasets: [{
                label: 'Temperature (°C)', // Dataset label
                data: temps, // Data points
                backgroundColor: [
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)'
                ],
                borderColor: [
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    bodyFont: {
                        size: 20 ,
                        weight: 'bold'
                    },
                    titleFont: {
                        size: 25,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });

    const tH = document.getElementById('timeHumidity').getContext('2d');
        
    timeHumidity= new Chart(tH, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'Humidity (%)',
                data: humidity, 
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 5, 
                fill: false 
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    bodyFont: {
                        size: 20 ,
                        weight: 'bold'
                    },
                    titleFont: {
                        size: 25,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
    
}
let dayHumidity;
let dayTemp;
async function updateDateChart(days,temps,humidity) {
    const dT = document.getElementById('dayTemp').getContext('2d');
    if (dayTemp) {
        dayTemp.destroy();
        dayHumidity.destroy();
    }
    
    dayTemp = new Chart(dT, {
        type: 'bar',
        data: {
            labels: days, // X-axis labels
            datasets: [{
                label: 'Temperature (°C)', // Dataset label
                data: temps, // Data points
                backgroundColor: [
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)'
                ],
                borderColor: [
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)',
                    'rgb(75, 192, 192)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    bodyFont: {
                        size: 20 ,
                        weight: 'bold'
                    },
                    titleFont: {
                        size: 25,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });

    const dH = document.getElementById('dayHumidity').getContext('2d');
    
    dayHumidity= new Chart(dH, {
        type: 'line',
        data: {
            labels: days, // X-axis labels
            datasets: [{
                label: 'Humidity (%)', // Dataset label
                data: humidity, // Data points
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 5, 
                fill: false 
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    bodyFont: {
                        size: 20 ,
                        weight: 'bold'
                    },
                    titleFont: {
                        size: 25,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 20,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });
}

function updateWeatherAnimation(weatherCondition) {
    // Remove any existing animation classes
    appContainer.classList.remove('snowy-animation', 'rainy-animation', 'sunny-animation', 'cloudy-animation');

    // Add the corresponding animation class based on the weather condition
    switch (weatherCondition.toLowerCase()) {
        case 'snow':
            appContainer.classList.add('snowy-animation');
            break;
        case 'rain':
            appContainer.classList.add('rainy-animation');
            break;
        case 'clear':
            appContainer.classList.add('sunny-animation');
            break;
        case 'clouds':
            appContainer.classList.add('cloudy-animation');
            break; 
    }
}
