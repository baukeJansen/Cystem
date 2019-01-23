var ServiceManager;
(function (ServiceManager) {
    var services = new Map();
    function get(key) {
        return services.get(key.toString());
    }
    ServiceManager.get = get;
    function getAll() {
        return services.getValues();
    }
    ServiceManager.getAll = getAll;
    function register(key) {
        return function (ctor) {
            services.add(key.toString(), new ctor());
        };
    }
    ServiceManager.register = register;
})(ServiceManager || (ServiceManager = {}));
//# sourceMappingURL=servicemanager.js.map