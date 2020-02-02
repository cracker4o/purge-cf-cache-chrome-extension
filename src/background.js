/* eslint-disable no-undef */
import Api from './api.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const {
        rSettings,
        rDomain,
        rZoneId,
        rPurgeSettings,
        rDevModeState,
    } = request;
    const api = new Api(rSettings.email, rSettings.key, rSettings.token);
    switch (request.type) {
    case 'getZoneId':
        api.getZoneId(rDomain).then((zoneId) => {
            sendResponse(zoneId);
        });
        break;
    case 'purgeCache':
        api.purgeCache(rPurgeSettings, rZoneId).then((rayId) => {
            sendResponse(rayId);
        });
        break;
    case 'getZoneDevelopmentMode':
        api.getZoneDevelopmentMode(rZoneId).then((zoneDevelopmentMode) => {
            sendResponse(zoneDevelopmentMode);
        });
        break;
    case 'setZoneDevelopmentMode':
        api.setZoneDevelopmentMode(rZoneId, rDevModeState);
        sendResponse();
        break;
    default:
        break;
    }

    return true;
});
