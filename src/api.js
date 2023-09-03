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
    constructor(email, key, token) {
        this.email = email;
        this.key = key;
        this.token = token;
        this.cloudFlareApiUrl = 'https://api.cloudflare.com/client/v4/';
    }

    /**
     * Gets the CloudFlare zoneId for the current domain
     * @see https://api.cloudflare.com/#zone-list-zones
     * @param {String} domain a domain name.
     */
    async getZoneId(domain) {
        const url = `${this.cloudFlareApiUrl}zones?name=${domain}&status=active`;
        let headers = {
            'Content-Type': 'application/json',
            'x-auth-Email': this.email,
            'x-auth-key': this.key,
        };

        if (this.token) {
            headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
            };
        }

        const result = await fetch(
            url,
            {
                method: 'GET',
                headers,
            },
        );

        if (result && result.ok) {
            const data = await result.json();
            if (data.result.length > 0) {
                return data.result[0].id;
            }
        }

        throw new Error('Unable to get the zone ID.');
    }

    /**
     * Gets all CloudFlare zones owned by the user
     * @see https://api.cloudflare.com/#zone-list-zones
     */
    async getZones() {
        const url = `${this.cloudFlareApiUrl}zones?status=active`;
        let headers = {
            'Content-Type': 'application/json',
            'x-auth-Email': this.email,
            'x-auth-key': this.key,
        };

        if (this.token) {
            headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
            };
        }

        const result = await fetch(
            url,
            {
                method: 'GET',
                headers,
            },
        );

        if (result && result.ok) {
            const data = await result.json();
            if (data.result.length > 0) {
                return data.result;
            }
        }

        throw new Error('Unable to get the zone ID.');
    }

    /**
     * Purges the CloudFlare cache for a particular domain for a provided set of urls.
     * @see https://api.cloudflare.com/#zone-purge-files-by-url
     * @param {Object} purgeSettings an array of urls to purge
     * @param {String} zoneId the zone ID of the domain
     */
    async purgeCache(purgeSettings, zoneId) {
        if (!purgeSettings) {
            throw new Error('No files for purging.');
        }

        const url = `${this.cloudFlareApiUrl}zones/${zoneId}/purge_cache`;
        let headers = {
            'Content-Type': 'application/json',
            'x-auth-Email': this.email,
            'x-auth-key': this.key,
        };

        if (this.token) {
            headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
            };
        }
        const result = await fetch(url, {
            method: 'DELETE',
            headers,
            body: JSON.stringify(purgeSettings),
        });

        if (result && result.ok) {
            const data = await result.json();
            if (data.success) {
                return data.result.id;
            }
        }

        throw new Error('Purge failed.');
    }

    /**
     * Gets the development mode setting for the provided zone
     * @see https://api.cloudflare.com/#zone-settings-get-development-mode-setting
     * @param {String} zoneId the zone ID
     */
    async getZoneDevelopmentMode(zoneId) {
        const url = `${this.cloudFlareApiUrl}zones/${zoneId}/settings/development_mode`;
        let headers = {
            'Content-Type': 'application/json',
            'x-auth-Email': this.email,
            'x-auth-key': this.key,
        };

        if (this.token) {
            headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
            };
        }
        const result = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (result && result.ok) {
            const data = await result.json();
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
        const url = `${this.cloudFlareApiUrl}zones/${zoneId}/settings/development_mode`;
        let headers = {
            'Content-Type': 'application/json',
            'x-auth-Email': this.email,
            'x-auth-key': this.key,
        };

        if (this.token) {
            headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
            };
        }

        const val = developmentModeState ? 'on' : 'off';
        const result = await fetch(url, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                value: val,
            }),
        });

        if (result && result.ok) {
            const data = await result.json();
            return data.result.value === 'on';
        }

        throw new Error('Unable to set the development mode setting.');
    }
}
