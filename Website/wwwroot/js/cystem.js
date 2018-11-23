(function (global) {
    var Cystem = function () {
        this.hasInitialized = false;
        this.initFn = [];
    };

    Cystem.prototype.register = function (name, object, fn) {
        this[name] = object;
        this.initFn.push(fn);

        if (this.hasInitialized) {
            fn(document.body);
        }
    };

    Cystem.prototype.init = function (el) {
        this.hasInitialized = true;

        this.initFn.forEach(fn => {
            fn(el);
        });
    };

    var cystem = new Cystem();

    global.Cystem = cystem;
})(this);