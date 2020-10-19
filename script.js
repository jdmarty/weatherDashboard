$(document).ready(() => {
//====================================================================

//globals
var myApiKey = 'a3e758c20da44f92a45c7d1fe07b0e81';
var weatherConditions = {
  Thunderstorm: "⛈",
  Drizzle: "🌦",
  "light rain": "🌦",
  "moderate rain": "🌦",
  "heavy intensity rain": "🌧",
  "very heavy rain": "🌧",
  "extreme rain": "🌧",
  "freezing rain": "❄",
  "light intensity shower rain": "🌦",
  "shower rain": "🌧",
  "heavy intensity shower rain": "🌧",
  "ragged shower rain": "🌧",
  Snow: "❄",
  Mist: "🌫",
  Smoke: "🌫",
  Haze: "🌫",
  Dust: "🌫",
  Fog: "🌫",
  Sand: "🌫",
  Ash: "🌫",
  Squall: "🌫",
  Tornado: "🌪",
  Clear: "☀",
  'few clouds': "🌤",
  'scattered clouds': "⛅",
  'broken clouds': "🌥",
  'overcast clouds': "☁"
};

//get initial state
var previousCities = JSON.parse(localStorage.getItem('cities'));
if (!previousCities) previousCities = [];
var startLocation = previousCities[0];
if (!startLocation) startLocation = 'Los Angeles'

//run first search
searchWeather(startLocation)
renderCities()

//load weather conditions
function searchWeather(city) {
  return $.ajax({
    url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${myApiKey}&units=imperial`,
    method: "GET"
  }).then(function(mainResponse) {
    console.log(mainResponse);
    //set the banner image
    $("#currentWeatherImg").attr(
      "src",
      `http://openweathermap.org/img/wn/${mainResponse.weather[0].icon}@4x.png`
    ).attr('alt', mainResponse.weather[0].description)
    //set the city text display and add emoji from object
    $("#currentCity").text(
      `${mainResponse.name}${
        weatherConditions[mainResponse.weather[0].main] ||
        weatherConditions[mainResponse.weather[0].description] ||
        ''
      }`
    );
    //set temp, humidity, and wind speed
    $("#currentTemp").text(`Temperature: ${mainResponse.main.temp.toFixed(1)} °F`);
    $("#currentHumidity").text(`Humidity: ${mainResponse.main.humidity}%`);
    $("#currentWindSpeed").text(`Wind Speed: ${mainResponse.wind.speed} MPH`);
    //return the main response so it can be used to make the second call
    return mainResponse;
  })
  .then(function(mainResponse) {
    //set the latitude and longitude for the uv index call
    var currentLatitude = mainResponse.coord.lat;
    var currentLongitude = mainResponse.coord.lon;
    //use these values to find the uv index at the given lat/long
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/uvi?lat=${currentLatitude}&lon=${currentLongitude}&appid=${myApiKey}`,
      method: "GET"
    }).then(function (uvResponse) {
      //find current UV index
      var currentUVI = uvResponse.value;
      var dangerClass = "";
      //set display class based on current UVI
      if (currentUVI < 2) dangerClass = "lowRisk";
      if (currentUVI >= 2 && currentUVI < 6) dangerClass = "moderateRisk";
      if (currentUVI >= 6 && currentUVI < 8) dangerClass = "highRisk";
      if (currentUVI >= 8 && currentUVI < 11) dangerClass = "veryHighRisk";
      if (currentUVI >= 11) dangerClass = "extremeRisk";
      //display the uv index value
      var newUVI = $("<div>").html(
        `UV Index: <span class="${dangerClass} p-2 rounded">${currentUVI}</span>`
      );
      //append the uv index
      $("#currentUVI").html(newUVI);
    });
    return mainResponse
  }).then(function(mainResponse) {
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${myApiKey}&units=imperial`,
      method: 'GET'
    }).then(function(forecastResponse) {
      console.log(forecastResponse);
      //for every card in the five day forecast...
      for (var i=0; i < $('#forecastRow').find('.card-body').length; i++) {
        //set the current card
        var currentCard = $($('#forecastRow').find('.card-body')[i]);
        //find the appropriate item in the forecast response (Noon, 8 hour intervals)
        var currentForecast = forecastResponse.list[i*8+3]
        //display the date on this card
        currentCard.children('.forecastDate').text(dateFns.format(new Date(currentForecast.dt_txt), 'M/D/YYYY'))
        //find the appropriate emoji for this card
        currentCard
          .children(".forecastEmoji")
          .text(
            weatherConditions[currentForecast.weather[0].main] ||
            weatherConditions[currentForecast.weather[0].description] ||
            "X"
          );
          //set humidity and temperature
        currentCard.children('.forecastTemp').text(`Temp: ${currentForecast.main.temp.toFixed(1)}°F`)
        currentCard.children('.forecastHumid').text(`Humidity: ${currentForecast.main.humidity}%`)
      }
    })
    //return the main response so it can be used by search button
    return mainResponse  
  })
}



//event listeners for searchbar
$('form').on('click', function(e) {
     e.preventDefault()
});

$('#searchButton').on('click', function() {
  //identify the target city and reset input
  var targetCity = $('#searchCity').val()
  $('#searchCity').val('');
  //search weather in that city
  searchWeather(targetCity)
  //if this search returns results...
  .then(function (response) {
    //check if that city has already been searched recently
    if (!previousCities.includes(response.name)) {
      //if it has not, check if there are more than 10 previous searches
      if (previousCities.length < 10) {
        previousCities.unshift(response.name);
      } else {
        previousCities.pop();
        previousCities.unshift(response.name);
      }
      //render the cities lists
      renderCities();
      //save the new list of cities to local storage
      localStorage.setItem("cities", JSON.stringify(previousCities));
    }
  });
})

//function to render cities from the saved array
  function renderCities() {
    //empty out both list groups
    $('.list-group').empty();
    //for every city in the current state
    for (var city of previousCities) {
      //create a new list item with event listener
      var newCity = $('<li>')
        .addClass('list-group-item')
        .text(city)
        .on('click', function(e) {
          searchWeather(e.target.innerHTML)
          $('#collapsedCityList').collapse('hide')
        });
      //append the new list item to both list groups
      $('.list-group').append(newCity);
    }
  }

  // localStorage.clear()

//=====================================================================
})