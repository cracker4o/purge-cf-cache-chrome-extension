/* Copyright 2019 Tosho Toshev

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License. */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */

import Utility from './utility.js';
import Api from './api.js';

class Options {
    constructor() {
        const isFirefox = typeof InstallTrigger !== 'undefined';
        if (isFirefox) {
            chrome = browser;
        }

        this.utility = new Utility();
        this.elements = {
            saveButton: document.querySelector('#save'),
            hidePurgeAllCheckbox: document.querySelector('#hide-purge-all'),
            customPurgeButton: document.querySelector('#custom-purge'),
            showDevModeCheckbox: document.querySelector('#show-dev-mode'),
            keyBox: document.querySelector('#key'),
            emailBox: document.querySelector('#email'),
            refreshBox: document.querySelector('#refresh'),
            customPurgeGroup: document.querySelector('#custom-purge-group'),
            statusField: document.querySelector('#status'),
            customUrl: document.querySelector('#custom-url'),
            purgeStatus: document.querySelector('#purge-status'),
        };
        this.settings = {
            tag: 'options',
            key: null,
            email: null,
            refresh: null,
            hidePurgeAll: false,
            showDevMode: false,
        };

        this.elements.saveButton.addEventListener('click', this.saveClick.bind(this));
        this.elements.customPurgeButton.addEventListener('click', this.customPurge.bind(this));
        this.elements.hidePurgeAllCheckbox.addEventListener('change', this.saveClick.bind(this));
        this.elements.showDevModeCheckbox.addEventListener('change', this.saveClick.bind(this));
        this.restoreOptions();
    }

    static build() {
        return new Options();
    }

    restoreOptions() {
        chrome.storage.sync.get(this.settings, (items) => {
            this.elements.keyBox.value = items.key;
            this.elements.emailBox.value = items.email;
            this.elements.hidePurgeAllCheckbox.checked = items.hidePurgeAll;
            this.elements.showDevModeCheckbox.checked = items.showDevMode;

            this.api = new Api(items.email, items.key);

            if (items.refresh != null && items.refresh !== undefined) {
                this.elements.refreshBox.value = items.refresh;
            } else {
                this.elements.refreshBox.value = 10;
            }

            if (items.key != null && items.key !== '' && items.email != null && items.email !== '') {
                this.elements.customPurgeGroup.classList.remove('hide');
            } else {
                this.elements.customPurgeGroup.classList.add('hide');
            }
        });
    }

    saveClick() {
        const key = this.elements.keyBox.value;
        const email = this.elements.emailBox.value;
        const refresh = this.elements.refreshBox.value;
        const hidePurgeAll = this.elements.hidePurgeAllCheckbox.checked;
        const showDevMode = this.elements.showDevModeCheckbox.checked;

        if (key === '' || email === '' || refresh === '') {
            return;
        }

        this.settings = {
            tag: 'options',
            key,
            email,
            refresh,
            hidePurgeAll,
            showDevMode,
        };

        chrome.storage.sync.set(this.settings, () => {
            this.elements.statusField.innerHTML = 'Options saved.';

            if (this.elements.keyBox.value !== '' && this.elements.emailBox.value !== '') {
                this.elements.customPurgeGroup.classList.remove('hide');
            } else {
                this.elements.customPurgeGroup.classList.add('hide');
            }

            setTimeout(() => {
                this.elements.statusField.innerHTML = '';
            }, 1500);
        });
    }

    async customPurge() {
        let url = this.elements.customUrl.value;
        let domain = '';

        if (url === '') {
            return;
        }
        url = url.split('\n').join(',');
        const urls = url.indexOf(',') >= 0 ? url.split(',') : [url];

        for (let i = 0; i < urls.length; i += 1) {
            urls[i] = urls[i].trim();
            const regex = new RegExp(/^https?:\/\/.*/g);
            if (urls[i].match(regex) == null) {
                this.utility.setStatusMessage(this.elements.purgeStatus, `URL validation error - ${urls[i]}`, 3000);
                return;
            }

            const tmpDomain = this.utility.getDomain(urls[i]);
            if (tmpDomain === '') {
                this.utility.setStatusMessage(this.elements.purgeStatus, `Could not determine the domain for url: ${urls[i]}`, 3000);
                return;
            }

            if (domain === '') {
                domain = tmpDomain;
            } else if (domain !== tmpDomain) {
                this.utility.setStatusMessage(this.elements.purgeStatus, 'All urls should be under the same domain.', 3000);
                return;
            }
        }

        try {
            const zoneId = await this.api.getZoneId(domain);
            try {
                const purgeSuccessId = await this.api.purgeCache({ files: urls }, zoneId);
                this.utility.setStatusMessage(this.elements.purgeStatus, `PURGE SUCESSFUL - Purge vector: ${purgeSuccessId}`, 3000);
            } catch (error) {
                this.utility.setStatusMessage(this.elements.purgeStatus, error, 3000);
            }
        } catch (zoneError) {
            this.utility.setStatusMessage(this.elements.purgeStatus, zoneError, 3000);
        }
    }
}

Options.build();
