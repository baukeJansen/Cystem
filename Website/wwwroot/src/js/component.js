var Component = (function () {
    function Component(parent, $component) {
        this.parent = parent;
        this.$component = $component;
        this.children = [];
        $component.children().iterate(this);
    }
    Component.prototype.addChild = function (child) {
        this.children.push(child);
    };
    Component.prototype.parse = function (el) {
        var parsers = ParserManager.getAll();
        for (var i = 0; i < parsers.length; i++) {
            var parser = parsers[i];
            parser.parse(this, el);
        }
    };
    Component.prototype.setContent = function (content) {
        var $content = $(content);
        this.$component.empty();
        this.$component.append($content);
        this.parse($content[0]);
    };
    return Component;
}());
//# sourceMappingURL=component.js.map