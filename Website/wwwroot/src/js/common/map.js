var Map = (function () {
    function Map() {
        this.items = {};
    }
    Map.prototype.add = function (key, value) {
        this.items[key] = value;
    };
    Map.prototype.has = function (key) {
        return key in this.items;
    };
    Map.prototype.get = function (key) {
        return this.items[key];
    };
    Map.prototype.getValues = function () {
        var items = [];
        for (var item in this.items) {
            items.push(this.items[item]);
        }
        return items;
    };
    return Map;
}());
//# sourceMappingURL=map.js.map