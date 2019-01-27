jQuery.extend({
    getMainComponent: function () {
        var $main = $('.main-component');
        return new Component($main);
    },
    getParentComponent: function () {
        var $parent = this.$component.closest('.component-wrapper');
        return new Component($parent);
    },
    getOverlayComponent: function () {
        return new OverlayComponent(null);
    },
    getModalComponent: function () {
        return new ModalComponent(null);
    },
    getTargetComponent: function (component, target) {
        switch (target) {
            case 'self': return null;
            case 'main': return jQuery.getMainComponent();
            case 'parent': return jQuery.getParentComponent(component);
            case 'overlay': return jQuery.getOverlayComponent();
            case 'modal': return jQuery.getModalComponent();
            default: return null;
        }
    }
});
jQuery.fn.extend({
    getComponent: function () {
        var $component = this.closest('.component-wrapper');
        var type = this.data('type');
        var target = this.data('target');
        switch (type) {
            case 'overlay': return new OverlayComponent($component, target);
            case 'modal': return new ModalComponent($component, target);
            default: return new Component($component, target);
        }
    },
    getTargetString: function () {
        var target = this.data('target');
        return target ? target.toLowerCase() : target;
    }
});
//# sourceMappingURL=jqextensions.js.map