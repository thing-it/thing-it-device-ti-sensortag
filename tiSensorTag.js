module.exports = {
    metadata: {
        family: "tiSensorTag",
        plugin: "tiSensorTag",
        label: "Texas Instruments (C) CC2540/CC2650 SensorTag",
        manufacturer: "Texas Instruments",
        tangible: true,
        discoverable: true,
        state: [{
            id: "humidity",
            label: "Humidity (%)",
            type: {
                id: "number"
            }
        }, {
            id: "ambientTemperature",
            label: "Ambient Temperature (°C)",
            type: {
                id: "number"
            }
        }, {
            id: "objectTemperature",
            label: "Object Temperature (°C)",
            type: {
                id: "number"
            }
        }, {
            id: "barometricPressure",
            label: "Barometric Pressure (mBar)",
            type: {
                id: "number"
            }
        }, {
            id: "luminousIntensity",
            label: "Luminous Intensity (Lux)",
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
        }, {
            id: "humidityNotificationInterval",
            label: "Humidity Notification Interval (ms)",
            type: {
                id: "number"
            },
            defaultValue: 60000
        }, {
            id: "luxometerEnabled",
            label: "Luxometer Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "luxometerNotificationInterval",
            label: "Luxometer Notification Interval (ms)",
            type: {
                id: "number"
            },
            defaultValue: 60000
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

var q = require('q');
var SensorTag = require("sensortag");

function TISensorTagDiscovery() {
    /**
     *
     * @param options
     */
    TISensorTagDiscovery.prototype.start = function () {
        if (this.node.isSimulated()) {
        } else {
            SensorTag.discover(function (sensorTag) {

            });
        }
    };

    /**
     *
     * @param options
     */
    TISensorTagDiscovery.prototype.stop = function () {
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
            magneticFieldStrength: {x: null, y: null, z: null},
            ambientLight: 1500
        };

        if (this.peripheral) {
            this.connect();

            deferred.resolve();
        }
        else {
            if (!this.isSimulated()) {
                if (!SensorTag) {
                    SensorTag = require("sensortag");
                }

                this.scan();

                deferred.resolve();
            } else {
                setInterval(function () {
                    this.state = {
                        acceleration: {
                            x: Math.floor((Math.random() * 10)),
                            y: Math.floor((Math.random() * 10)),
                            z: Math.floor((Math.random() * 10))
                        },
                        barometricPressure: 1000 + Math.floor((Math.random() * 200)),
                        gyroscopicPropulsion: {
                            x: Math.floor((Math.random() * 50)),
                            y: Math.floor((Math.random() * 50)),
                            z: Math.floor((Math.random() * 50))
                        },
                        humidity: 60 + Math.floor((Math.random() * 10)),
                        irTemperature: 20 + Math.floor((Math.random() * 10)),
                        ambientTemperature: 20 + Math.floor((Math.random() * 10)),
                        magneticFieldStrength: {
                            x: Math.floor((Math.random() * 10)),
                            y: Math.floor((Math.random() * 10)),
                            z: Math.floor((Math.random() * 10))
                        },
                        ambientLight: 1500 + Math.floor((Math.random() * 10))
                    };

                    this.publishStateChange();
                }.bind(this), 1000);

                deferred.resolve();
            }
        }

        return deferred.promise;
    };

    /**
     *
     */
    TISensorTag.prototype.scan = function () {
        console.log("\tScanning started");

        SensorTag.discover(function (sensorTag) {
            console.log('discovered: ' + sensorTag);

            if (sensorTag.uuid === this.uuid) {
                console.log("Matching Tag found.");

                this.sensorTag = sensorTag;

                this.sensorTag.on('disconnect', function () {
                    console.log('disconnected!');
                    this.scan();
                }.bind(this));

                this.connect();
            }
        }.bind(this));
    };

    /**
     *
     */
    TISensorTag.prototype.connect = function () {
        this.sensorTag.connectAndSetUp(function () {
            console.log('connectAndSetUp');

            this.sensorTag.readDeviceName(function (error, deviceName) {
                console.log('\tdevice name = ' + deviceName);
            }.bind(this));
            this.sensorTag.readManufacturerName(function (error, manufacturerName) {
                console.log('\tmanufacturer name = ' + manufacturerName);
            }.bind(this));
            this.sensorTag.readSystemId(function (error, systemId) {
                console.log('\tsystem ID = ' + systemId);
            }.bind(this));
            this.sensorTag.readSerialNumber(function (error, serialNumber) {
                console.log('\tserial number = ' + serialNumber);
            }.bind(this));

            // Temperatures

            this.sensorTag.readIrTemperature(function (error, objectTemperature, ambientTemperature) {
                console.log('\tobject temperature = %d °C', objectTemperature.toFixed(1));
                console.log('\tambient temperature = %d °C', ambientTemperature.toFixed(1));
            });

            this.sensorTag.enableIrTemperature(function () {
                this.sensorTag.on('irTemperatureChange', function (objectTemperature, ambientTemperature) {
                    this.state.objectTemperatur = objectTemperature.toFixed(1);
                    this.state.ambientTemperatur = ambientTemperature.toFixed(1);
                    this.publishStateChange();
                }.bind(this));
            }.bind(this));

            // Accelerometer

            if (this.configuration.accelerometerEnabled) {
                console.log("Check for Accelerometer")
                this.sensorTag.enableAccelerometer(function () {
                    console.log("Accelerometer enabled")
                    this.sensorTag.on("accelerometerChange", function (x, y, z) {
                        this.state.acceleration.x = x.toFixed(1);
                        this.state.acceleration.y = y.toFixed(1);
                        this.state.acceleration.z = z.toFixed(1);
                        this.publishStateChange();
                    }.bind(this))
                }.bind(this));
            }

            // Gyroscope

            if (this.configuration.gyroscopeEnabled) {
                console.log("Check for Gyroscope")
                this.sensorTag.enableGyroscope(function () {
                    console.log("Gyroscope enabled")
                    this.sensorTag.on("gyroscopeChange", function (x, y, z) {
                        this.state.gyroscopicPropulsion.x = x.toFixed(1);
                        this.state.gyroscopicPropulsion.y = y.toFixed(1);
                        this.state.gyroscopicPropulsion.z = z.toFixed(1);
                        this.publishStateChange();
                    }.bind(this))
                }.bind(this));
            }

            // Magnetometer

            if (this.configuration.magnetometerEnabled) {
                console.log("Check for Magnetometer")
                this.sensorTag.enableMagnetometer(function () {
                    console.log("Magnetometer enabled")
                    this.sensorTag.on("magnetometerChange", function (x, y, z) {
                        this.state.magneticFieldStrength.x = x.toFixed(1);
                        this.state.magneticFieldStrength.y = y.toFixed(1);
                        this.state.magneticFieldStrength.z = z.toFixed(1);
                        this.publishStateChange();
                    }.bind(this))
                }.bind(this));
            }

            // Humidity

            if (this.configuration.humidityEnabled) {
                this.sensorTag.enableHumidity(function () {
                    if (this.configuration.humidityNotificationInterval > 0) {
                        this.sensorTag.setHumidityPeriod(this.configuration.humidityNotificationInterval, function (error) {
                            this.sensorTag.notifyHumidity(function (error, humidity) {
                                this.state.humidity = humidity.toFixed(1);
                                this.publishStateChange();
                            }.bind(this));
                        }.bind(this));
                    }

                    this.sensorTag.on("humidityChange", function (humidity) {
                        this.state.humidity = humidity.toFixed(1);
                        this.publishStateChange();
                    }.bind(this))
                }.bind(this));
            }

            // Barometric Pressure

            if (this.configuration.barometricPressureEnabled) {
                this.sensorTag.enableBarometricPressure(function () {
                    this.sensorTag.on("barometricChange", function (barometricPressure) {
                        this.state.barometricPressure = barometricPressure.toFixed(1);
                        this.publishStateChange();
                    }.bind(this))
                }.bind(this));
            }

            // Luxometer

            if (this.configuration.luxometerEnabled) {
                this.sensorTag.enableLuxometer(function () {
                    if (this.configuration.luxometerNotificationInterval > 0) {
                        this.sensorTag.setLuxometerPeriod(this.configuration.luxometerNotificationInterval, function (error) {
                            this.sensorTag.notifyLuxometer(function (error, luminousIntensity) {
                                this.state.luminousIntensity = luminousIntensity.toFixed(1);
                                this.publishStateChange();
                            }.bind(this));
                        }.bind(this));
                    }

                    this.sensorTag.on("luxometerChange", function (luminousIntensity) {
                        this.state.luminousIntensity = luminousIntensity.toFixed(1);
                        this.publishStateChange();
                    }.bind(this))
                }.bind(this));
            }

            // Simple Keys

            this.sensorTag.on("simpleKeyChange", function (left, right) {
                console.log("Keys", left, right);

                if (left) {
                    this.publishEvent("left");
                }

                if (right) {
                    this.publishEvent("right");
                }
            }.bind(this));
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
