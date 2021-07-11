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
    const response = {
        result: null,
        error: null
    }
    switch (request.type) {
    case 'getZoneId':
        api.getZoneId(rDomain).then((zoneId) => {
            response.result = zoneId;
            return sendResponse(response);
        }).catch(error => {
            response.error = error;
            return sendResponse(response);
        });
        break;
    case 'purgeCache':
        api.purgeCache(rPurgeSettings, rZoneId).then((rayId) => {
            response.result = rayId;
            return sendResponse(response);
        }).catch(error => {
            response.error = error;
            sendResponse(response);
        });
        break;
    case 'getZoneDevelopmentMode':
        api.getZoneDevelopmentMode(rZoneId).then((zoneDevelopmentMode) => {
            response.result = zoneDevelopmentMode;
            return sendResponse(response);
        }).catch(error => {
            response.error = error;
            sendResponse(response);
        });
        break;
    case 'setZoneDevelopmentMode':
        api.setZoneDevelopmentMode(rZoneId, rDevModeState)
            .then(() => sendResponse(response))
            .catch(error => {
                response.error = error;
                return sendResponse(response);
            });
        break;
    default:
        break;
    }

    return true;
});
