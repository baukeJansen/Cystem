var ParserManager;
(function (ParserManager) {
    var parser = new Map();
    function get(key) {
        return parser.get(key.toString());
    }
    ParserManager.get = get;
    function getAll() {
        return parser.getValues();
    }
    ParserManager.getAll = getAll;
    function register(key) {
        return function (ctor) {
            parser.add(key.toString(), ServiceManager.get(key));
        };
    }
    ParserManager.register = register;
})(ParserManager || (ParserManager = {}));
//# sourceMappingURL=parsermanager.js.map