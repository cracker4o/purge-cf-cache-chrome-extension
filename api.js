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

var cloudflare = {
    helpers : {
        getDomain : function(url) {
            var domain;
            var parser = document.createElement('a');
            parser.href = url;
            domain = parser.hostname;
            var regex = /^[a-zA-Z0-9]*\./i;

            var count = (domain.match(/\./g) || []).length;
			if (count > 1) {
			    domain = domain.replace(domain.match(regex)[0], "");
			}
            
            return domain;
        }
    },
    api : {
        baseApiUrl : "https://api.cloudflare.com/client/v4/",
        
        parseError: function(cloudflareErr) {
		    var errorMessage = "";
			for(var i = 0; i < cloudflareErr.responseJSON.errors.length; i++) {
				errorMessage += cloudflareErr.responseJSON.errors[i].code + " " + cloudflareErr.responseJSON.errors[i].message + "\r\n"
			}

			return errorMessage;
		},

        getZoneId: function(domain, email, key, successCallback, failureCallback) {
            var owner = this;
            $.ajax({
                url: owner.baseApiUrl + "zones?name=" + domain + "&status=active",
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('x-auth-Email', email);
                    xhr.setRequestHeader('x-auth-key', key);
                },
                crossDomain: true,
                contentType: "application/json",
                dataType: "json"})
             .done(function(data) {
                    if(data.success == true && data.result[0]) {
                        successCallback(data.result[0].id);
                        return;
                    }
                    failureCallback("Unable to get the zone ID.");
             }).fail(function(err) {        
                    failureCallback(owner.parseError(err));					
             });       
        },

        purgeCache: function(purgeOptions, zoneId, email, key, successCallback, failureCallback) {
            var owner = this;
            $.ajax({
					url: owner.baseApiUrl +"zones/" + zoneId + "/purge_cache",
					method: "DELETE",
					beforeSend: function(xhr) {
				        xhr.setRequestHeader('x-auth-Email', email);
						xhr.setRequestHeader('x-auth-key', key);
				    },
					data: JSON.stringify(purgeOptions),
					crossDomain: true,
					contentType: "application/json",
					dataType: "json"})
            .done(function(data) {
			    if(data.success == true && data.result) {
				    successCallback(data.result.id);
                    return;
				}
                failureCallback("Unable to clear the cache.");
            }).fail(function(err) {
				failureCallback(owner.parseError(err));
			});
        }
    }
}