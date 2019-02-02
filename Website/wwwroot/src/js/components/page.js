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
var Page = (function (_super) {
    __extends(Page, _super);
    function Page() {
        var _this = _super.call(this, $('body')) || this;
        var self = _this;
        return _this;
    }
    Page.prototype.getType = function () {
        return ComponentType.PAGE;
    };
    Page.prototype.getState = function () {
        var childstate = [];
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            childstate.push(child.getState());
        }
        return { type: this.getType(), components: childstate };
    };
    Page.prototype.getMainComponent = function () {
        return this.mainComponent;
    };
    Page.prototype.addChild = function (component) {
        _super.prototype.addChild.call(this, component);
        var type = component.$component.getType();
        if (type == ComponentType.MAIN) {
            this.mainComponent = component;
        }
    };
    Page.prototype.findParent = function ($component) {
        return null;
    };
    return Page;
}(BaseComponent));
//# sourceMappingURL=page.js.map