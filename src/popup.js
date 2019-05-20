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
/* eslint-disable no-console */

import Utility from './utility.js';
import PurgeInfo from './info.js';
import Api from './api.js';

class PopUp {
    constructor() {
        this.utility = new Utility();
        this.purgeInfo = new PurgeInfo();
        this.currentUrl = null;
        this.currentTabId = null;
        this.settings = null;
        this.settingsSet = false;
        this.defaultPromptText = 'Purge entire cache?';
        this.elements = {
            purgeButton: document.querySelector('#purgeButton'),
            purgeAllButton: document.querySelector('#purgeAllButton'),
            devModeWrapper: document.querySelector('.dev-mode-wrapper'),
            optionsButton: document.querySelector('#optionsButton'),
            prompText: document.querySelector('#prompt-text'),
            lightBox: document.querySelector('#lightbox'),
            devMode: document.querySelector('#dev-mode'),
            status: document.querySelector('#status'),
            refresh: document.querySelector('#refresh'),
            subStatus: document.querySelector('#sub-status'),
            promptElement: document.querySelector('#lightbox'),
            promptYes: document.querySelector('#promptYes'),
            promptNo: document.querySelector('#promptNo'),
        };

        const isFirefox = typeof InstallTrigger !== 'undefined';
        if (isFirefox) {
            chrome = browser;
        }

        this.hideElement(this.elements.purgeButton);
        this.hideElement(this.elements.purgeAllButton);
        this.hideElement(this.elements.devModeWrapper);
        this.showElement(this.elements.optionsButton);
        this.elements.prompText.innerHTML = this.defaultPromptText;
        this.elements.purgeAllButton.addEventListener('click', this.purgeAllClick.bind(this));
        this.elements.purgeButton.addEventListener('click', this.purgeButtonClick.bind(this));
        this.elements.optionsButton.addEventListener('click', this.optionsButtonClick.bind(this));
        this.elements.devMode.addEventListener('change', this.toggleDeveloperMode.bind(this));
        this.loadSettings();
    }

    static build() {
        return new PopUp();
    }

    async loadSettings() {
        if (!chrome.storage) {
            const settings = await browser.storage.sync.get({
                tag: 'options',
                key: null,
                email: null,
                refresh: null,
                hidePurgeAll: false,
                showDevMode: false,
            });
            this.setup(settings);
            return;
        }

        chrome.storage.sync.get({
            tag: 'options',
            key: null,
            email: null,
            refresh: null,
            hidePurgeAll: false,
            showDevMode: false,
        }, (items) => {
            this.setup(items);
        });
    }

    async setup(settings) {
        this.settings = settings;
        this.settingsSet = true;
        if (!this.settings.email) {
            this.settingsSet = false;
        }

        if (!this.settings.refresh) {
            this.settings.refresh = 10;
        }

        if (this.settingsSet) {
            this.api = new Api(this.settings.email, this.settings.key);
            this.showElement(this.elements.purgeButton);
            this.hideElement(this.elements.optionsButton);

            if (!this.settings.hidePurgeAll) {
                this.showElement(this.elements.purgeAllButton);
            }

            if (this.settings.showDevMode) {
                this.showElement(this.elements.devModeWrapper);
                const domain = await this.getCurrentDomain();
                try {
                    const zoneId = await this.api.getZoneId(domain);
                    if (zoneId) {
                        const zoneDevelopmentMode = await this.api.getZoneDevelopmentMode(zoneId);
                        if (zoneDevelopmentMode) {
                            this.elements.devMode.checked = zoneDevelopmentMode;
                        }
                    }
                } catch (error) {
                    console.log(error.message);
                }
            }
        }
    }

    async purgeButtonClick(e) {
        e.preventDefault();
        const tab = await this.utility.getCurrentTab();
        if (tab && tab.url) {
            const domain = await this.getCurrentDomain();
            try {
                const zoneId = await this.api.getZoneId(domain);
                try {
                    const rayId = await this.api.purgeCache({ files: [tab.url] }, zoneId);
                    if (rayId) {
                        await this.onPurgeSuccess();
                    }
                } catch (purgeError) {
                    this.elements.purgeButton.className = '';
                    this.elements.status.classList.add('error');
                    this.utility.setStatusMessage(this.elements.status, 'PURGE FAILED', 5000, purgeError);
                }
            } catch (error) {
                this.elements.purgeButton.className = '';
                this.elements.status.classList.add('error');
                this.utility.setStatusMessage(this.elements.status, 'PURGE FAILED', 5000, error);
            }
        }
    }

