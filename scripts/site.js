(function() {
    var elements = {
        yearElement: document.getElementById('year')
    };
    
    var operations = {
        init: function () {
            operations.setYear(elements.yearElement);
        },
        setYear: function (element) {
            element.innerHTML = new Date().getFullYear();
        }
    };
    
    operations.init();
})();