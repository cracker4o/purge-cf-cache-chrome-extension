(function() {
	var cloudFlarePurge = {		
		init : function() {
			var owner = this;
			$("#purgeButton").on("click", function(e) { 
				e.preventDefault; 
				owner.purgeBtnClick(); 
			});
			
		},
		
		purgeBtnClick : function() {
			chrome.tabs.getSelected(null, function(tab) {
				alert("The current url is: " + tab.url);
			});
		}
	};
	
	cloudFlarePurge.init();
})();