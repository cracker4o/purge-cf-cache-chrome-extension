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
			
		init : function() {
			var owner = this;
			$("#purgeButton").on("click", function(e) { 
				e.preventDefault; 
				owner.purgeBtnClick(); 
			});
			
		},
		
		purgeBtnClick : function() {
			var owner = this;
			chrome.tabs.getSelected(null, function(tab) {
				owner.currentUrl = tab.url;
				var domain = owner.getDomain(tab.url).replace("www.", "");
			    owner.getCloudFlareZoneId(domain, owner.purgeCloudFlareUrls)
			});
		},
		
		getCloudFlareZoneId: function(domain, callback) {
			var owner = this;
			chrome.storage.sync.get({
				tag: "options",
                key: null,
                email: null
			}, 
			
			function(items) {
            	$.ajax({
					url: "https://api.cloudflare.com/client/v4/zones?name=" + domain + "&status=active",
					headers: {
						"X-Auth-Email" : items.email,
	                    "X-Auth-Key" : items.key
					},
					dataType : "json",
					success: function(data) {
						callback([owner.currentUrl], data.result[0].id)
					},
					error: function(err) {
						
					}
				});       
			});
		},
		
		purgeCloudFlareUrls: function(urls, zoneId){
			alert(urls);
			alert(zoneId);
		},
		
		getDomain(url) {
			   var domain;
			    if (url.indexOf("://") > -1) {
			        domain = url.split('/')[2];
			    }
			    else {
			        domain = url.split('/')[0];
			    }
			
			    domain = domain.split(':')[0];
			
			    return domain;
		},
		
		
	};
	
	cloudFlarePurge.init();
})();