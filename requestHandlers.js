var querystring = require("querystring");
var servepage = require("./servepage");
var http = require("http");
var handleWeather = require("./weather");

function start(response) 
{
    console.log("Request handler 'start' was called.");
    
    servepage.servePage("./index.html", response);
}

function weather(response, request)
{
    console.log("Request handler 'weather' was called.");
   
    handleWeather.handleWeather(response, request);
}

exports.start = start;
exports.weather = weather;
