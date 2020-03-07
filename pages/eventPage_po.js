'use strict';

var EC = protractor.ExpectedConditions;

class EventPage {

    constructor(){
        this.eventTitle = element(by.js("return document.getElementsByClassName('info-container main style-scope event-profile')[0].getElementsByClassName('title style-scope event-profile')[0];"));
        this.eventBuyButton = element(by.js("return document.getElementsByClassName('buy-button style-scope event-profile x-scope app-button-1')[0];"));
    }

    async accessEvent(idEvent) {
        const config = await browser.getProcessedConfig();
        var url;

        switch (config.env) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                url = "https://" + config.env + "-web.wh-cdn.bileto.sympla.com.br/event/" + idEvent;
                browser.get(url);
                return;

            case 'release':
                url = "https://release-web.wh-cdn.bileto.sympla.com.br/event/" + idEvent;
                browser.get(url);
                return;

            default:
                url = "https://test-web.wh-cdn.bileto.sympla.com.br/event/" + idEvent;
                browser.get(url);
                return;
        }
    }
}

module.exports = new EventPage();