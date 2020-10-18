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

//load initial weather conditions
function searchWeather(city) {
$.ajax({
  url: `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${myApiKey}&units=imperial`,
  method: "GET",
})
  .then(function (mainResponse) {
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
  });
}



//event listeners for searchbar
$('form').on('click', function(e) {
     e.preventDefault()
});

$('#searchButton').on('click', function(e) {
    var targetCity = $('#searchCity').val()
    searchWeather(targetCity);
    previousCities.unshift(targetCity);
    localStorage.setItem('cities', JSON.stringify(previousCities))
})


//=====================================================================
})