/**
 A sprinkler timer. The configuration file is named sprinkler_times.jons and has the following format:
    {"timezone":"<America/Los_Angeles>", times":[
        {"id":<0-infinity>,"day":"<0-6>","start":"<hh:mm>","end":"<hh:mm>","zone":<1-8>},
        .
        .
        .
    ]}
    
 An interval checker runs every 1 second, and checks if the current time is between 
 any of the spinkler events [times] start and stop times, if so the app will start the sprinkler, if not 
 it will stop the sprinkler. 
 
 Start and end times must be specified in 24hr time. 
 
 API to add new times, remove existing times and show sprinkler schedule from web calls is below. 
 
 GPIO to Relay Module in mapping:
 
 GPIO 12 -> RelayModule 1
 GPIO 11 -> RelayModule 5
 GPIO 10 -> RelayModule 4
 GPIO 9 -> RelayModule 2
 GPIO 8 -> RelayModule 3
 GPIO 7 -> RelayModule 8
 GPIO 6 -> RelayModule 6
 GPIO 5 -> RelayModule 7
 
 TOOD: rewire the board so the relay channels match the GPIO pins match the zone numbers 

 */

"use strict" ;

var express = require('express');
var clock = require('node-clock');
var calendar = require('node-calendar');
var http = require('http');
var fs = require('fs');

var app = express();

var APP_NAME = "Sprinkler Control" ;

var cfg5  = require("./cfg-app-platform.js")() ;          // init and config I/O resources
var cfg6  = require("./cfg-app-platform.js")() ;          // init and config I/O resources
var cfg7  = require("./cfg-app-platform.js")() ;          // init and config I/O resources
var cfg8  = require("./cfg-app-platform.js")() ;          // init and config I/O resources
var cfg9  = require("./cfg-app-platform.js")() ;          // init and config I/O resources
var cfg10 = require("./cfg-app-platform.js")() ;          // init and config I/O resources
var cfg11 = require("./cfg-app-platform.js")() ;          // init and config I/O resources
var cfg12 = require("./cfg-app-platform.js")() ;          // init and config I/O resources
var cfg13 = require("./cfg-app-platform.js")() ;          // init and config I/O resources

var i = 0;

var data = fs.readFileSync("/node_app_slot/sprinker_times.json");
var sprinklerData = JSON.parse(data);
var timezone = sprinklerData.timezone;
var zipcode = sprinklerData.zipcode;
var weatherundergroundAPIKey = sprinklerData.weatherundergroundAPIKey;
var weatherCondition = -1;
var weatherConditionDescription = "";
var weatherTemp = "";
var weatherTempLastUpdatedOn ="";

// poor man's clear console
console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n") ;   

// dump current time
console.log("Initializing " + APP_NAME) ;

//get current weather condition
// getWeatherInfo();

//get weather info every 60 minutes; 
// getWeatherAtInterval(1000*60*60);

console.log("zipcode: " + zipcode);
console.log("timezone: " + timezone);
console.log(clock.tz(Date.now(),"%Y/%m/%d %H:%M", timezone));
console.log("  day: " + parseInt(clock.tz(Date.now(), "%d", timezone), 10));
var currentDay = calendar.weekday(parseInt(clock.tz(Date.now(), "%Y", timezone),10), 
                                  parseInt(clock.tz(Date.now(), "%m", timezone),10), 
                                  parseInt(clock.tz(Date.now(), "%d", timezone),10));
console.log("  day of week: " + currentDay);

// prints some interesting platform details to console
cfg10.identify();                

//dump the sprinkler on/off time data.
for(i = 0; i < sprinklerData.times.length; i ++) {
    console.log("id: " + sprinklerData.times[i].id + "|" + "day: " + 
                sprinklerData.times[i].day + "|" + "start: " + sprinklerData.times[i].start + "|" + "end: " + 
                sprinklerData.times[i].end + "|" + "zone: " + sprinklerData.times[i].zone);
}

