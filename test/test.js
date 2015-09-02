var TiSensorTag = require('../tiSensorTag');

var tiSensorTag = TiSensorTag.create({});

tiSensorTag.isSimulated = function () {
    return false;
};
tiSensorTag.configuration = {
    uuid : "e461b0d0212e45ac971f1770c282f45e",
    irTemperatureEnabled: false,
    irTemperatureNotificationInterval: 2500,
    ambientTemperatureEnabled: false,
    ambientTemperatureNotificationInterval: 2500,
    gyroscopeEnabled: false,
    gyroscopeNotificationInterval: 2500,
    accelerometerEnabled: false,
    accelerometerNotificationInterval: 2499,
    magnetometerEnabled: false,
    magnetometerNotificationInterval: 2490,
    humidityEnabled: true,
    humidityNotificationInterval: 2500,
    barometricPressureEnabled: false,
    barometricPressureNotificationInterval: 2500,
    luxometerEnabled: false,
    luxometerNotificationInterval: 2500

};
tiSensorTag.publishEvent = function(event, data){
    console.log("Event", event);
};
tiSensorTag.publishStateChange = function(){
    console.log("State Change", this.getState());
};

tiSensorTag.logInfo = function(){
    if (arguments.length == 1 ) {
        console.log(arguments[0]);
    }
    else{
        console.log(arguments);
    }
}
tiSensorTag.logDebug = function(){
    tiSensorTag.logInfo(arguments);
}
tiSensorTag.logError = function(){
    tiSensorTag.logInfo(arguments);
}

console.log("About to start");

tiSensorTag.start();
