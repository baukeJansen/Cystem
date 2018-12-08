

(function (global, $) {
    var navigate;

    var Navigate = function () {
    };

    Navigate.prototype.init = function (target) {
        console.log(this);
    };

    navigate = new Navigate();

    x = new Navigate();
    a = function () { navigate.init.call(navigate); };
})(this, jQuery);


x.init();
a();