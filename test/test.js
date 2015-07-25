var TiSensorTag = require('../tiSensorTag');

var tiSensorTag = TiSensorTag.create({});

tiSensorTag.isSimulated = function () {
    return false;
};
tiSensorTag.uuid = "3b34d7c7160d429fbe9552d46114e29c";
tiSensorTag.configuration = {
    irTemperatureEnabled: true,
    ambientTemperatureEnabled: true,
    gyroscopeEnabled: true,
    accelerometerEnabled: true,
    magnetometerEnabled: true,
    humidityEnabled: true,
    humidityNotificationInterval: 20000,
    barometricPressureEnabled: true,
    luxometerEnabled: false
};
tiSensorTag.publishEvent = function(event, data){
    console.log("Event", event);
};
tiSensorTag.publishStateChange = function(){
    console.log("State Change", this.getState());
};

tiSensorTag.start();
