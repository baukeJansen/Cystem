var ModalComponent = (function () {
    function ModalComponent($component) {
        this.$component = $component;
        var self = this;
        $component.removeClass('hide');
        $component.addClass('fade');
        setTimeout(function () {
            self.$component.removeClass('fade');
        }, 50);
        $component.data('component', this);
    }
    ModalComponent.prototype.close = function () {
        var self = this;
        if (this.$component.hasClass('fade'))
            return;
        this.$component.addClass('fade');
        setTimeout(function () {
            self.$component.remove();
        }, 400);
    };
    ModalComponent.setTemplate = function ($template) {
        if ($template.length) {
            $template.removeClass('overlay-template');
            $template.detach();
            this.$template = $template;
        }
    };
    ModalComponent.hasTemplate = function () {
        return this.$template != null;
    };
    return ModalComponent;
}());
//# sourceMappingURL=modalcomponent.js.map