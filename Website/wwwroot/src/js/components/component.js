var Component = (function () {
    function Component($component) {
        this.$component = $component;
    }
    Component.prototype.replace = function ($replace) {
        this.$component.children().replaceWith($replace);
    };
    Component.prototype.getParent = function () {
        var $parent = this.$component.closest('.component-wrapper');
        return new Component($parent);
    };
    Component.prototype.getMain = function () {
        var $main = this.$component.closest('.main-component');
        return new Component($main);
    };
    return Component;
}());
//# sourceMappingURL=component.js.map