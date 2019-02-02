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
var Modal = (function (_super) {
    __extends(Modal, _super);
    function Modal($component) {
        var _this = _super.call(this, $component) || this;
        _this.$component = $component;
        return _this;
    }
    Modal.prototype.getType = function () {
        return ComponentType.MODAL;
    };
    Modal.new = function () {
        var $overlay = Modal.$template.clone();
        $('body').append($overlay);
        cystem.apply($overlay);
        return $overlay.getComponent();
    };
    Modal.prototype.getState = function () {
        var childstate = [];
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            childstate.push(child.getState());
        }
        return { type: 'overlay', components: childstate };
    };
    Modal.prototype.close = function () {
        this.delete();
    };
    Modal.findTemplate = function ($el) {
        if (!this.$template) {
            var $template = $el.find('.modal-template');
            if ($template.length) {
                var component = $template.findComponent();
                this.$template = $template;
                $template.removeClass('modal-template');
                $template.detach();
                component.delete();
            }
        }
    };
    return Modal;
}(BaseComponent));
//# sourceMappingURL=modal.js.map