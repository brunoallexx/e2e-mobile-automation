'use strict';

const event = require('../pages/eventPage_po.js');

var EC = protractor.ExpectedConditions;

describe('Event Page Suite', function () {

    beforeAll(function () {
        browser.ignoreSynchronization = true; //Parameter to applications different of Angular
    });

    it('Access event page', function() {
        event.accessEvent(60163);
        browser.sleep(15000);
        expect(event.eventTitle.getText()).toContain('Teste Automático');
        browser.executeScript("arguments[0].click()", event.eventBuyButton);
    });
})