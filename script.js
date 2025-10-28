

(() => {
 
  const API_KEY = 'e6bbe854d03bc9ce738f1e30c12c4688';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  
  const loaderEl = document.getElementById('loader');
  const wrapperEl = document.querySelector('.wrapper');
  const searchInputEl = document.getElementById('city-search');
  const searchBtnEl = document.querySelector('.search-btn');
  const modeSelectEl = document.getElementById('mode-select');

  const locationNameEl = document.querySelector('.location-name');
  const countryNameEl = document.querySelector('.country-name');
  const weatherIconEl = document.querySelector('.weather-condition-icon');
  const tempValueEl = document.querySelector('.temp-value');
  const weatherTextEl = document.querySelector('.weather-condition-text');

  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');

  const bgVideoEl = document.querySelector('.bg-video');
  const bgSourceEl = document.querySelector('.bg-src');

  let currentWeatherData = null; 
 
  function showLoader() {
    loaderEl.classList.remove('hidden');
    wrapperEl.classList.add('hidden');
    loaderEl.setAttribute('aria-hidden', 'false');
  }
 
  function hideLoader() {
    loaderEl.classList.add('hidden');
    wrapperEl.classList.remove('hidden');
    loaderEl.setAttribute('aria-hidden', 'true');
  }

  
  async function fetchWeather(cityName) {
   
    const url = `${BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        
        const errData = await resp.json().catch(() => null);
        const msg = errData && errData.message
          ? `Error: ${errData.message}`
          : 'Unable to fetch weather data';
        throw new Error(msg);
      }
      const data = await resp.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  
  function capitalizeWords(str) {
    return str
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

 
  function setLocationDisplay(name, countryCode) {
    locationNameEl.textContent = name;
    countryNameEl.textContent = countryCode;
  }

  
  function setWeatherIcon(iconCode, description) {
    if (iconCode) {
      weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
      weatherIconEl.alt = description || 'Weather icon';
    } else {
      weatherIconEl.src = '';
      weatherIconEl.alt = '';
    }
  }

  
  function setTemperatureDisplay(celsiusTemp) {
    if (modeSelectEl.value === 'fahrenheit') {
      const fTemp = (celsiusTemp * 9/5) + 32;
      tempValueEl.textContent = `${Math.round(fTemp)}°F`;
    } else {
      tempValueEl.textContent = `${Math.round(celsiusTemp)}°C`;
    }
  }


  function setWeatherText(description) {
    weatherTextEl.textContent = capitalizeWords(description);
  }

  
  function setBackgroundVideo(conditionMain, isDaytime) {
    
    const cond = conditionMain.toLowerCase();
    let videoPath = '';
    if (cond.includes('mist') || cond.includes('fog')) {
      videoPath = './Videos/mist.mp4';
    } else if (cond.includes('cloud')) {
      
      videoPath = './Videos/overcast2.mp4';
    } else if (cond.includes('rain') || cond.includes('drizzle')) {
      videoPath = './Videos/rain.mp4';
    } else if (!isDaytime) {
      videoPath = './Videos/night.mp4';
    } else if (cond.includes('clear')) {
      videoPath = './Videos/clear.mp4';
    } else if (cond.includes('snow')) {
      videoPath = './Videos/snow.mp4';
    } else {
    
      videoPath = './Videos/clear.mp4';
    }
    
    if (bgSourceEl.src.indexOf(videoPath) === -1) {
      bgSourceEl.src = videoPath;
      bgVideoEl.load();
      bgVideoEl.play().catch(() => {
        
      });
    }
  }

  
  function updateTime() {
    const now = new Date();
    
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const isAM = hours < 12;
   
    let displayHour = hours % 12 || 12;
    displayHour = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;
    const displayMin = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const ampm = isAM ? 'AM' : 'PM';

    timeEl.textContent = `${displayHour}:${displayMin} ${ampm} (Local)`;

    
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dayName = daysOfWeek[now.getDay()];
    const dayNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    dateEl.textContent = `${dayName}, ${dayNum} ${monthName} ${year}`;
  }

 
  async function displayWeather(city) {
    const cityTrimmed = city.trim();
    if (!cityTrimmed) {
      alert('Please enter a city name.');
      return;
    }
    const cityFormatted = capitalizeWords(cityTrimmed);
    showLoader();
    try {
      const data = await fetchWeather(cityTrimmed);
      currentWeatherData = data; 
      const name = data.name;
      const country = data.sys && data.sys.country ? data.sys.country : '';
      const weatherArr = Array.isArray(data.weather) ? data.weather : [];
      const weatherObj = weatherArr[0] || {};
      const mainTempC = data.main && typeof data.main.temp === 'number'
        ? data.main.temp
        : null;
      const conditionMain = weatherObj.main || '';
      const conditionDesc = weatherObj.description || '';
      const iconCode = weatherObj.icon || '';
      const isDaytime = (() => {
        
        if (data.dt && data.sys && data.sys.sunrise && data.sys.sunset) {
          return data.dt >= data.sys.sunrise && data.dt < data.sys.sunset;
        }
        return true; 
      })();

      
      setLocationDisplay(name, country);
      setWeatherIcon(iconCode, conditionDesc);
      if (mainTempC !== null) {
        setTemperatureDisplay(mainTempC);
      } else {
        tempValueEl.textContent = '--';
      }
      setWeatherText(conditionDesc);
      setBackgroundVideo(conditionMain, isDaytime);
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error fetching weather.');
    } finally {
      hideLoader();
    }
  }

 
  searchBtnEl.addEventListener('click', () => {
    displayWeather(searchInputEl.value);
  });
 
  searchInputEl.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      displayWeather(searchInputEl.value);
    }
  });
 
  modeSelectEl.addEventListener('change', () => {
    if (currentWeatherData && currentWeatherData.main && typeof currentWeatherData.main.temp === 'number') {
      setTemperatureDisplay(currentWeatherData.main.temp);
    }
  });

  
  document.addEventListener('DOMContentLoaded', () => {
    
    displayWeather('Kolkata');
    
    updateTime();
    setInterval(updateTime, 1000);
  });

 
})();
