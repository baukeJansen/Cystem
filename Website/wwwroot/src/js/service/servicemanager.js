var ServiceManager = (function () {
    function ServiceManager() {
        this._services = [];
    }
    ServiceManager.prototype.register = function (r) {
        var registerable = new r(this);
        this._services[registerable.Name] = registerable;
    };
    ServiceManager.prototype.get = function (r) {
        var registerable = new r();
        var o = this._services[registerable.Name];
        return o;
    };
    ServiceManager.prototype.getServices = function () {
        return this._services;
    };
    ServiceManager.prototype.init = function () {
        for (var _i = 0, _a = this._services; _i < _a.length; _i++) {
            var service = _a[_i];
            service.construct(this);
        }
    };
    return ServiceManager;
}());
var serviceManager = new ServiceManager();
serviceManager.register(Cystem);
serviceManager.register(Navigate);
serviceManager.register(OverlayHelper);
serviceManager.register(ModalHelper);
serviceManager.register(Materialize);
serviceManager.register(Graph);
serviceManager.register(Formtab);
serviceManager.register(FloatingActionButton);
serviceManager.init();
var cystem = serviceManager.get(Cystem);
cystem.bindNew(document.body);
//# sourceMappingURL=servicemanager.js.map