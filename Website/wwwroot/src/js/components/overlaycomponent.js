var OverlayComponent = (function () {
    function OverlayComponent($component) {
        this.$component = $component;
        var self = this;
        $component.removeClass('hide');
        $component.addClass('fade');
        setTimeout(function () {
            self.$component.removeClass('fade');
        }, 50);
        $component.click(function (e) {
            var $target = $(e.target);
            if ($target.hasClass('overlay-wrapper')) {
            }
        });
        $component.data('component', this);
    }
    OverlayComponent.prototype.close = function () {
    };
    OverlayComponent.setTemplate = function ($template) {
        if ($template.length) {
            $template.removeClass('overlay-template');
            $template.detach();
            this.$template = $template;
        }
    };
    OverlayComponent.hasTemplate = function () {
        return this.$template != null;
    };
    OverlayComponent.$template = null;
    return OverlayComponent;
}());
//# sourceMappingURL=overlaycomponent.js.map