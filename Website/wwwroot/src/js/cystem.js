var Cystem = (function () {
    function Cystem() {
        this.Name = ServiceName.Cystem;
    }
    Cystem.prototype.construct = function (serviceManager) {
        this._serviceManager = serviceManager;
    };
    Cystem.prototype.bindNew = function (el) {
        var services = this._serviceManager.getServices();
        for (var _i = 0, services_1 = services; _i < services_1.length; _i++) {
            var service = services_1[_i];
            service.bind(el);
        }
    };
    Cystem.prototype.bind = function (el) {
    };
    return Cystem;
}());
//# sourceMappingURL=cystem.js.map