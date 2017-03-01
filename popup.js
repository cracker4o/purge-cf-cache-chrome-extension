/* Copyright 2015 Tosho Toshev

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License. */

(function (cloudflare) {
	window.cloudFlarePurge = {
		currentUrl: null,
		currentTabId: null,
		promptElement: null,
		settings: null,
		settingsSet: false,

		init: function () {
			var owner = this;

			$("#purgeButton").hide();
			$("#purgeAllButton").hide();
			$("#optionsButton").show();
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

			chrome.storage.sync.get({
				tag: "options",
				key: null,
				email: null,
				refresh: null
			},
			function (settings) {
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
					$("#purgeAllButton").show();
					$("#optionsButton").hide();
				}
			});
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
				var regex = /^[a-zA-Z0-9]*\./i;
				var domain = cloudflare.helpers.getDomain(owner.currentUrl);
				var count = (domain.match(/\./g) || []).length;
				if (count > 1) {
					domain = domain.replace(domain.match(regex)[0], "");
				}

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
		
		promptNoClick: function () {
			this.promptElement.removeClass("active");
		},

		promptYesClick: function (domain, yesAction) {
			this.promptElement.removeClass("active");
			if (typeof yesAction === "function") {
				yesAction(domain);
			}
		},

		showPrompt: function (domain, yesAction) {
			this.promptElement.addClass("active");
			var owner = this;

			$("#promptYes").on("click", function (e) {
				e.preventDefault();
				owner.promptYesClick(domain, yesAction);
			});

			$("#promptNo").on("click", function (e) {
				e.preventDefault();
				owner.promptNoClick();
			});
		},

		purgeAllBtnClick: function () {
			var owner = this;
			this.getCurrentTab(function (tab) {
				var regex = /^[a-zA-Z0-9]*\./i;
				var domain = cloudflare.helpers.getDomain(owner.currentUrl);
				var count = (domain.match(/\./g) || []).length;
				if (count > 1) {
					domain = domain.replace(domain.match(regex)[0], "");
				}

				owner.showPrompt(domain, function(domain) {
					owner.purgeEntireCloudflareCache(domain); 
				});
			});
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