// test and initialize the sprinkler GPIO pins. 
gpioInit(cfg5, 5);
gpioInit(cfg6, 6);
gpioInit(cfg7, 7);
gpioInit(cfg8, 8);
gpioInit(cfg9, 9);
gpioInit(cfg10, 10);
gpioInit(cfg11, 11);
gpioInit(cfg12, 12);
gpioInit(cfg13, 13);

//start flashing the built in LED on pin 13 (this tells user that we are running)
flash(300);

// run this check every 1 second, we are checking to see if we need to turn any of our sprinklers on or off
var checkTime = function() {
    
    // make timezone configurable   
    var currentTime = clock.tz(Date.now(), "%H:%M", timezone).valueOf();
    clock.tz(Date.now(), "%H:%M", timezone).valueOf();
    var currentDay = calendar.weekday(parseInt(clock.tz(Date.now(), "%Y", timezone), 10), 
                                      parseInt(clock.tz(Date.now(), "%m", timezone), 10), 
                                      parseInt(clock.tz(Date.now(), "%d", timezone), 10));
                
    for(i = 0; i < sprinklerData.times.length; i ++) {
        var isTime = isTimeToSprinkle(sprinklerData.times[i].start.valueOf(), sprinklerData.times[i].end.valueOf());
        
        if ( (isTime == true) && (currentDay.toString() == sprinklerData.times[i].day.valueOf()) && (weatherCondition < 0) ) { 
            console.log(sprinklerData.times[i].id.valueOf() + " | " + isTime + " | zone: " + sprinklerData.times[i].zone.valueOf() + " | currentTime: " + currentTime + " | startTime:" 
                    + sprinklerData.times[i].start.valueOf() + " | endTime:" + sprinklerData.times[i].end.valueOf());
            if (sprinklerData.times[i].zone.valueOf() == "5") {
                turnOn(cfg5);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "8") {
                turnOn(cfg6);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "4") {
                turnOn(cfg7);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "2") {
                turnOn(cfg8);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "3") {
                turnOn(cfg9);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "6") {
                turnOn(cfg10);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "7") {
                turnOn(cfg11);
            } 
             else if (sprinklerData.times[i].zone.valueOf() == "1") {
                turnOn(cfg12);
            } 
        } else if (currentDay.toString() == sprinklerData.times[i].day.valueOf()){
             console.log(sprinklerData.times[i].id.valueOf() + " | " + isTime + " | zone: " + sprinklerData.times[i].zone.valueOf() + " | currentTime: " + currentTime + " | startTime:" 
                    + sprinklerData.times[i].start.valueOf() + " | endTime:" + sprinklerData.times[i].end.valueOf());
            if (sprinklerData.times[i].zone.valueOf() == "5") {
                turnOff(cfg5);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "8") {
                turnOff(cfg6);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "4") {
                turnOff(cfg7);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "2") {
                turnOff(cfg8);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "3") {
                turnOff(cfg9);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "6") {
                turnOff(cfg10);
            } 
            else if (sprinklerData.times[i].zone.valueOf() == "7") {
                turnOff(cfg11);
            } 
             else if (sprinklerData.times[i].zone.valueOf() == "1") {
                turnOff(cfg12);
            } 
        }
    } 
    console.log("-------------------------------------------------");
};
var sprinklerInterval = setInterval(checkTime, 5000);

// show schedule in memory
app.get('/listitems', function (req, res) {
    res.send(JSON.stringify(sprinklerData));
})

// show persistent schedule (sprinker_times.json)
app.get('/listfileitems', function (req, res) {
   fs.readFile("/node_app_slot/sprinker_times.json", function(err, data) {
       res.end(data);
   });
})

app.get('/additem/:day/:start/:end/:zone', function (req, res) {
    addSprinklerTime(req, res);
})

app.get('/removeitem/:id', function(req, res) {
    removeSprinkerTime(req.params.id, res);
});

