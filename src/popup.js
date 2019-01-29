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

import Utility from './utility.js';
import PurgeInfo from './info.js';
import Api from './api.js';

export default class PopUp {
    constructor() {
        this.utility = new Utility();
        this.purgeInfo = new PurgeInfo();
        this.currentUrl = null;
        this.currentTabId = null;
        this.promptElement = null;
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
        };

        this.hideElement(this.elements.purgeButton);
        this.hideElement(this.elements.purgeAllButton);
        this.hideElement(this.elements.devModeWrapper);
        this.showElement(this.elements.optionsButton);
        this.elements.prompText.innerHTML = this.defaultPromptText;
        this.elements.purgeAllButton.addEventListener('click', this.purgeAllClick.bind(this));
        this.elements.purgeButton.addEventListener('click', this.purgeButtonClick.bind(this));
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
        owner.settingsSet = true;
        if (!this.settings.email || this.settings.email === '') {
            this.settingsSet = false;
        }

        if (!this.settings.refresh || this.settings.refesh === '') {
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
                const tab = await this.utility.getCurrentTab();
                const domain = await this.utility.getDomain(tab.url);
                const zoneId = await this.api.getZoneId(domain);
                const zoneDevelopmentMode = await this.api.getZoneDevelopmentMode(zoneId);
                if (zoneDevelopmentMode) {
                    this.showElement(this.elements.devModeWrapper);
                    this.elements.devMode.checked = zoneDevelopmentMode;
                }
            }
        }
    }

    async purgeButtonClick(e) {
        e.preventDefault();
    }

    async purgeAllClick(e) {
        e.preventDefault();
        const tab = await this.utility.getCurrentTab();
        if (tab && tab.url) {
            const domain = await this.utility.getDomain(tab.url);
            this.purgeEntireCache(domain);
        }
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
}
/*
(function (cloudflare) {
    window.cloudFlarePurge = {
        currentUrl: null,
        currentTabId: null,
        promptElement: null,
        settings: null,
        settingsSet: false,
        defaultPromptText: "Purge entire cache?",

        init: function () {
            var owner = this;

            $("#purgeButton").hide();
            $("#purgeAllButton").hide();
            $(".dev-mode-wrapper").hide();
            $("#optionsButton").show();
            $("#prompt-text").text(this.defaultPromptText);

            this.promptElement = $("#lightbox");

            $("#purgeAllButton").on("click", function (e) {
                e.preventDefault();
                owner.purgeAllBtnClick();
            });

            $("#purgeButton").on("click", function (e) {
                e.preventDefault();
                owner.purgeBtnClick();
            });

            $("#optionsButton").on("click", function (e) {
                e.preventDefault();
                chrome.tabs.create({'url': "/options.html" } );
            });

            $("#dev-mode").on("change", function (e) {
                e.preventDefault();
                var devModeEnabled = $("#dev-mode").is(":checked");
                owner.toggleDeveloperMode(devModeEnabled);
            });

            var setSettings = function (settings) {
                owner.settings = settings;
                owner.settingsSet = true;
                if(owner.settings.email == null || owner.settings.key == null || owner.settings.key == "" || owner.settings.email == "") {
                    owner.settingsSet = false;
                }

                if (owner.settings.refresh == undefined || owner.settings.refresh == null || owner.settings.refresh == "") {
                    owner.settings.refresh = 10;
                }

                if(owner.settingsSet) {
                    $("#purgeButton").show();

                    if(!owner.settings.hidePurgeAll) {
                        $("#purgeAllButton").show();
                    }

                    $("#optionsButton").hide();

                    if (owner.settings.showDevMode === true) {
                        owner.getCurrentTab(function (tab) {
                            var domain = cloudflare.helpers.getDomain(owner.currentUrl);
                            cloudflare.api.getZoneId(
                                            domain,
                                            owner.settings.email,
                                            owner.settings.key,
                                            function(zoneId) {
                                                cloudflare.api.getZoneDevelopmentMode(zoneId,
                                                    owner.settings.email,
                                                    owner.settings.key,
                                                    function(devModeEnabled) {
                                                        $(".dev-mode-wrapper").show();
                                                        $("#dev-mode").prop("checked", devModeEnabled);
                                                    });

                                            });
                        });
                    }
                }
            };

            if (!chrome.storage) {
                browser.storage.sync.get({
                    tag: "options",
                    key: null,
                    email: null,
                    refresh: null,
                    hidePurgeAll: false,
                    showDevMode: false
                }).then(setSettings);				
            } else {
                chrome.storage.sync.get({
                    tag: "options",
                    key: null,
                    email: null,
                    refresh: null,
                    hidePurgeAll: false,
                    showDevMode: false
                }, setSettings);
            }
        },

        //Utility functions
        setStatusMessage: function (element, message, timeout, customHtml) {
            $(element).text(message);
            $(element).css("cursor", "pointer");
            $(element).on("click", function () {
                if (customHtml != null && customHtml.length > 0) {
                    var errorLog = $(element).find("#errorLog");
                    if (errorLog.length > 0) {
                        $(errorLog).remove();
                    }
                    $(element).append("<div id='errorLog'><br/>" + customHtml + "</div>");
                }
            });
            setTimeout(function () {
                $(element).text("");
            }, timeout);
        },

        refreshCountdown: function (element, message, refreshTimeout, callback) {
            var interval = setInterval(function () {
                if (refreshTimeout == 0) {
                    clearInterval(interval);
                    callback();
                    element.text("");
                    return;
                }

                refreshTimeout--;
                element.text(message + refreshTimeout);
            }, 1000);
        },

        getCurrentTab: function (callback) {
            var owner = this;
            var queryInfo = {
                active: true,
                currentWindow: true
            };

            chrome.tabs.query(queryInfo, function (tabs) {
                var tab = tabs[0];

                if (tab.url !== undefined) {
                    owner.currentUrl = tab.url.split("#")[0];
                }

                owner.currentTabId = tab.id;

                if (typeof callback === "function") {
                    callback(tab);
                }
            });
        },

        //Purge single URL
        purgeBtnClick: function () {
            var owner = this;
            this.getCurrentTab(function (tab) {
                var domain = cloudflare.helpers.getDomain(owner.currentUrl);
                cloudflare.api.getZoneId(
                                domain, 
                                owner.settings.email, 
                                owner.settings.key, 
                                function(zoneId) {
                                    owner.purgeCloudFlareUrls(zoneId, {"files": [owner.currentUrl]});
                                },
                                function (err) {
                                    $("#purgeButton").attr("class", "");
                                    $("#status").attr("class", "error");
                                    owner.setStatusMessage("#status", "PURGE FAILED", 5000, err);
                                });
            });
        },

        purgeCloudFlareUrls: function (zoneId, purgeSettings) {
            var owner = this;
            cloudflare.api.purgeCache(purgeSettings,
                zoneId,
                owner.settings.email,
                owner.settings.key,
                function (id) {
                    owner.onPurgeSuccess(id);
                },
                function (err) {
                    $("#purgeButton").attr("class", "");
                    $("#status").attr("class", "error");
                    owner.setStatusMessage("#status", "PURGE FAILED", 5000, err);
                });
        },

        //Purge entire cache
        
        promptNoClick: function (noAction) {
            if (typeof noAction === "function") {
                noAction();
            }

            this.promptElement.removeClass("active");
        },

        promptYesClick: function (domain, yesAction) {
            this.promptElement.removeClass("active");
            if (typeof yesAction === "function") {
                yesAction(domain);
            }
        },

        showPrompt: function (domain, yesAction, noAction, message) {
            if (message) {
                $("#prompt-text").text(message);
            } else {
                $("#prompt-text").text(this.defaultPromptText);
            }
            this.promptElement.addClass("active");
            var owner = this;

            $("#promptYes").on("click", function (e) {
                e.preventDefault();
                owner.promptYesClick(domain, yesAction);
            });

            $("#promptNo").on("click", function (e) {
                e.preventDefault();
                owner.promptNoClick(noAction);
            });
        },

        purgeAllBtnClick: function () {
            var owner = this;
            this.getCurrentTab(function (tab) {
                var domain = cloudflare.helpers.getDomain(owner.currentUrl);
                owner.showPrompt(domain, function(domain) {
                    owner.purgeEntireCloudflareCache(domain); 
                });
            });
        },

        toggleDeveloperMode: function(toggle) {
            var owner = this;
            this.getCurrentTab(function (tab) {
                var domain = cloudflare.helpers.getDomain(owner.currentUrl);
                owner.showPrompt(domain, function(domain) {
                    owner.developerModeApiCall(domain, toggle); 
                }, function() {
                    var domain = cloudflare.helpers.getDomain(owner.currentUrl);
                            cloudflare.api.getZoneId(
                                            domain,
                                            owner.settings.email,
                                            owner.settings.key,
                                            function(zoneId) {
                                                cloudflare.api.getZoneDevelopmentMode(zoneId,
                                                    owner.settings.email,
                                                    owner.settings.key,
                                                    function(devModeEnabled) {
                                                        $("#dev-mode").prop("checked", devModeEnabled);
                                                    });

                                            });
                }, "Are you sure?");
            })
        },

        developerModeApiCall: function(domain, isEnabled) {
            var owner = this;
            cloudflare.api.getZoneId(
                domain,
                owner.settings.email,
                owner.settings.key,
                function(zoneId) {
                    cloudflare.api.setZoneDevelopmentMode(isEnabled, 
                        zoneId, 
                        owner.settings.email, 
                        owner.settings.key,
                        function(result) {
                            $("#dev-mode").prop("checked", result);
                        });
                }
            )
        },

        purgeEntireCloudflareCache: function (domain) {
            var owner = this;
            cloudflare.api.getZoneId(
                                domain, 
                                owner.settings.email, 
                                owner.settings.key, 
                                function(zoneId) {
                                    owner.purgeCloudFlareUrls(zoneId, { "purge_everything": true });
                                },
                                function (err) {
                                    $("#purgeButton").attr("class", "");
                                    $("#status").attr("class", "error");
                                    owner.setStatusMessage("#status", "PURGE FAILED", 5000, err);
                                });
        },

        onPurgeSuccess: function (id) {
            var owner = this;
            $("#purgeButton").attr("class", "");
            $("#status").attr("class", "success");
            this.setStatusMessage("#status", "SUCCESS", 3000);
            if ($("#refresh").is(":checked")) {
                this.refreshCountdown($("#sub-status"),
                    "Refreshing in: ",
                    parseInt(owner.settings.refresh),
                    function () {
                        chrome.tabs.reload(this.currentTabId, { bypassCache: true });
                    });
            }
        }
    };

    window.cloudFlarePurge.init();
})(cloudflare);

*/
