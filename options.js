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
   
   (function(cloudflareApi) {
       var options = {
           settings: {
               tag: "options",
               key: null,
               email: null,
               refresh: null
           },
           
           init: function() {
               var owner = this;
               $("#save").on("click", function(e) {
                   e.preventDefault();
                   owner.saveClick();                
               });

               $("#custom-purge").on("click", function(e) {
                   e.preventDefault();
                   owner.customPurgeClick();
               })
               
               this.restoreOptions();
           },

           setStatusMessage: function(element, message, timeout) {
			    $(element).text(message);
			    $(element).css("cursor", "pointer");
                $(element).css("margin-top", "10px");
			    
                setTimeout(function() {
                    $(element).text("");
                }, timeout);			
		   },
           
           saveClick: function() {
               var key = $("#key").val();
               var email = $("#email").val();
               var refresh = $("#refresh").val();
               
               if(key === "" || email ==="" || refresh ==="") {
                   return;
               }
               
               this.settings = {
                 key: key,
                 email: email,
                 refresh: refresh  
               };
               
               chrome.storage.sync.set(this.settings, function() {
                    $("#status").text("Options saved.");

                    if($("#key").val() != "" && $("#email").val() != "") {
                        $("#custom-purge-group").show();
                    } else {
                        $("#custom-purge-group").hide();
                    }

                    setTimeout(function() {
                        $('#status').text("");
                    }, 1500);
               });
           },

           customPurgeClick: function() {
               var url = $("#custom-url").val();
               var key = $("#key").val();
               var email = $("#email").val();
               var domain = "";

               if(url === "") {
                   return;
               }

               var urls = url.indexOf(',') >= 0 ? url.split(',') : [url];
               
               for(var i = 0; i < urls.length; i++) {
                   urls[i] = urls[i].trim();
                   var regex = new RegExp(/^https?:\/\/.*/g);
                   if(urls[i].match(regex) == null) {
                       options.setStatusMessage("#purge-status", "URL validation error - " + urls[i], 3000);
                       return;
                   }

                    var tmpDomain = cloudflareApi.helpers.getDomain(urls[i]);
                    if(tmpDomain === "") {
                        options.setStatusMessage("#purge-status", "Could not determine the domain for url: " + urls[i], 3000);
                        return;
                    }

                    if(domain === "") {
                        domain = tmpDomain;
                    } else if (domain !== tmpDomain) {
                        options.setStatusMessage("#purge-status", "All urls should be under the same domain.", 3000);
                        return;
                    }
               } 

               cloudflareApi.api.getZoneId(domain, email, key, function(zoneId) {
                   cloudflareApi.api.purgeCache({ "files": urls }, zoneId, email, key, function(purgeSuccessId) {
                       options.setStatusMessage("#purge-status", "PURGE SUCESSFUL - Purge vector: " + purgeSuccessId, 3000)
                   }, function(errorMessage) {
                       options.setStatusMessage("#purge-status", errorMessage, 3000)
                   });
               }, function(errorMessage) {
                   options.setStatusMessage("#purge-status", errorMessage, 3000)
               });
           },
           
           restoreOptions: function() {
               chrome.storage.sync.get(this.settings, function(items) {
                   $("#key").val(items.key);
                   $("#email").val(items.email);
                   
                   if(items.refresh != null && items.refresh !== undefined) {
                       $("#refresh").val(items.refresh);    
                   } else {
                       $("#refresh").val(10);
                   }

                   if(items.key != null && items.key !== "" && items.email != null && items.email !== "") {
                       $("#custom-purge-group").show();
                   } else {
                       $("#custom-purge-group").hide();
                   }
                   
               });
           }                          
       };
       
       options.init();
   })(cloudflare);