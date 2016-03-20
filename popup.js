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
   
(function() {
	window.cloudFlarePurge = {	
		currentUrl : null,
		currentTabId : null,
		promptElement : null,
			
		init : function() {
			var owner = this;
			
			this.promptElement = $("#lightbox");
			
			$("#purgeAllButton").on("click", function(e) {
				e.preventDefault();	
				owner.purgeAllBtnClick();
			});
			
			$("#purgeButton").on("click", function(e) { 
				e.preventDefault(); 
				owner.purgeBtnClick(); 
			});	
		},
		
		promptNoClick: function() {
			this.promptElement.removeClass("active");
		},
		
		promptYesClick: function(yesAction, settings) {
			this.promptElement.removeClass("active");
			if(typeof yesAction === "function") {
				yesAction(settings.domain, settings.callback);	
			}			
		},
		
		showPrompt: function(yesAction, settings) {
			this.promptElement.addClass("active");
			var owner = this;
			
			$("#promptYes").on("click", function(e) {
				e.preventDefault();
				owner.promptYesClick(yesAction, settings); 
			});
			
			$("#promptNo").on("click", function(e) {
				e.preventDefault();
				owner.promptNoClick(); 
			});			
		},
		
		purgeAllBtnClick: function() {
			var owner = this;			
			this.getCurrentTab(function(tab) {
				var regex = /^[a-zA-Z0-9]*\./i;
				var domain = owner.getDomain(owner.currentUrl);
			    domain = domain.replace(domain.match(regex)[0], "");
				
				var settings = { domain : domain, 
						         callback : $.proxy(owner.purgeEntireCloudflareCache, owner)
				};
				
				owner.showPrompt($.proxy(owner.getCloudFlareZoneId, owner), settings);
			});
		},
		
		purgeBtnClick: function() {
			var owner = this;			
			this.getCurrentTab(function(tab) {
				var regex = /^[a-zA-Z0-9]*\./i;
				var domain = owner.getDomain(owner.currentUrl);
                var count = (domain.match(/\./g) || []).length;
                if(count > 1) {
                    domain = domain.replace(domain.match(regex)[0], "");    
                }
                
			    owner.getCloudFlareZoneId(domain, $.proxy(owner.purgeCloudFlareUrls, owner));				
			});
		},
		
		getCurrentTab: function(callback) {
			var owner = this;
			var queryInfo = {
				active : true,
				currentWindow: true	
			};
			
			chrome.tabs.query(queryInfo, function(tabs) {
				var tab = tabs[0];
				
				if(tab.url !== undefined) {
					owner.currentUrl = tab.url.split("#")[0];
				}	
				
				owner.currentTabId = tab.id;
				
				if(typeof callback === "function") {
					callback(tab);	
				}
			});
		},
		
		getCloudFlareZoneId: function(domain, callback) {
			var owner = this;
			$("#purgeButton").attr("class", "loading");
			chrome.storage.sync.get({
				tag: "options",
                key: null,
                email: null,
				refresh: null
			}, 
			
			function(settings) {
				if(settings.refresh == undefined || settings.refresh == null || settings.refresh == "") {
					settings.refresh = 10;	
				}
				
            	$.ajax({
					url: "https://api.cloudflare.com/client/v4/zones?name=" + domain + "&status=active",
					beforeSend: function(xhr) {
				        xhr.setRequestHeader('x-auth-Email', settings.email);
						xhr.setRequestHeader('x-auth-key', settings.key);
				    },
					crossDomain: true,
					contentType: "application/json",
					dataType: "json",
					success: function(data) {
						if(data.success == true && data.result[0]) {
							callback(data.result[0].id, settings);
							return;	
						}
						
						$("#purgeButton").attr("class", "");
						$("#status").attr("class", "error");
						owner.setStatusMessage("#status", "PURGE FAILED", 3000);
					},
					error: function(err) {
						$("#purgeButton").attr("class", "");
						$("#status").attr("class", "error");
						owner.setStatusMessage("#status", "PURGE FAILED", 3000);					
					}
				});       
			});
		},
		
		purgeCloudFlareUrls: function(zoneId, settings) {
			var urls = [this.currentUrl];
			this.cloudFlareApiPurgeCache({ "files": urls }, zoneId, settings);
		},
		
		purgeEntireCloudflareCache: function(zoneId, settings) {
			this.cloudFlareApiPurgeCache({ "purge_everything": true }, zoneId, settings);
		},
		
		cloudFlareApiPurgeCache: function(data, zoneId, settings) {
			var owner = this;
			$.ajax({
					url: "https://api.cloudflare.com/client/v4/zones/" + zoneId + "/purge_cache",
					method: "DELETE",
					beforeSend: function(xhr) {
				        xhr.setRequestHeader('x-auth-Email', settings.email);
						xhr.setRequestHeader('x-auth-key', settings.key);
				    },
					data: JSON.stringify(data),
					crossDomain: true,
					contentType: "application/json",
					dataType: "json",
					success: function(data) {
						if(data.success == true && data.result) {
							owner.onPurgeSuccess(data.result.id, settings);
							return;
						}
						
						$("#purgeButton").attr("class", "");
						$("#status").attr("class", "error");
						owner.setStatusMessage("#status", "PURGE FAILED", 3000);
					},
					error: function(err) {
						$("#purgeButton").attr("class", "");
						$("#status").attr("class", "error");
						owner.setStatusMessage("#status", "PURGE FAILED", 3000);
					}
			});				
		},
		
		onPurgeSuccess : function(id, settings) {
			$("#purgeButton").attr("class", "");
			$("#status").attr("class", "success");
			this.setStatusMessage("#status", "SUCCESS", 3000);
			if($("#refresh").is(":checked")) {
				this.refreshCountdown($("#sub-status"), "Refreshing in: ", parseInt(settings.refresh), 
				function() {
					chrome.tabs.reload(this.currentTabId, { bypassCache : true });
				});					
			}		
		},
		
		setStatusMessage: function(element, message, timeout) {
			$(element).text(message);
			setTimeout(function() {
                $(element).text("");
            }, timeout);			
		},
		
		refreshCountdown: function(element, message, refreshTimeout, callback) {
			var interval = setInterval(function() {
				if(refreshTimeout == 0) {
					clearInterval(interval);
					callback();
					element.text("");
					return;
				}
				
				refreshTimeout--;
				element.text(message + refreshTimeout);
			}, 1000);
		},
		
		getDomain : function(url) {
			var domain;
			var parser = document.createElement('a');
			parser.href = url;
			domain = parser.hostname;

			return domain;
		}
	};
	
	window.cloudFlarePurge.init();
})();