app.get('/updateitem/:id/:day/:start/:end/:zone', function(req, res) {
    updateSprinkerTime(req.params.id, req.params.day, req.params.start, req.params.end, req.params.zone, res);
});

app.get('/currenttime', function(req, res) {
    var currentTime = {"time":clock.tz(Date.now(), "%H:%M", timezone).valueOf(),
                  "weather_condition":weatherConditionDescription,
                  "weather_temp":weatherTemp,
                  "zipcode":zipcode,
                  "weather_updated_on":0 };
    res.send(currentTime);
});

// setup our webserver to start listening
var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Sprinkler control listening at http://%s:%s", host, port);
});

// type process.exit(0) in debug console to see
// the following message be emitted to the debug console

process.on("exit", function(code) {
    clearInterval(intervalID) ;
    console.log("\nExiting " + APP_NAME + ", with code:", code) ;
}) ;


/** ------------------------------------ varouos helpers here --------------------------------------------- */

/**
  add a sprinkler time to our schedule and save to persistent schedule (sprinker_times.json)
*/
function addSprinklerTime(req, res) {
    console.log(JSON.stringify(req.params));
    
    //add the new sprinkler time, increment our id (i)
    req.params.id = Date.now();
    console.log(sprinklerData.times);
    sprinklerData.times.push(req.params);
    
    //dump the sprinkler timing data
    for(i = 0; i < sprinklerData.times.length; i ++) {
        console.log("id: " + sprinklerData.times[i].id + "|" + "day: " +
                    sprinklerData.times[i].day + "|" + "start: " + sprinklerData.times[i].start + "|" +
                    "end: " + sprinklerData.times[i].end + "|" + "zone: " + sprinklerData.times[i].day);
    }
    
    // update File
    fs.writeFileSync("/node_app_slot/sprinker_times.json", JSON.stringify(sprinklerData));
    
    //shut down all sprkinlers 
    turnOffAll();
    
    //dump schedule to user
    res.send(JSON.stringify(sprinklerData));
}

/**
  remove the selected time id and sprinker time record from persistence, will turn off all 
  spriklers after updating
*/
function removeSprinkerTime(timeId, res) {
    console.log("delete id: " + timeId);
    
    var times = [];
    for(i = 0; i < sprinklerData.times.length; i ++) {
        if (sprinklerData.times[i].id != timeId) {
            times.push(sprinklerData.times[i]);
        }
    }
    sprinklerData.times = times;
    
    // update File
    fs.writeFileSync("/node_app_slot/sprinker_times.json", JSON.stringify(sprinklerData));
    
    //shut down all sprkinlers 
    turnOffAll();
    
    //dump schedule to user
    res.send(JSON.stringify(sprinklerData));
}

/**
  update a sprinkler time based on id with new data (start, end zone and day ), will turn off all 
  spriklers after updating
*/
function updateSprinkerTime(timeId, day, start, end, zone, res) {
    console.log("update id: " + timeId);
    
    var times = [];
    for(i = 0; i < sprinklerData.times.length; i ++) {
        if (sprinklerData.times[i].id == timeId) {
            sprinklerData.times[i].day = day;
            sprinklerData.times[i].start = start;
            sprinklerData.times[i].end = end;
            sprinklerData.times[i].zone = zone;
        }
    }
    
    // update File
    fs.writeFileSync("/node_app_slot/sprinker_times.json", JSON.stringify(sprinklerData));

    //shut down all sprkinlers 
    turnOffAll();
    
     //dump schedule to user
    res.send(JSON.stringify(sprinklerData));
}

