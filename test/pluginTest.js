var assert = require("assert");

describe('[thing-it] Sensor Tag', function () {
    var testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: 'debug'});

        testDriver.registerDevicePlugin('ti-sensortag', __dirname + '/../tiSensorTag');
    });
    describe('Start Configuration', function () {
        this.timeout(60000);

        it('should complete without error', function (done) {
            testDriver.start({
                configuration: require("../examples/configuration.js"),
                heartbeat: 10
            });
            testDriver.addListener({
                publishDeviceStateChange: function (device) {
                    //done();
                }
            });
        });
    });
});





