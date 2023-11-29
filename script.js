async function getSunAndMoonInfo(locationType) {
  const loadingDiv = document.getElementById('loading');
  const customLocationInput = document.getElementById('customLocation');
  const selectedLocation = customLocationInput.value.trim();

  clearResults();
  loadingDiv.style.display = 'block';

  if (locationType === 'current') {
    await getCurrentLocation();
  } else if (locationType === 'search') {
    if (selectedLocation === '') {
      alert('Please enter a location for search.');
    } else {
      await getCoordinatesAndSunMoonData(selectedLocation);
    }
  }

  hideLoadingIndicator();
}


// Function to get current geolocation
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        getSunAndMoonData(latitude, longitude);
      },
      error => {
        console.error('Error getting current location:', error);
        alert('Error getting current location. Please enter a custom location.');
        hideLoadingIndicator();
      }
    );
  } else {
    alert('Geolocation is not supported by your browser. Please enter a custom location.');
    hideLoadingIndicator();
  }
}

// Function to get coordinates and Sun Moon data based on location
function getCoordinatesAndSunMoonData(location) {
  const geocodingUrl = `https://geocode.maps.co/search?q=${encodeURIComponent(location)}`;

  fetch(geocodingUrl)
    .then(response => response.json())
    .then(data => {
      console.log('Geocoding response:', data);

      if (data && data.length > 0) {
        const locationData = data[0];
        const coordinates = locationData.lat && locationData.lon ? [locationData.lat, locationData.lon] : null;

        if (coordinates) {
          getSunAndMoonData(coordinates[0], coordinates[1], location);
        } else {
          console.error('Error extracting coordinates from geocoding response:', data);
          alert('Error extracting coordinates from geocoding response. Please try again.');
          hideLoadingIndicator();
        }
      } else {
        console.error('Error geocoding location:', data);
        alert('Error geocoding location. Please try again.');
        hideLoadingIndicator();
      }
    })
    .catch(error => {
      console.error('Error in geocoding:', error);
      alert('Error in geocoding. Please check the console for details.');
      hideLoadingIndicator();
    });
}// Function to get Sun and Moon data
function getSunAndMoonData(latitude, longitude, location) {
  const sunriseSunsetApiUrl = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}`;

  fetch(sunriseSunsetApiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.results) {
        const todayInfo = data.results;
        displaySunAndMoonInfo('Today', todayInfo, latitude, longitude);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];

        const sunriseSunsetApiTomorrowUrl = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&date=${tomorrowDate}`;

        return fetch(sunriseSunsetApiTomorrowUrl);
      } else {
        console.error('Error fetching sunrise-sunset data:', data);
        alert('Error fetching sunrise-sunset data. Please try again.');
        hideLoadingIndicator();
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.results) {
        const tomorrowInfo = data.results;
        displaySunAndMoonInfo('Tomorrow', tomorrowInfo, latitude, longitude);
        hideLoadingIndicator();
      } else {
        console.error('Error fetching sunrise-sunset data for tomorrow:', data);
        alert('Error fetching sunrise-sunset data for tomorrow. Please try again.');
        hideLoadingIndicator();
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      alert('Error fetching sunrise-sunset data. Please try again.');
      hideLoadingIndicator();
    });
}

// Function to display Sun and Moon information
function displaySunAndMoonInfo(day, info, latitude, longitude) {
  const todayContainer = document.getElementById('todayContainer');
  const tomorrowContainer = document.getElementById('tomorrowContainer');

  if (day === 'Today') {
    displayDayInfo(todayContainer, day, info, latitude, longitude);
  } else if (day === 'Tomorrow') {
    displayDayInfo(tomorrowContainer, day, info, latitude, longitude);
  }
}
// Function to display day information
function displayDayInfo(container, day, info, latitude, longitude) {
  const timeZone = info.timezone || 'Unknown';

  container.innerHTML += `<h2>${day}</h2>`;
  container.innerHTML += `<p><i class="bi-geo-alt-fill" style="height:30px; color: #3498db;"></i> Latitude: ${latitude}, Longitude: ${longitude}</p>`;
  container.innerHTML += `<p><i class="bi-sunrise-fill" style="color: #f39c12;"></i> ${day}'s Sunrise: ${info.sunrise}</p>`;
  container.innerHTML += `<p><i class="bi-sunset-fill" style="color: #e74c3c;"></i> ${day}'s Sunset: ${info.sunset}</p>`;
  container.innerHTML += `<p><i class="bi-brightness-high-fill" style="color: #2ecc71;"></i> ${day}'s Dawn: ${info.dawn}</p>`;
  container.innerHTML += `<p><i class="bi-brightness-low-fill" style="color: #9b59b6;"></i> ${day}'s Dusk: ${info.dusk}</p>`;
  container.innerHTML += `<p><i class="bi-clock" style="color: #1B1B32;"></i> ${day}'s Day Length: ${info.day_length}</p>`;
  container.innerHTML += `<p><i class="bi-brightness-alt-high-fill" style="color: #1abc9c;"></i> ${day}'s Solar Noon: ${info.solar_noon}</p>`;

  container.innerHTML += `<p><i class="bi-globe" style="color: #3498db;"></i><strong> Time Zone:</strong>  ${timeZone}</p>`;

}



// Function to format time
function formatTime(timestamp) {
  if (timestamp && timestamp !== 'N/A') {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  } else {
    return 'N/A';
  }
}

// Function to hide loading indicator
function hideLoadingIndicator() {
  document.getElementById('loading').style.display = 'none';
}

// Function to handle location selection
async function locationSelected() {
  clearResults();
  const locationSelect = document.getElementById('locationSelect');
  const customLocationInput = document.getElementById('customLocation');
  const selectedLocation = locationSelect.value;

  customLocationInput.value = selectedLocation;

  // Update the dynamic content
  await getSunAndMoonInfo('search');
}

// Function to clear results
async function clearResults() {
  const resultDiv = document.getElementById('result');
  const todayContainer = document.getElementById('todayContainer');
  const tomorrowContainer = document.getElementById('tomorrowContainer');
  resultDiv.innerHTML = '';
  todayContainer.innerHTML = '';
  tomorrowContainer.innerHTML = '';
}
