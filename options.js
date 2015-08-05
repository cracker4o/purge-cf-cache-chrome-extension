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
       var options = {
           settings: {
               tag: "options",
               key: null,
               email: null
           },
           
           init: function() {
               var owner = this;
               $("#save").on("click", function(e) {
                   e.preventDefault();
                   owner.saveClick();                
               });
               
               this.restoreOptions();
           },
           
           saveClick: function() {
               var key = $("#key").val();
               var email = $("#email").val();
               
               if(key === "" || email ==="") {
                   return;
               }
               
               this.settings = {
                 key: key,
                 email: email  
               };
               
               chrome.storage.sync.set(this.settings, function() {
                    $("#status").text("Options saved.");
                    setTimeout(function() {
                        $('#status').text("");
                    }, 1500);
               });
           },
           
           restoreOptions: function() {
               chrome.storage.sync.get(this.settings, function(items) {
                   $("#key").val(items.key);
                   $("#email").val(items.email);
               });
           }                          
       };
       
       options.init();
   })();