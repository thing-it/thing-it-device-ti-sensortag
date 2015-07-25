module.exports = {
    metadata: {
        family: "tiSensorTag2",
        plugin: "tiSensorTag2",
        label: "Texas Instruments (C) SensorTag/CC2650 SensorTag",
        manufacturer: "Texas Instruments",
        tangible: true,
        discoverable: true,
        state: [{
            id: "humidity",
            label: "Humidity",
            type: {
                id: "number"
            }
        }, {
            id: "temperature",
            label: "Temperature",
            type: {
                id: "number"
            }
        }, {
            id: "barometricPressure",
            label: "Barometric Pressure",
            type: {
                id: "number"
            }
        }],
        actorTypes: [],
        sensorTypes: [],
        services: [],
        configuration: [{
            id: "barometricPressureEnabled",
            label: "Barometric Pressure Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "irTemperatureEnabled",
            label: "IR Temperature Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "ambientTemperatureEnabled",
            label: "Ambient Temperature Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "accelerometerEnabled",
            label: "Accelerometer Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "gyroscopeEnabled",
            label: "Gyroscope Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "magnetometerEnabled",
            label: "Magnetometer Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "humidityEnabled",
            label: "Humidity Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }]
    },
    create: function (device) {
        return new TISensorTag();
    },
    discovery: function (options) {
        var discovery = new TISensorTagDiscovery();

        discovery.options = options;

        return discovery;
    }
};

var utils = require("../../utils");
var q = require('q');
var noble;
var SensorTag;

var GUID_PATTERN = /([a-f0-9]{8})-?([a-f0-9]{4})-?([a-f0-9]{4})-?([a-f0-9]{4})-?([a-f0-9]{12})/;
var GUID_REPLACEMENT = "$1-$2-$3-$4-$5";

function TISensorTagDiscovery() {
    /**
     *
     * @param options
     */
    TISensorTagDiscovery.prototype.start = function () {
        if (this.node.isSimulated()) {
        } else {
            if (!noble)
            {
                noble = require('noble');
            }

            noble.on('discover', function (peripheral) {
                if (peripheral.advertisement.localName &&
                    peripheral.advertisement.localName.indexOf('SensorTag') === 0) {

                    console.log("Found Sensor Tag " + peripheral.advertisement.localName);
                    console.log("\tUUID " + peripheral.uuid);

                    if (peripheral.uuid) {
                        console.log("GUID " + peripheral.uuid.replace(GUID_PATTERN, GUID_REPLACEMENT));
                    }

                    var sensorTag = new TISensorTag();

                    sensorTag.peripheral = peripheral;
                    sensorTag.uuid = peripheral.uuid;

                    this.advertiseDevice(sensorTag);
                }
            }.bind(this));

            noble.startScanning();
        }
    };

    /**
     *
     * @param options
     */
    TISensorTagDiscovery.prototype.stop = function () {
        noble.stopScanning();
    };
}

/**
 *
 */
function TISensorTag() {
    /**
     *
     */
    TISensorTag.prototype.start = function () {
        var deferred = q.defer();

        this.state = {
            acceleration: {x: null, y: null, z: null},
            barometricPressure: null,
            gyroscopicPropulsion: {x: null, y: null, z: null},
            humidity: null,
            irTemperature: null,
            ambientTemperature: 23,
            magneticFieldStrength: {x: null, y: null, z: null}
        };

        if (this.peripheral) {
            this.connect();

            deferred.resolve();
        }
        else {
            if (!this.isSimulated()) {
                if (!noble)
                {
                    noble = require('noble');
                }

                if (!SensorTag)
                {
                    SensorTag = require("ti-sensortag");
                }

                noble.on('discover', function (peripheral) {
                    if (peripheral.advertisement.localName &&
                        peripheral.advertisement.localName.indexOf('SensorTag') === 0 &&
                        peripheral.uuid === this.uuid) {
                        console.log("\tFound configured Sensor Tag " + peripheral.advertisement.localName);
                        console.log("\tUUID " + peripheral.uuid);

                        if (peripheral.uuid) {
                            console.log("\tGUID " + peripheral.uuid.replace(GUID_PATTERN, GUID_REPLACEMENT));
                        }

                        this.peripheral = peripheral;

                        noble.stopScanning();

                        this.connect();
                    }
                }.bind(this));

                noble.startScanning();

                console.log("\tScanning started");

                deferred.resolve();
            } else {
                setInterval(function () {
                    this.state = {
                        acceleration: {x: Math.floor((Math.random() * 10)), y: Math.floor((Math.random() * 10)), z: Math.floor((Math.random() * 10))},
                        barometricPressure: 1000 + Math.floor((Math.random() * 200)),
                        gyroscopicPropulsion: {x: Math.floor((Math.random() * 50)), y: Math.floor((Math.random() * 50)), z: Math.floor((Math.random() * 50))},
                        humidity: 60 + Math.floor((Math.random() * 10)),
                        irTemperature: 20 + Math.floor((Math.random() * 10)),
                        ambientTemperature: 20 + Math.floor((Math.random() * 10)),
                        magneticFieldStrength: {x: Math.floor((Math.random() * 10)), y: Math.floor((Math.random() * 10)), z: Math.floor((Math.random() * 10))}
                    };

                    this.publishSensorTagStateChange();
                }.bind(this), 1000);

                deferred.resolve();
            }
        }

        return deferred.promise;
    };

    /**
     *
     */
    TISensorTag.prototype.connect = function () {
        this.peripheral.connect(function (error) {
            if (error) {
                console.log(error);
            } else {
                this.sensor = new SensorTag(new SensorTag.NobleConnector(this.peripheral));

                this.sensor.discover(function () {
                    // Accelaration

                    if (this.configuration.accelerometerEnabled) {
                        this.lastAcceleration = {x: 0, y: 0, z: 0};

                        this.sensor.Accelerometer.addListener(function (data) {
                            this.state.acceleration = this.sensor.Accelerometer.calculateAcceleration(data);

                            if (this.vectorDeviation(this.state.acceleration, this.lastAcceleration) > 0.02) {
                                this.publishSensorTagStateChange();
                            }

                            this.lastAcceleration = this.state.acceleration;
                        }.bind(this));

                        this.sensor.Accelerometer.setPeriod(100);
                        this.sensor.Accelerometer.enableNotification();
                        this.sensor.Accelerometer.enable();
                    }

                    if (this.configuration.humidityEnabled) {
                        // Humidity

                        this.sensor.Humidity.addListener(function (data) {
                            var humidity = this.sensor.Humidity.calculateHumidity(data);

                            this.state.humidity = humidity;

                            this.publishSensorTagStateChange();
                        }.bind(this));

                        // this.sensor.Humidity.setPeriod(60000);
                        this.sensor.Humidity.enableNotification();
                        this.sensor.Humidity.enable();
                    }

                    // IR Temperature

                    if (this.configuration.irTemperatureEnabled) {
                        /*
                         this.sensor.IRTemperature.addListener(function (data) {
                         var temperature = this.sensor.IRTemperature.calculateAmbientTemperature(data, 0);

                         this.state.ambientTemperature = temperature;

                         this.publishStateChange();
                         }.bind(this));

                         //this.sensor.IRTemperature.setPeriod(15000);
                         this.sensor.IRTemperature.enableNotification();
                         this.sensor.IRTemperature.enable();
                         */
                    }

                    // Barometric Pressure

                    if (this.configuration.barometricPressureEnabled) {
                        this.sensor.BarometricPressure.addListener(function (data) {
                            this.state.barometricPressure = this.sensor.BarometricPressure.calculatePressure(data);

                            this.publishSensorTagStateChange();
                        }.bind(this));

                        //this.sensor.BarometricPressure.setPeriod(60000);
                        this.sensor.BarometricPressure.enableNotification();
                        this.sensor.BarometricPressure.enable();
                    }

                    // Magnetometer

                    if (this.configuration.magnetometerEnabled) {
                        this.lastMagneticFieldStrength = {x: 0, y: 0, z: 0};

                        this.sensor.Magnetometer.addListener(function (data) {
                            this.state.magneticFieldStrength = this.sensor.Magnetometer.calculateCoordinates(data);

                            if (this.vectorDeviation(this.state.magneticFieldStrength, this.lastMagneticFieldStrength) > 0.02) {
                                this.publishSensorTagStateChange();
                            }

                            this.lastMagneticFieldStrength = this.state.magneticFieldStrength;
                        }.bind(this));

                        this.sensor.Magnetometer.setPeriod(100);
                        this.sensor.Magnetometer.enableNotification();
                        this.sensor.Magnetometer.enable();
                    }

                    // Gyroscope

                    if (this.configuration.gyroscopeEnabled) {
                        this.lastGyroscopicPropulsion = {x: 0, y: 0, z: 0};

                        this.sensor.Gyroscope.addListener(function (data) {
                            this.state.gyroscopicPropulsion = this.sensor.Gyroscope.calculateAxisValue(data);

                            if (this.vectorDeviation(this.state.gyroscopicPropulsion, this.lastGyroscopicPropulsion) > 0.02) {
                                this.publishSensorTagStateChange();
                            }

                            this.lastGyroscopicPropulsion = this.state.gyroscopicPropulsion;
                        }.bind(this));
                    }

                    // Simple Key

                    this.sensor.SimpleKey.addListener(function (data) {
                        var events = {
                            RIGHT: 0x01,
                            LEFT: 0x02,
                            BOTH: 0x04
                        }
                        if (data[0] === 1) {
                            this.publishEvent("right");
                        }
                        else if (data[0] === 2) {
                            this.publishEvent("left");
                        }
                        else if (data[0] === 3) {
                            this.publishEvent("both");
                        }
                    }.bind(this));

                    this.sensor.SimpleKey.enableNotification();
                }.bind(this));
            }
        }.bind(this));
    };

    /**
     *
     */
    TISensorTag.prototype.scalarDeviation = function (value, lastValue) {
        return Math.abs(lastValue - value) / lastValue;
    };

    /**
     *
     */
    TISensorTag.prototype.vectorDeviation = function (value, lastValue) {
        var percentage = Math.sqrt(Math.pow(lastValue.x - value.x, 2) + Math.pow(lastValue.y - value.y, 2) + Math.pow(lastValue.z - value.z, 2)) /
            Math.sqrt(Math.pow(lastValue.x, 2) + Math.pow(lastValue.y, 2) + Math.pow(lastValue.z, 2));

        return percentage;
    };

    /**
     *
     */
    TISensorTag.prototype.publishSensorTagStateChange = function () {
        this.publishStateChange();
    };

    /**
     *
     */
    TISensorTag.prototype.setState = function (state) {
        this.state = state;
    };

    /**
     *
     */
    TISensorTag.prototype.getState = function () {
        return this.state;
    };
}
