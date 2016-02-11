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
    var info = {
        stats : {
          serverLocation : null,
          ray : null,
          status : null,
          cacheControl : null
        },
        
        airports : {
            "AKL": "Auckland, NZ",
            "AMS": "Amsterdam, NL",
            "ARN": "Stockholm, SE",
            "ATL": "Atlanta, US",
            "BOM": "Mumbai, IN",
            "CAN": "Guangzhou, CN",
            "CDG": "Paris, FR",
            "CPH": "Copenhagen, DK",
            "CTU": "Chengdu, CN",
            "DEL": "New Delhi, CN",
            "DFW": "Dallas, US",
            "DOH": "Doha, QA",
            "DUB": "Dublin, IE",
            "DUS": "Dusseldorf, DE",
            "DXB": "Dubai, AE",
            "EWR": "Newark, US",
            "EZE": "Buenos Aires, AR",
            "FOC": "Fuzhou, CN",
            "FRA": "Frankfurt, DE",
            "GRU": "São Paulo, BR",
            "HGH": "Hangzhou, CN",
            "HKG": "Hong Kong, HK",
            "HNY": "Hengyang, CN",
            "IAD": "Ashburn, US",
            "ICN": "Seoul, KR",
            "JNB": "Johannesburg, ZA",
            "JYG": "Jiaxing, CN",
            "KIX": "Osaka, JP",
            "KUL": "Kuala Lumpur, MY",
            "KWI": "Kuwait City, KW",
            "LAX": "Los Angeles, US",
            "LHR": "London, GB",
            "LIM": "Lima, PE",
            "LYA": "Luoyang, CN",
            "MAA": "Chennai, IN",
            "MAD": "Madrid, ES",
            "MAN": "Manchester, GB",
            "MBA": "Mombasa, KE",
            "MCT": "Muscat, OM",
            "MDE": "Medellín, CO",
            "MIA": "Miami, US",
            "MLE": "Melbourne, AU",
            "MRS": "Marseille, FR",
            "MXP": "Milan, IT",
            "NAY": "Langfang, CN",
            "NRT": "Tokyo, JP",
            "ORD": "Chicago, US",
            "OTP": "Bucharest, RO",
            "PHX": "Phoenix, US",
            "PDX": "Portland, US",
            "PRG": "Prague, CZ",
            "SCL": "Valparaíso, CL",
            "SEA": "Seattle, US",
            "SFO": "San Francisco, US",
            "SHE": "Shenyang, CN",
            "SIN": "Singapore, SG",
            "SJC": "San Jose, US",
            "SYD": "Sydney, AU",
            "SZX": "Dongguan, CN",
            "TAO": "Qingdao, CN",
            "TSN": "Tianjin, CN",
            "TXL": "Berlin, DE",
            "VIE": "Vienna, IT",
            "WAW": "Warsaw, PL",
            "XIY": "Xi'an, CN",
            "YUL": "Montreal, CA",
            "YVR": "Vancouver, CA",
            "YYZ": "Toronto, CA",
            "ZRH": "Zurich, CH"  
        },
        
        elements : {
            infoBtn : $("#infoBtn"),
            details : $("#details")
        },
        
        init : function() {
            this.elements.infoBtn.on("click", $.proxy(this.getUrl, this));
        },
        
        getUrl : function(e) {
            e.preventDefault();
            var owner = this;
            owner.elements.details.attr("class", "");
            owner.elements.details.html("");
            window.cloudFlarePurge.getCurrentTab(function(tab) {
				if(tab.url === undefined) 
                    return;
                    
                $.ajax({
                    url: tab.url,
                    type: "GET",
                    success:function(data, textStatus, request) {
                        var cfRay = request.getResponseHeader("cf-ray");
                        var cacheStatus = request.getResponseHeader("cf-cache-status");
                        var cacheControl = request.getResponseHeader("cache-control");
                        
                        if(cfRay == null || cacheStatus == null) {
                          $("#purgeButton").attr("class", "");
						  $("#status").attr("class", "error");
						  window.cloudFlarePurge.setStatusMessage("#status", "NO INFO AVAILABLE", 3000);
                          return;
                        }
                        
                        owner.stats.ray = cfRay.split("-")[0];
                        owner.stats.serverLocation = owner.airports[cfRay.split("-")[1]];
                        owner.stats.status = cacheStatus;
                        owner.stats.cacheControl = cacheControl;
                        
                        if(owner.stats.ray != null) {
                            owner.elements.details.addClass("active");
                            owner.elements.details.html("Node Location: "+ owner.stats.serverLocation +"                       <br/>" +
                                            "Ray: "+ owner.stats.ray +" <br/>" +
                                            "Status: "+ owner.stats.status +" <br/>" +
                                            "Cache control: "+ owner.stats.cacheControl +" <br/>");
                        }
                        
                    },
                    error: function(request, textStatus, errorThrown) {
                        $("#purgeButton").attr("class", "");
						$("#status").attr("class", "error");
						window.cloudFlarePurge.setStatusMessage("#status", "NO INFO AVAILABLE", 3000);
                    }
                });
			});
        }
    };
    
    info.init();
})();