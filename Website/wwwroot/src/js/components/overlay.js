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
var Overlay = (function (_super) {
    __extends(Overlay, _super);
    function Overlay($component) {
        var _this = _super.call(this, $component) || this;
        _this.$component = $component;
        var self = _this;
        $component.removeClass('hide');
        $component.addClass('fade');
        setTimeout(function () {
            self.$component.removeClass('fade');
        }, 50);
        $component.click(function (e) {
            var $target = $(e.target);
            if ($target.hasClass('overlay')) {
                new CloseAction(null, self);
            }
        });
        return _this;
    }
    Overlay.new = function () {
        var $overlay = Overlay.$template.clone();
        $('body').append($overlay);
        cystem.apply($overlay);
        return $overlay.getComponent().getChildren()[0];
    };
    Overlay.prototype.getType = function () {
        return ComponentType.OVERLAY;
    };
    Overlay.prototype.getState = function () {
        var childstate = [];
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            childstate.push(child.getState());
        }
        return { type: 'overlay', components: childstate };
    };
    Overlay.prototype.close = function (silent) {
        if (silent === void 0) { silent = false; }
        var self = this;
        if (this.$component.hasClass('fade'))
            return;
        this.$component.addClass('fade');
        var mainComponent = cystem.page.getMainComponent();
        var url = mainComponent.$component.find(CONTENT_SELECTOR).getUrl();
        if (!silent) {
            var history = new HistoryAction(url);
        }
        setTimeout(function () {
            self.delete();
            HistoryAction.reloadState();
        }, 400);
    };
    Overlay.findTemplate = function ($el) {
        if (!this.$template) {
            var $template = $el.find('.overlay-template');
            if ($template.length) {
                var component = $template.findComponent();
                this.$template = $template;
                $template.removeClass('overlay-template');
                $template.detach();
                component.delete();
            }
        }
    };
    return Overlay;
}(BaseComponent));
//# sourceMappingURL=overlay.js.map