/**
  test and configure a gpio pin
*/
function gpioInit(cfg, pin) {
    if( !cfg.test() ) {
        process.exitCode = 1 ;
        throw new Error("Call to "+pin+" test failed, check console messages for details.") ;
    }
    if( !cfg.init() ) {
        process.exitCode = 1 ;
        throw new Error("Call to "+pin+" init failed, check console messages for details.") ;
    }    
    cfg.io = new cfg.mraa.Gpio(pin, cfg.ioOwner, cfg.ioRaw) ;
    // configure a gpio pin as an output pin    
    cfg.io.dir(cfg.mraa.DIR_OUT) ;                  
    //initialize the pin high
    cfg.io.write(1);
}

function turnOn(cfg) {
    if (cfg.io.read() != 0) {
        console.log("turnOn(), turning on"); 
        cfg.io.write(0);
    } else {
        console.log("turnOn() already turned on"); 
    }
}

function turnOff(cfg) {
    if (cfg.io.read() != 1) {
        console.log("turnOff() turning off"); 
        cfg.io.write(1);
    } else {
        console.log("turnOff() already turned off"); 
    }
}

/**
  Turn off all sprinklers now! 
*/
function turnOffAll() {
    cfg5.io.write(1);            
    cfg6.io.write(1);
    cfg7.io.write(1);
    cfg8.io.write(1);
    cfg9.io.write(1);
    cfg10.io.write(1);
    cfg11.io.write(1);
    cfg12.io.write(1); 
}

/**
  get weather info from weather underground, use the key: <weatherundergroundAPIKey for app name: "smart sprinkler,
  example: "http://api.wunderground.com/api/<weatherundergroundAPIKey>/conditions/q/CA/San_Francisco.json"
*/
function getWeatherInfo() {
    var options = {
        host: 'api.wunderground.com',
        port: '80',
        path: "/api/"+weatherundergroundAPIKey+"/conditions/q/CA/"+zipcode+".json"  
    };
    
    var callback = function(response){
        try{
            // Continuously update stream with data
            var body = '';
            response.on('data', function(data) {
                body += data;
            });

            response.on('end', function() {
                // Data received completely.
                var weather = JSON.parse(body);
                weatherConditionDescription = weather.current_observation.weather;
                weatherTemp = weather.current_observation.temperature_string;
                weatherCondition = (weather.current_observation.weather).toLowerCase().indexOf("rain");
                weatherTempLastUpdatedOn = Date.now();
                console.log("current weather is: " + weather.current_observation.weather + ":" + weatherCondition);
           });
        } catch(err) {
            console.log(err);
        }
    }
    var req = http.request(options, callback);
    req.end();  
}

/**
  update weather condition at some interval 
*/
function getWeatherAtInterval(interval) {
    console.log("getting weather every " + interval + " ms.");
    setInterval(function(){
        getWeatherInfo();
    }, interval);
}

/**
 flash pin 13 every some ms to indicate that the sprkinler controller app is running
*/
function flash(interval) {
    setInterval(function() {
         //flash built in LED on pin 13 
        if (cfg13.io.read() == 0) {
            cfg13.io.write(1);
        } else {
            cfg13.io.write(0);
        }
    }, interval);
}

/**
  determines if it is time to run some sprinkler, takes in start time and end time (both 
  are strings with hh:mm format) and checks if these are between the current time, returns true 
  if so (it is time to run sprinkler), else false if not (need to turn off). 
  
  note that we only care about 24 hour time so we normalize eveything to start of epoch
  (jan 1st 1970 and use the current seconds) 
*/
function isTimeToSprinkle(start, end) {
    var currentTime = (clock.tz(Date.now(), "%H:%M", timezone).valueOf()).split(":");
    var startTime = start.split(":");
    var endTime = end.split(":");
    var currentMs = calendar.timegm([1970, 1, 1, currentTime[0], currentTime[1], new Date().getSeconds()]);
    var startMs = calendar.timegm([1970, 1, 1, startTime[0], startTime[1], 0]);
    var endMs = calendar.timegm([1970, 1, 1, endTime[0], endTime[1], 0]);
    if (currentMs > startMs && currentMs < endMs) {
        return true;
    }
    return false;
}
