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
	var cloudFlarePurge = {	
		currentUrl : null,
		currentTabId : null,
			
		init : function() {
			var owner = this;
			$("#purgeButton").on("click", function(e) { 
				e.preventDefault; 
				owner.purgeBtnClick(); 
			});
			
		},
		
		purgeBtnClick : function() {
			var owner = this;
			var queryInfo = {
				active : true,
				currentWindow: true	
			};
			
			chrome.tabs.query(queryInfo, function(tabs) {
				var tab = tabs[0];
				
				if(tab.url !== undefined) {
					owner.currentUrl = tab.url;	
				}
				
				owner.currentTabId = tab.id;
				var regex = /^[a-zA-Z0-9]*\./i;
				var domain = owner.getDomain(owner.currentUrl);
			    domain = domain.replace(domain.match(regex)[0], "");
			    owner.getCloudFlareZoneId(domain, $.proxy(owner.purgeCloudFlareUrls, owner));
			});
		},
		
		getCloudFlareZoneId: function(domain, callback) {
			var owner = this;
			$("#purgeButton").attr("class", "loading");
			chrome.storage.sync.get({
				tag: "options",
                key: null,
                email: null
			}, 
			
			function(settings) {
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
							callback([owner.currentUrl], data.result[0].id, settings);
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
		
		purgeCloudFlareUrls: function(urls, zoneId, settings){
			var owner = this;
			
			$.ajax({
					url: "https://api.cloudflare.com/client/v4/zones/" + zoneId + "/purge_cache",
					method: "DELETE",
					beforeSend: function(xhr) {
				        xhr.setRequestHeader('x-auth-Email', settings.email);
						xhr.setRequestHeader('x-auth-key', settings.key);
				    },
					data: JSON.stringify({
						"files": urls
					}),
					crossDomain: true,
					contentType: "application/json",
					success: function(data) {
						if(data.success == true && data.result) {
							owner.onPurgeSuccess(data.result.id);
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
		onPurgeSuccess : function(id) {
			$("#purgeButton").attr("class", "");
			$("#status").attr("class", "success");
			this.setStatusMessage("#status", "SUCCESS", 3000);
			if($("#refresh").is(":checked")) {
				chrome.tabs.reload(this.currentTabId, { bypassCache : true });	
			}		
		},
		
		setStatusMessage: function(element, message, timeout) {
			$(element).text(message);
			setTimeout(function() {
                $(element).text("");
            }, timeout);			
		},
		
		getDomain : function(url) {
			   var domain;
			    if (url.indexOf("://") > -1) {
			        domain = url.split('/')[2];
			    }
			    else {
			        domain = url.split('/')[0];
			    }
			
			    domain = domain.split(':')[0];
			
			    return domain;
		}
	};
	
	cloudFlarePurge.init();
})();