    async purgeAllClick(e) {
        e.preventDefault();
        const currentDomain = await this.getCurrentDomain();
        if (currentDomain) {
            this.showPrompt(currentDomain, async (domain) => {
                try {
                    const zoneId = await this.api.getZoneId(domain);
                    if (zoneId) {
                        try {
                            const rayId = this.api.purgeCache({ purge_everything: true }, zoneId);
                            if (rayId) {
                                await this.onPurgeSuccess();
                            }
                        } catch (error) {
                            this.elements.purgeButton.className = '';
                            this.elements.status.classList.add('error');
                            this.utility.setStatusMessage(this.elements.status, 'PURGE FAILED', 5000, error);
                        }
                    }
                } catch (zoneError) {
                    this.elements.purgeButton.className = '';
                    this.elements.status.classList.add('error');
                    this.utility.setStatusMessage(this.elements.status, 'PURGE FAILED', 5000, zoneError);
                }
            });
        }
    }

    optionsButtonClick(e) {
        e.preventDefault();
        chrome.tabs.create({ url: '/options.html' });
    }

    async getCurrentDomain() {
        const tab = await this.utility.getCurrentTab();
        if (tab && tab.url) {
            const domain = await this.utility.getDomain(tab.url);
            return domain;
        }

        return '';
    }

    hideElement(element) {
        if (element) {
            element.classList.add('hide');
        }
    }

    showElement(element) {
        if (element) {
            element.classList.remove('hide');
        }
    }

    async onPurgeSuccess() {
        this.elements.purgeButton.className = '';
        this.elements.status.classList.add('success');
        this.utility.setStatusMessage(this.elements.status, 'SUCCESS', 3000);
        if (this.elements.refresh.checked) {
            try {
                const result = await this.refreshCountdown(this.elements.subStatus, 'Refreshing in: ', parseInt(this.settings.refresh, 10));
                if (result) {
                    chrome.tabs.reload(this.currentTabId, { bypassCache: true });
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    refreshCountdown(element, message, refreshTimeout) {
        const countDownElement = element;
        let countdown = refreshTimeout;
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (countdown === 0) {
                    clearInterval(interval);
                    countDownElement.innerHTML = '';
                    resolve(true);
                } else {
                    countdown -= 1;
                    countDownElement.innerHTML = `${message} ${countdown}`;
                }
            }, 1000);
        });
    }

    showPrompt(domain, yesAction, noAction, message) {
        if (message) {
            this.elements.prompText.innerHTML = message;
        } else {
            this.elements.prompText.innerHTML = this.defaultPromptText;
        }

        this.elements.promptElement.classList.add('active');
        const onYesAction = (e) => {
            e.preventDefault();
            this.elements.promptElement.classList.remove('active');
            if (typeof yesAction === 'function') {
                yesAction(domain);
            }
            this.elements.promptYes.removeEventListener('click', onYesAction);
        };

        const onNoAction = (e) => {
            e.preventDefault();
            if (typeof noAction === 'function') {
                noAction();
            }
            this.elements.promptElement.classList.remove('active');
            this.elements.promptNo.removeEventListener('click', onNoAction);
        };

        this.elements.promptYes.addEventListener('click', onYesAction);
        this.elements.promptNo.addEventListener('click', onNoAction);
    }

    async toggleDeveloperMode(toggle) {
        const domain = await this.getCurrentDomain();
        try {
            if (domain) {
                const zoneId = await this.api.getZoneId(domain);
                this.showPrompt(domain, () => {
                    this.api.setZoneDevelopmentMode(zoneId);
                }, async () => {
                    const zoneDevelopmentMode = await this.api
                        .getZoneDevelopmentMode(zoneId, toggle);
                    this.elements.devMode.checked = zoneDevelopmentMode;
                }, 'Are you sure?');
            }
        } catch (error) {
            console.log(error);
        }
    }
}

PopUp.build();
