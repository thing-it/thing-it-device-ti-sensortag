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
                id: "decimal"
            }
        }, {
            id: "ambientTemperature",
            label: "Ambient Temperature (°C)",
            type: {
                id: "decimal"
            }
        }, {
            id: "irTemperature",
            label: "IR Temperature (°C)",
            type: {
                id: "decimal"
            }
        }, {
            id: "barometricPressure",
            label: "Barometric Pressure (mBar)",
            type: {
                id: "decimal"
            }
        }, {
            id: "luminousIntensity",
            label: "Luminous Intensity (Lux)",
            type: {
                id: "decimal"
            }
        }],
        actorTypes: [],
        sensorTypes: [],
        services: [],
        configuration: [{
            id: "simulated",
            label: "Simulated",
            type: {
                id: "boolean"
            }
        }, {
            id: "uuid",
            label: "UUID",
            type: {
                id: "string"
            }
        }, {
            id: "barometricPressureEnabled",
            label: "Barometric Pressure Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "barometricPressureNotificationInterval",
            label: "Barometric Pressure Temperature Notification Interval (ms)",
            type: {
                id: "integer"
            },
            defaultValue: 300
        }, {
            id: "irTemperatureEnabled",
            label: "IR Temperature Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "irTemperatureNotificationIntervalNotificationInterval",
            label: "IR Temperature Notification Interval (ms)",
            type: {
                id: "integer"
            },
            defaultValue: 300
        }, {
            id: "ambientTemperatureEnabled",
            label: "Ambient Temperature Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "ambientTemperatureNotificationInterval",
            label: "Ambient Temperature Notification Interval (ms)",
            type: {
                id: "integer"
            },
            defaultValue: 300
        }, {
            id: "accelerometerEnabled",
            label: "Accelerometer Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "accelerometerNotificationInterval",
            label: "Accelerometer Notification Interval (ms)",
            type: {
                id: "integer"
            },
            defaultValue: 2000
        }, {
            id: "gyroscopeEnabled",
            label: "Gyroscope Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "gyroscopeNotificationInterval",
            label: "Gyroscope Notification Interval (ms)",
            type: {
                id: "integer"
            },
            defaultValue: 2000
        }, {
            id: "magnetometerEnabled",
            label: "Magnetometer Enabled",
            type: {
                id: "boolean"
            },
            defaultValue: true
        }, {
            id: "magnetometerNotificationInterval",
            label: "Magnetometer Notification Interval (ms)",
            type: {
                id: "integer"
            },
            defaultValue: 2000
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
                id: "integer"
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
                id: "integer"
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
var SensorTag;

function TISensorTagDiscovery() {
    /**
     *
     * @param options
     */
    TISensorTagDiscovery.prototype.start = function () {
        if (this.node.isSimulated()) {
        } else {
            if (!SensorTag) {
                SensorTag = require("sensortag");
            }

            SensorTag.discover(function (sensorTag) {
                var tiSensorTag = new TISensorTag();

                tiSensorTag.sensorTag = sensorTag;
                tiSensorTag.uuid = sensorTag.uuid;
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
            ambientTemperature: null,
            magneticFieldStrength: {x: null, y: null, z: null},
            luminousIntensity: null
        };

        if (this.sensorTag) {
            this.connect();

            deferred.resolve();
        }
        else {
            if (!this.isSimulated()) {
                this.started = true;

                if (!SensorTag) {
                    SensorTag = require("sensortag");

                    this.scan();
                }

                deferred.resolve();
            } else {
                this.simulationInterval = setInterval(function () {
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
                        luminousIntensity: 1500 + Math.floor((Math.random() * 100))
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
    TISensorTag.prototype.stop = function () {
        if (!this.isSimulated()) {
            this.started = false;

            if (this.sensorTag) {
                console.log("Disconnect TI SensorTag.");

                this.sensorTag.disconnect();
            }
        } else {
            console.log("Stop simulating TI SensorTag.");

            if (this.simulationInterval) {
                clearInterval(this.simulationInterval);
            }
        }
    };

    /**
     *
     */
    TISensorTag.prototype.scan = function () {
        console.log("\tScanning for Sensor Tag " + this.configuration.uuid + " started.");

        SensorTag.discover(function (sensorTag) {
            if (!this.started)
            {
                console.log("Skipping discovered SensorTag - Device stopped.");

                return;
            }

            console.log("\nSensor Tag " + sensorTag.uuid + " found.");

            if (sensorTag.uuid === this.configuration.uuid) {
                console.log("\nMatching Sensor Tag found.");

                this.sensorTag = sensorTag;

                this.sensorTag.on('disconnect', function () {
                    console.log('\nDisconnected.');
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

                if (this.configuration.irTemperatureEnabled) {
                    this.sensorTag.enableIrTemperature(function () {
                        if (this.configuration.irTemperatureNotificationInterval > 0) {
                            this.sensorTag.setIrTemperaturePeriod(this.configuration.irTemperatureNotificationInterval, function (error) {
                                this.sensorTag.notifyIrTemperature(function (error, irTemperature) {
                                    if (irTemperature) {
                                        this.state.irTemperature = irTemperature.toFixed(1);
                                        this.publishStateChange();
                                    }
                                }.bind(this));
                            }.bind(this));
                        }

                        this.sensorTag.on('irTemperatureChange', function (objectTemperature, ambientTemperature) {
                            this.state.irTemperature = objectTemperature.toFixed(1);
                            this.state.ambientTemperature = ambientTemperature.toFixed(1);

                            this.publishStateChange();
                        }.bind(this));
                    }.bind(this));
                }

                if (this.configuration.ambientTemperatureEnabled) {
                    this.sensorTag.enableIrTemperature(function () {
                        if (this.configuration.ambientTemperatureNotificationInterval > 0) {
                            this.sensorTag.setIrTemperaturePeriod(this.configuration.ambientTemperatureNotificationInterval, function (error) {
                                this.sensorTag.notifyIrTemperature(function (error, irTemperature, ambientTemperature) {
                                    if (ambientTemperature) {
                                        this.state.ambientTemperature = ambientTemperature.toFixed(1);
                                        this.publishStateChange();
                                    }
                                }.bind(this));
                            }.bind(this));
                        }

                        this.sensorTag.on('irTemperatureChange', function (objectTemperature, ambientTemperature) {
                            this.state.irTemperature = objectTemperature.toFixed(1);
                            this.state.ambientTemperature = ambientTemperature.toFixed(1);

                            this.publishStateChange();
                        }.bind(this));
                    }.bind(this));
                }

                // Accelerometer

                if (this.configuration.accelerometerEnabled) {
                    this.sensorTag.enableAccelerometer(function () {
                        if (this.configuration.accelerometerNotificationInterval > 0) {
                            this.sensorTag.setAccelerometerPeriod(this.configuration.accelerometerNotificationInterval, function (error) {
                                this.sensorTag.notifyAccelerometer(function (error, x, y, z) {
                                    if (x) {
                                        this.state.acceleration.x = x.toFixed(1);
                                    }

                                    if (y) {
                                        this.state.acceleration.y = y.toFixed(1);
                                    }

                                    if (z) {
                                        this.state.acceleration.z = z.toFixed(1);
                                    }

                                    this.publishStateChange();
                                }.bind(this));
                            }.bind(this));
                        }

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
                    this.sensorTag.enableGyroscope(function () {
                        if (this.configuration.gyroscopeNotificationInterval > 0) {
                            this.sensorTag.setGyroscopePeriod(this.configuration.gyroscopeNotificationInterval, function (error) {
                                this.sensorTag.notifyGyroscope(function (error, x, y, z) {
                                    if (x) {
                                        this.state.gyroscopicPropulsion.x = x.toFixed(1);
                                    }

                                    if (y) {
                                        this.state.gyroscopicPropulsion.y = y.toFixed(1);
                                    }

                                    if (z) {
                                        this.state.gyroscopicPropulsion.z = z.toFixed(1);
                                    }

                                    this.publishStateChange();
                                }.bind(this));
                            }.bind(this));
                        }

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
                    this.sensorTag.enableMagnetometer(function () {
                        if (this.configuration.magnetometerNotificationInterval > 0) {
                            this.sensorTag.setMagnetometerPeriod(this.configuration.magnetometerNotificationInterval, function (error) {
                                this.sensorTag.notifyMagnetometer(function (error, x, y, z) {
                                    if (x) {
                                        this.state.magneticFieldStrength.x = x.toFixed(1);
                                    }

                                    if (y) {
                                        this.state.magneticFieldStrength.y = y.toFixed(1);
                                    }

                                    if (z) {
                                        this.state.magneticFieldStrength.z = z.toFixed(1);
                                    }

                                    this.publishStateChange();
                                }.bind(this));
                            }.bind(this));
                        }

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
                                this.sensorTag.notifyHumidity(function (error, temperature, humidity) {
                                    if (humidity) {
                                        this.state.humidity = humidity.toFixed(1);
                                        this.publishStateChange();
                                    }
                                }.bind(this));
                            }.bind(this));
                        }

                        this.sensorTag.on("humidityChange", function (temperature, humidity) {
                            this.state.humidity = humidity.toFixed(1);
                            this.publishStateChange();
                        }.bind(this))
                    }.bind(this));
                }

                // Barometric Pressure

                if (this.configuration.barometricPressureEnabled) {
                    this.sensorTag.enableBarometricPressure(function () {
                        if (this.configuration.barometricPressureNotificationInterval > 0) {
                            this.sensorTag.setBarometricPressurePeriod(this.configuration.barometricPressureNotificationInterval, function (error) {
                                this.sensorTag.notifyBarometricPressure(function (error, barometricPressure) {
                                    if (barometricPressure) {
                                        this.state.barometricPressure = barometricPressure.toFixed(1);

                                        this.publishStateChange();
                                    }
                                }.bind(this));
                            }.bind(this));
                        }
                        this.sensorTag.on("barometricChange", function (barometricPressure) {
                            if (barometricPressure) {
                                this.state.barometricPressure = barometricPressure.toFixed(1);
                            }

                            this.publishStateChange();
                        }.bind(this))
                    }.bind(this));
                }

                // Luxometer

                if (this.sensorTag.type != "cc2540" && this.configuration.luxometerEnabled) {
                    this.sensorTag.enableLuxometer(function () {
                        if (this.configuration.luxometerNotificationInterval > 0) {
                            this.sensorTag.setLuxometerPeriod(this.configuration.luxometerNotificationInterval, function (error) {
                                this.sensorTag.notifyLuxometer(function (error, luminousIntensity) {
                                    if (luminousIntensity) {
                                        this.state.luminousIntensity = luminousIntensity.toFixed(1);
                                    }

                                    this.publishStateChange();
                                }.bind(this));
                            }.bind(this));
                        }

                        this.sensorTag.on("luxometerChange", function (luminousIntensity) {
                            if (luminousIntensity) {
                                this.state.luminousIntensity = luminousIntensity.toFixed(1);
                            }

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
            }.bind(this)
        )
        ;
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
