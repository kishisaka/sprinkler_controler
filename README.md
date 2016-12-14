Automatic Sprinkler 
=============================================
See [LICENSE.md](LICENSE.md) for license terms and conditions.

Docs for XDK: https://software.intel.com/en-us/xdk/docs.

App Overview
------------
An automatic sprkinler system controller. Automatically turns on and off the sprinkler system at
times specified in the sprinker_times.json file. The controller will also go to weatherunderground.com 
to check the weather prior to running a sprinkler. The sprinker_times.json file is shown below:

```
{  
    "weatherundergroundAPIKey":"<your weather api key>",
    "zipcode":"<your zipcode>",
    "timezone":"<your zipcode>", 
    "times":[
        {"id":1,"day":5,"start":"14:22","end":"14:23","zone":1},
        .
        .
        .
    ]
}
```

The system supports up to 8 zones (1-8). Each zone is controlled by a GPIO pin (from 5-12). Hook up 
each pin to a relay and have the relay switch a 24v power supply to the irrigation valve. Enter your
sprinker controller times, your zipcode and weather underground api key. Timezone is required to get
clock information for your area (clock on the edison retursn time in UTC). 

This project is based on the Intel® LED controller project. 

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
