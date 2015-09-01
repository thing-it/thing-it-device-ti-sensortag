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
        events: [{id: "leftClick", label: "Left Click"}, {id: "rightClick", label: "Right Click"}, {
            id: "bothClick",
            label: "Both Click"
        }],
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
            id: "irTemperatureNotificationInterval",
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
var defaultDelay = 2000;

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
            if (!this.started) {
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
                if (this.configuration.irTemperatureEnabled || this.configuration.ambientTemperatureEnabled) {
                    this.sensorTag.enableIrTemperature(function (error) {
                        this.logDebug("Enabled temperature notifications.");

                        this.sensorTag.on('irTemperatureChange', function (objectTemperature, ambientTemperature) {
                            this.logDebug("Temperature change:", objectTemperature, ambientTemperature);

                            if (objectTemperature && this.configuration.irTemperatureEnabled) {
                                this.state.irTemperature = objectTemperature.toFixed(1);
                            }

                            if (ambientTemperature && this.configuration.ambientTemperatureEnabled) {
                                this.state.ambientTemperature = ambientTemperature.toFixed(1);
                            }

                            this.publishStateChange();
                        }.bind(this));

                        var temperatureInterval = Math.max(this.configuration.irTemperatureNotificationInterval,
                            this.configuration.ambientTemperatureNotificationInterval);
                        temperatureInterval = (temperatureInterval > 0 ? temperatureInterval : defaultDelay);

                        this.sensorTag.setIrTemperaturePeriod(temperatureInterval, function (error) {
                            this.sensorTag.notifyIrTemperature(function (error) {
                            });
                        }.bind(this));
                    }.bind(this));
                }
                else {
                    this.sensorTag.disableIrTemperature(function (error) {
                        this.logDebug("Disabled temperature notifications.");
                    }.bind(this));
                }


                // Accelerometer
                if (this.configuration.accelerometerEnabled) {
                    this.sensorTag.enableAccelerometer(function () {
                        this.logDebug("Enabled accelerometer notifications.");

                        this.sensorTag.on("accelerometerChange", function (x, y, z) {
                            this.logDebug("Accelerometer change:", x, y, z);

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

                        var accelerometerNotificationInterval;

                        // Values equal or greater than 2500 can lead to failure to set the period
                        if (this.configuration.accelerometerNotificationInterval > 0 &&
                            this.configuration.accelerometerNotificationInterval < 2500){
                            accelerometerNotificationInterval = this.configuration.accelerometerNotificationInterval;
                        }
                        else{
                            accelerometerNotificationInterval = 500;
                        }

                        this.sensorTag.setAccelerometerPeriod(accelerometerNotificationInterval, function (error) {
                            this.sensorTag.notifyAccelerometer();
                        }.bind(this));
                    }.bind(this));
                }
                else {
                    this.sensorTag.disableAccelerometer(function (error){
                        this.logDebug("Disabled accelerometer notifications.");
                    }.bind(this));
                }

                // Gyroscope
                if (this.configuration.gyroscopeEnabled) {
                    this.sensorTag.enableGyroscope(function () {
                        this.logDebug("Enabled gyroscope notifications.");

                        this.sensorTag.on("gyroscopeChange", function (x, y, z) {
                            this.logDebug("Gyroscope change:", x, y, z);

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
                        }.bind(this))

                        var gyroscopeNotificationInterval;

                        // Values equal or greater than 2500 can lead to failure to set the period
                        if (this.configuration.gyroscopeNotificationInterval > 0 &&
                            this.configuration.gyroscopeNotificationInterval < 2500){
                            gyroscopeNotificationInterval = this.configuration.gyroscopeNotificationInterval;
                        }
                        else{
                            gyroscopeNotificationInterval = 500;
                        }

                        this.sensorTag.setGyroscopePeriod(gyroscopeNotificationInterval, function (error) {
                            this.sensorTag.notifyGyroscope();
                        }.bind(this));
                    }.bind(this));
                }
                else {
                    this.sensorTag.disableGyroscope(function (error){
                        this.logDebug("Disabled gyroscope notifications.");
                    }.bind(this));
                }


                // Magnetometer
                if (this.configuration.magnetometerEnabled) {
                    this.sensorTag.enableMagnetometer(function () {
                        this.logDebug("Enabled magnetometer notifications.");

                        this.sensorTag.on("magnetometerChange", function (x, y, z) {
                            this.logDebug("Magnetometer change:", x, y, z);

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
                        }.bind(this))

                        var magnetometerNotificationInterval;

                        // Values equal or greater than 2500 can lead to failure to set the period
                        if (this.configuration.magnetometerNotificationInterval > 0 &&
                            this.configuration.magnetometerNotificationInterval < 2500){
                            magnetometerNotificationInterval = this.configuration.magnetometerNotificationInterval;
                        }
                        else{
                            magnetometerNotificationInterval = 500;
                        }

                        this.sensorTag.setMagnetometerPeriod(magnetometerNotificationInterval, function (error) {
                            this.sensorTag.notifyMagnetometer();
                        }.bind(this));
                    }.bind(this));
                }
                else {
                    this.sensorTag.disableMagnetometer(function (error) {
                        this.logDebug("Disabled magnetometer notifications.")
                    }.bind(this));
                }


                // Humidity
                if (this.configuration.humidityEnabled) {
                    this.sensorTag.enableHumidity(function (error) {
                        this.logDebug("Enabled humidity notifications.");

                        this.sensorTag.on('humidityChange', function (temperature, humidity) {
                            this.logDebug("Humidity change:", humidity);

                            if (humidity) {
                                this.state.humidity = humidity.toFixed(1);
                            }

                            this.publishStateChange();
                        }.bind(this));

                        var humidityInterval = (this.configuration.humidityNotificationInterval > 0 ?
                            this.configuration.humidityNotificationInterval : defaultDelay);

                        this.sensorTag.setHumidityPeriod(humidityInterval, function (error) {
                            this.sensorTag.notifyHumidity(function (error) {
                            }.bind(this));
                        }.bind(this));


                        setInterval(function() {
                            this.sensorTag.readHumidity(function (error, temperature, humidity){
                                this.logDebug("Humidity read at " + humidity + " and temperature at " + temperature);

                                if (humidity) {
                                    this.state.humidity = humidity.toFixed(1);
                                }
                            }.bind(this));
                        }.bind(this), humidityInterval);
                    }.bind(this));
                }
                else {
                    this.sensorTag.disableHumidity(function (error) {
                        this.logDebug("Disabled humidity notifications.");
                    }.bind(this));
                }


                // Barometric Pressure
                if (this.configuration.barometricPressureEnabled) {
                    this.sensorTag.enableBarometricPressure(function (error) {
                        this.logDebug("Enabled barometricPressure notifications.");

                        this.sensorTag.on('barometricPressureChange', function (barometricPressure) {
                            this.logDebug("Barometric pressure change:", barometricPressure);

                            if (barometricPressure) {
                                this.state.barometricPressure = barometricPressure.toFixed(1);
                            }

                            this.publishStateChange();
                        }.bind(this));

                        var barometricPressureInterval = (this.configuration.barometricPressureNotificationInterval > 0 ?
                            this.configuration.barometricPressureNotificationInterval : defaultDelay);

                        this.sensorTag.setBarometricPressurePeriod(barometricPressureInterval, function (error) {
                            this.sensorTag.notifyBarometricPressure(function (error) {
                            });
                        }.bind(this));
                    }.bind(this));
                }
                else {
                    this.sensorTag.disableBarometricPressure(function (error) {
                        this.logDebug("Disabled barometric pressure notifications.");
                    }.bind(this));
                }

                // Luxometer
                if (this.sensorTag.type != "cc2540" && this.configuration.luxometerEnabled) {
                    this.sensorTag.enableLuxometer(function (error) {
                        this.logDebug("Enabled luxometer notifications.");

                        this.sensorTag.on('luxometerChange', function (luxometer) {
                            this.logDebug("Luxometer change:", luxometer);

                            if (luxometer) {
                                this.state.luminousIntensity = luxometer.toFixed(1);
                            }

                            this.publishStateChange();
                        }.bind(this));

                        var luxometerInterval = (this.configuration.luxometerNotificationInterval > 0 ?
                            this.configuration.luxometerNotificationInterval : defaultDelay);

                        this.sensorTag.setLuxometerPeriod(luxometerInterval, function (error) {
                            this.sensorTag.notifyLuxometer(function (error) {
                            });
                        }.bind(this));
                    }.bind(this));
                }
                else {
                    this.sensorTag.disableLuxometer(function (error) {
                        this.logDebug("Disabled luxometer notifications.");
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
