var searchHistoryList = $('#list-previous-searches');
var searchCityInput = $("#city-search");
var searchCityButton = $("#citysearchbtn");
var clearHistoryButton = $("#clear-history");

var currentCity = $("#currentcity");
var todaysTemp = $("#todaystemp");
var todaysHumidity = $("#todayshumidity");
var todaysWindSpeed = $("#todayswinds");
var UVindex = $("#todaysuv");
var cityList = [];
var weatherContent = $("#todays-weather");
const myKey = "6581923c347c20c670a62fe6bb0b763e";
// api key attached needed to call data from weather API
// declaring variables needed for each api response function
// each html called by ID using Jquery





// date using moment.js
var currentDate = moment().format('L');
$("#todaydate").text("(" + currentDate + ")");





function currentConditionsRequest(searchValue) {
    
    
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&units=imperial&appid=" + myKey;
    

    // ajax request
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        console.log(response);
        $("#todaydate").text("(" + currentDate + ")");
        currentCity.text(response.name);
        currentCity.append("<small class='text-muted' id='todaydate'>");
        currentCity.append("<img src='https://openweathermap.org/img/w/" + response.weather[0].icon + ".png' alt='" + response.weather[0].main + "' />" )
        todaysTemp.text(response.main.temp);
        todaysTemp.append("&deg;F");
        todaysHumidity.text(response.main.humidity + "%");
        todaysWindSpeed.text(response.wind.speed + "MPH");

        var lat = response.coord.lat;
        var lon = response.coord.lon;
        

        var UVurl = "https://api.openweathermap.org/data/2.5/uvi?&lat=" + lat + "&lon=" + lon + "&appid=" + myKey;
        // Ajax request for uv
        $.ajax({
            url: UVurl,
            method: "GET"
        }).then(function(response){
           
            UVindex.text(response.value);
        });

        var countryCode = response.sys.country;
        var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=" + myKey + "&lat=" + lat +  "&lon=" + lon;
        
        // ajax request 5 day forecast
        $.ajax({
            url: forecastURL,
            method: "GET"
        }).then(function(response){
            console.log(response);
            $('#fivedayforecast').empty();
            for (var i = 1; i < response.list.length; i+=8) {

                var forecastDateString = moment(response.list[i].dt_txt).format("L");
                console.log(forecastDateString);
                var forecastDate = $("<h5 class='card-title'>");
                var forecastTemp = $("<p class='card-text mb-0'>");
                var forecastHumidity = $("<p class='card-text mb-0'>");
                var forecastCol = $("<div class='col-12 col-md-6 col-lg forecast-day mb-3'>");
                var forecastCard = $("<div class='card'>");
                var forecastCardBody = $("<div class='card-body'>");
                var forecastIcon = $("<img>");
                
                


                $('#fivedayforecast').append(forecastCol);
                forecastCol.append(forecastCard);
                forecastCard.append(forecastCardBody);
                forecastCardBody.append(forecastIcon);
                forecastCardBody.append(forecastDate);
                forecastCardBody.append(forecastHumidity);
                forecastCardBody.append(forecastTemp);
                forecastDate.text(forecastDateString);
                forecastTemp.text(response.list[i].main.temp);
                forecastTemp.prepend("Temp: ");
                forecastTemp.append("&deg;F");
                forecastHumidity.prepend("Humidity: ");
                forecastHumidity.append("%");
                forecastHumidity.text(response.list[i].main.humidity);
                forecastIcon.attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                forecastIcon.attr("alt", response.list[i].weather[0].main)
                
               
            }
        });

    });

    

};

// search history displaying
function searchHistory(searchValue) {
//    clear button hides list of cities previously searched
    if (searchValue) {
        
        if (cityList.indexOf(searchValue) === -1) {
            cityList.push(searchValue);

             listArray();
            clearHistoryButton.removeClass("hide");
            weatherContent.removeClass("hide");
        } else {
            var removeIndex = cityList.indexOf(searchValue);
            cityList.splice(removeIndex, 1);
             cityList.push(searchValue);
         listArray();
            clearHistoryButton.removeClass("hide");
            weatherContent.removeClass("hide");
        }
    }
    
}
// checking history
initalizeHistory();
showClear();

$(document).on("submit", function(){
    event.preventDefault();

    // Grab value entered into search bar 
    var searchValue = searchCityInput.val().trim();

    currentConditionsRequest(searchValue)
    searchHistory(searchValue);
    searchCityInput.val(""); 
});


searchCityButton.on("click", function(event){
    event.preventDefault();
var searchValue = searchCityInput.val().trim();

    currentConditionsRequest(searchValue)
    searchHistory(searchValue);    
    searchCityInput.val(""); 
});

// clearing history btn
clearHistoryButton.on("click", function(){
     cityList = [];
     listArray();
    $(this).addClass("hide");
});

// click city will populate
searchHistoryList.on("click","li.city-btn", function(event) {
  var value = $(this).data("value");
    currentConditionsRequest(value);
    searchHistory(value); 

});
//array history
function listArray() {
    
    searchHistoryList.empty();
   
    cityList.forEach(function(city){
        var searchHistoryItem = $('<li class="list-group-item city-btn">');
        searchHistoryItem.attr("data-value", city);
        searchHistoryItem.text(city);
        searchHistoryList.prepend(searchHistoryItem);
    });
    // local storage
    localStorage.setItem("cities", JSON.stringify(cityList));
    
}


      function initalizeHistory() {
    if (localStorage.getItem("cities")) {
        cityList = JSON.parse(localStorage.getItem("cities"));
        var lastIndex = cityList.length - 1;
        
        listArray();
        
        if (cityList.length !== 0) {
            currentConditionsRequest(cityList[lastIndex]);
            weatherContent.removeClass("hide");
        }
    }
}


function showClear() {
    if (searchHistoryList.text() !== "") {
        clearHistoryButton.removeClass("hide");
    }
}