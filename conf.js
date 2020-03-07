'use strict';   //Recommendation for javascript

var fs = require('fs-extra');
const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
var jasmineReporters = require('jasmine-reporters');
var dateformat = require('dateformat');

const dateFolder = dateformat(new Date(), "dd-mm-yyyy");
var reportsDirectory = './reports';
var emailReport = reportsDirectory + '/e2esite/';
var htmlReport = emailReport + dateFolder;
var screenshots = emailReport + '/screenshots';

//Configuration to use jasmine screenshot
var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var ScreenshotAndStackReporter = new HtmlScreenshotReporter({
    dest: emailReport,
    filename: 'E2ETestingReport.html',
    reportTitle: "E2E Testing Report",
    showSummary: true,
    reportOnlyFailedSpecs: false,
    captureOnlyFailedSpecs: true,
});

//Global configurations exports to protractor project
exports.config = {
    //directConnect: true,    //Ignore selenium to use browsers
    getPageTimeout: 100000,
    framework: 'jasmine2',
    seleniumAddress: 'http://localhost:4723/wd/hub',

    //Test suits
    suites: {
        eventPage: ['specs/eventPage_spec.js']
    },

    capabilities:{
        browserName: 'chrome',
        'appium-version': '1.16.0',
        automationName: 'UiAutomator1',
        platformName: 'Android',
        platformVersion: '7.0',
        deviceName: 'emulator-5554',
      },

    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        isVerbose: true,
        onComplete: null,                 //Actions that Jasmine will do when complete all tests
        showColors: true,                 //Show differents collors according the result of the tests (Ok = Green, Failure = Red)
        inclueStackTrace: true,           //Cases of failure, show a complete stacktrace
        defaultTimeoutInterval: 900000,   //Timeout from jasmine for each test run
        print: function () { },
    },

    beforeLaunch: function () {
        //Setup the jasmine report before any tests start // Setup do relatório antes de iniciar os testes
        return new Promise(function (resolve) {
            ScreenshotAndStackReporter.beforeLaunch(resolve);
        })
    },

    onPrepare: async function () {
        await browser.waitForAngularEnabled(false);
        //Generate report execution in console
        jasmine.getEnv().addReporter(new SpecReporter({
            spec: {
                displayStacktrace: true
            },
            summary: {
                displayDuration: false
            }
        }));

        //XML report generated for dashboard
        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
            consolidateAll: true,
            savePath: emailReport,
            filePrefix: 'xmlOutput'
        }));

        //Create directory if do not exists
        if (!fs.existsSync(htmlReport)) {
            fs.mkdirSync(htmlReport);
            fs.mkdirSync(screenshots);
        }
        else {
            fs.emptyDir(htmlReport);
        }

        jasmine.getEnv().addReporter({
            specDone: function (result) {
                if (result.status == 'failed') {
                    browser.getCapabilities().then(function (caps) {
                        var browserName = caps.get('browserName');

                        browser.takeScreenshot().then(function (png) {
                            var stream = fs.createWriteStream(screenshots + '/' + browserName + '-' + result.fullName + '.png');
                            stream.write(new Buffer.from(png, 'base64'));
                            stream.end();
                        });
                    });
                }
            }
        });

        //Generate screenshots report
        jasmine.getEnv().addReporter(ScreenshotAndStackReporter);
    },

    //HTMLReport called once tests are finished
    onComplete: function () {
        var browserName, browserVersion, platform;
        var capsPromise = browser.getCapabilities();

        capsPromise.then(function (caps) {
            browserName = caps.get('browserName');
            browserVersion = caps.get('version');
            platform = caps.get('platform');

            var HTMLReport = require('protractor-html-reporter-2');

            var testConfig = {
                reportTitle: 'Protractor Test Execution Report - E2E Web Site',
                outputPath: htmlReport,
                outputFilename: browserName + 'TestReport',
                screenshotPath: '../screenshots',
                testBrowser: browserName,
                browserVersion: browserVersion,
                modifiedSuiteName: false,
                screenshotsOnlyOnFailure: true,
                testPlatform: platform
            };
            new HTMLReport().from(emailReport + '/xmlOutput.xml', testConfig);
        });
    }

};