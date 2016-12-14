Automatic Sprinkler 
=============================================
See [LICENSE.md](LICENSE.md) for license terms and conditions.

Docs for XDK: https://software.intel.com/en-us/xdk/docs.

App Overview
------------
This is an automatic sprkinler controller that runs on an Intel® Edison. The sprinkler controller will 
automatically turns on and off the sprinkler system at times specified in the sprinker_times.json file. 
The controller will also go to weatherunderground.com to check the weather condition prior to running 
a sprinkler. If the weather condition contains the word "rain" the sprinker will not run at that time. 
The weather condition is updated every 30 minutes. 

The sprinker_times.json file is shown below:

```
{  
    "weatherundergroundAPIKey":"<your weather api key>",
    "zipcode":"<your zipcode>",
    "timezone":"<your timezone>", 
    "times":[
        {"id":1,"day":5,"start":"14:22","end":"14:23","zone":1},
        .
        .
        .
    ]
}
```
A small rest API is inclued to add, remove, update and list the current;y set sprinkler times. The
API is shown below: 
```
http://192.168.10.118:8081/listItems
http://192.168.10.118:8081/addItem/<day: 0-6>-<start time: 00:00>-<end time: 23:59>-<zone: 1-8>
http://192.168.10.118:8081/removeItem/<id: 0>
http://192.168.10.118:8081/updateItem/<id: 0>-<day: 0-6>-<start time: 00:00>-<end time: 23:59>-<zone: 1-8>
```
The system supports up to 8 zones (1-8). Each zone is controlled by a GPIO pin (from 5-12). Hook up 
each pin to a relay and have the relay switch a 24v power supply to the irrigation valve. Enter your
sprinker controller times, your zipcode and weather underground api key. Timezone is required to get
clock information for your area (clock on the edison retursn time in UTC). 

This project is based on the Intel® LED controller project and was inspired by Pete B's Arduino 
Irrigation controller: (https://www.youtube.com/watch?v=l4GPRTsuHkI). 

Important App Files
--------------------------
* main.js
* package.json


Important Project Files
------------------------------
* README.md
* LICENSE.md
* project-name.xdk
* project-name.xdke

Tested IoT Node.js Platforms
----------------------------
* [Intel® Edison Development Platform](http://intel.com/edison)
