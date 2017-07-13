module.exports = {
    label: 'Default',
    id: 'default',
    autoDiscoveryDeviceTypes: [/*{
     plugin: 'ti-sensortag/tiSensorTag',
     confirmRegistration: true,
     persistRegistration: true,
     defaultConfiguration: {
     barometricPressureEnabled: true,
     barometricPressureNotificationInterval: 300,
     irTemperatureEnabled: true,
     irTemperatureNotificationInterval: 300,
     ambientTemperatureEnabled: true,
     ambientTemperatureNotificationInterval: 300,
     accelerometerEnabled: true,
     accelerometerNotificationInterval: 2000,
     gyroscopeEnabled: true,
     gyroscopeNotificationInterval: 2000,
     magnetometerEnabled: true,
     magnetometerNotificationInterval: 2000,
     humidityEnabled: true,
     humidityNotificationInterval: 60000,
     luxometerEnabled: true,
     luxometerNotificationInterval: 60000,
     },
     options: {}
     }*/],
    devices: [{
        label: "Sensor Tag 1",
        id: "sensorTag1",
        plugin: "ti-sensortag/tiSensorTag",
        configuration: {
            uuid: 'd1285099a4304eab830b9203d0b3258e',
            accelerometerEnabled: true,
            accelerometerNotificationInterval: 2000,
            gyroscopeEnabled: true,
            gyroscopeNotificationInterval: 2000
        },
        logLevel: "debug"
    }],
    services: [],
    eventProcessors: []
};