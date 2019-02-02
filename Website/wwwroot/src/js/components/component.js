var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Component = (function (_super) {
    __extends(Component, _super);
    function Component($component) {
        var _this = _super.call(this, $component) || this;
        _this.$component = $component;
        return _this;
    }
    Component.prototype.getType = function () {
        return ComponentType.COMPONENT;
    };
    Component.prototype.getState = function () {
        var childstate = [];
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            childstate.push(child.getState());
        }
        return { type: this.getType(), url: this.url, components: childstate };
    };
    Component.prototype.setContent = function ($content) {
        _super.prototype.setContent.call(this, $content);
        this.url = $content.getUrl(true);
    };
    Component.prototype.setState = function (state) {
        if (this.url != state.url) {
            this.clearContent();
            var $content = $('<div class="content" data-url="' + state.url + '" data-action="' + ComponentAction.LOADSILENT + '" data-target="' + ComponentType.SELF + '"></div>');
            this.setContent($content);
            new LoadAction($content);
        }
        _super.prototype.setState.call(this, state);
    };
    return Component;
}(BaseComponent));
//# sourceMappingURL=component.js.map