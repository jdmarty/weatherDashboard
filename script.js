$(document).ready(() => {
//====================================================================

//globals
var myApiKey = 'a3e758c20da44f92a45c7d1fe07b0e81';
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
  }).then(function (mainResponse) {
    console.log(mainResponse);
    //set the city name, temperature, humidity, and wind speed from main call
    $("#currentWeatherImg").attr(
      "src",
      `http://openweathermap.org/img/wn/${mainResponse.weather[0].icon}@4x.png`
    ).attr('alt', mainResponse.weather[0].description)
    $("#currentCity").text(mainResponse.name);
    $("#currentTemp").text(
      `Temperature: ${mainResponse.main.temp.toFixed(1)}° F`
    );
    $("#currentHumidity").text(`Humidity: ${mainResponse.main.humidity}%`);
    $("#currentWindSpeed").text(`Wind Speed: ${mainResponse.wind.speed} MPH`);
    //return the main response so it can be used to make the second call
    return mainResponse;
  })
  .then(function (mainResponse) {
    //set the latitude and longitude for the uv index call
    var currentLatitude = mainResponse.coord.lat;
    var currentLongitude = mainResponse.coord.lon;
    //use these values to find the uv index at the given lat/long
    $.ajax({
      url: `http://api.openweathermap.org/data/2.5/uvi?lat=${currentLatitude}&lon=${currentLongitude}&appid=${myApiKey}`,
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
  });
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