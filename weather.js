var http = require("http");
var url = require("url");
var querystring = require("querystring");

function k2f(kelvin)
{
    return (kelvin - 273.15) * 1.8 + 32;
}

function isnumber(n)
{
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function handleWeather(response, request)
{
    console.log("Request handler 'weather' was called.");

    var latitude = "";
    var longitude = "";
   
    var zipcode = querystring.parse(url.parse(request.url).query)["zipcode"];
    if (zipcode != null && zipcode.length == 5 && isnumber(zipcode)) 
    {
        // obtain lat/long from googleapis
        var zipurl = "http://maps.googleapis.com/maps/api/geocode/json?address=" + zipcode + "&sensor=false";
        console.log("requesting: " + zipurl);
        var req = http.get(zipurl, function(res)
        {
            console.log("Got Response: " + res.statusCode);
            var pagedata = "";
            res.on('data', function(chunk)
            {
                console.log("got data chunk" + chunk);
                pagedata += chunk;
            });
            res.on('end', function()
            {
                console.log("got end of data");
                var zipData = JSON.parse(pagedata);
                if (zipData.status === "OK")
                {
                    getWeatherReport(response, zipData.results[0].geometry.location.lat, zipData.results[0].geometry.location.lng);
                }
                else
                {
                    response.writeHead(200, {"Content-Type" : "text/html"});
                    response.write("<html><head><title>Location not found</title>" +
                    "</head><body>Location not found<p>" +
                    "<form name='zipinput' action='/weather' method='get'>" +
                    "ZIP code <input type='text' name='zipcode'>" +
                    "<input type='submit' value='Check another location'></form>" +
                    "<a href='/weather'>Check my location</a></body></html>");
                    response.end();
                }
            });
        });
    }
    else
    {
        // obtain lat/long from freegeoip
    
        var geourl = "http://freegeoip.net/json/" + request.connection.remoteAddress;
        console.log("requesting: " + geourl);
        var req = http.get(geourl, function(res)
        {
            console.log("Got Response: " + res.statusCode);
            var pagedata = "";
            res.on('data', function(chunk)
            {
                console.log("got data chunk" + chunk);
                pagedata += chunk;
            });
            res.on('end', function()
            {
                console.log("got end of data");
                var geoipData = JSON.parse(pagedata);

                getWeatherReport(response, geoipData.latitude, geoipData.longitude);
            });
        });
    }
}

function getWeatherReport(response, latitude, longitude)
{
    weatherUrl = "http://api.openweathermap.org/data/2.1/find/city?lat=" +
    latitude + "&lon=" + longitude + "&cnt=1&units=imperial";

    http.get(weatherUrl, function(res)
    {
        pagedata = "";
        res.on('data', function(chunk)
        {
            console.log("got chunk: " + chunk);
            pagedata += chunk;
        });
        res.on('end', function()
        {
            var weatherData = JSON.parse(pagedata);
            var wd = weatherData.list[0];

            response.writeHead(200, {"Content-Type" : "text/html"});
            response.write("<html><head><title>Weather for " + weatherData.list[0].name +
            "</title></head><body>" + 
            "<h3>Current Weather for " + weatherData.list[0].name + "</h3><p>" +
            "<img src=\"http://openweathermap.org/img/w/" + weatherData.list[0].weather[0].icon + ".png\" /><p>" +
            "<h1>" + wd.weather[0].main + "</h1><br>" + 
            "Temp: " + Math.round(k2f(weatherData.list[0].main.temp)) + "&deg;F<br>" +
            "Humidity: " + weatherData.list[0].main.humidity + "%<br>" +
            "Wind: " + Math.round(wd.wind.speed * 2.23694) + " mph<br>" +
            "Clouds: " + wd.clouds.all + "%<p>" +
            "<form name='zipinput' action='/weather' method='get'>" + 
            "ZIP code <input type='text' name='zipcode'>" +
            "<input type='submit' value='Check another location'></form>" +
            "<a href='/weather'>Check my location</a>" +
            "</body></html>");
            response.end();
        });
    });
}

exports.handleWeather = handleWeather;
