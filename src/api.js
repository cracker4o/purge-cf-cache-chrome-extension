/* Copyright 2019 Tosho Toshev

   Licensed under the Apache License, Version 2.0 (the 'License');
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an 'AS IS' BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
/* eslint-disable no-undef */

/**
 * Provides convenient methods for communicating with the CloudFlare API
 * @see https://api.cloudflare.com
 */
export default class CloudFlareApi {
    constructor(email, key) {
        this.email = email;
        this.key = key;
        this.cloudFlareApiUrl = 'https://api.cloudflare.com/client/v4/';
    }

    /**
     * Gets the CloudFlare zoneId for the current domain
     * @see https://api.cloudflare.com/#zone-list-zones
     * @param {String} domain a domain name.
     */
    async getZoneId(domain) {
        const url = `${this.cloudFlareApiUrl}zones?name=${domain}&status=active`;
        const data = await fetch(url,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-Email': this.email,
                    'x-auth-key': this.key,
                },
            }).json();
        
        if (data.success && data.result[0]) {
            return data.result[0].id;
        }

        throw new Error('Unable to get the zone ID.');
    }

    /**
     * Purges the CloudFlare cache for a particular domain for a provided set of urls.
     * @see https://api.cloudflare.com/#zone-purge-files-by-url 
     * @param {Object} files an array of urls to purge
     * @param {String} zoneId the zone ID of the domain
     */
    async purgeCache(files, zoneId) {
        if (!files) {
            throw new Error('No files for purging.')
        }

        const url = `${this.cloudFlareApiUrl}/zones/${zoneId}/purge_cache`;
        const data = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-Email': this.email,
                'x-auth-key': this.key,
            },
            body: JSON.stringify(files),
        }).json();

        if (data.success && data.result) {
            return data.result;
        }

        throw new Error('Purge failed.');
    }

    /**
     * Gets the development mode setting for the provided zone
     * @see https://api.cloudflare.com/#zone-settings-get-development-mode-setting
     * @param {String} zoneId the zone ID
     */
    async getZoneDevelopmentMode(zoneId) {
        const url = `${this.cloudFlareApiUrl}/zones/${zoneId}/settings/development_mode`;
        const data = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-Email': this.email,
                'x-auth-key': this.key,
            },
        }).json();

        if (data.success && data.result) {
            return data.result.value === 'on';
        }

        throw new Error('Unable to get the development mode setting.');
    }

    /**
     * Sets the development mode setting for the provided zone
     * @see https://api.cloudflare.com/#zone-settings-change-development-mode-setting
     * @param {String} zoneId
     * @param {Boolean} developmentModeState
     */
    async setZoneDevelopmentMode(zoneId, developmentModeState) {

        const url = `${this.cloudFlareApiUrl}/zones/${zoneId}/settings/development_mode`;
        const val = developmentModeState ? 'on' : 'off';
        const data = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-Email': this.email,
                'x-auth-key': this.key,
            },
            body: JSON.stringify({
                value: val,
            }),
        }).json();

        if (data.success && data.result) {
            return data.result.value === 'on';
        }

        throw new Error('Unable to set the development mode setting.');
    }
}
