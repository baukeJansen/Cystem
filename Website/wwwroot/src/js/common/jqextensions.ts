interface JQueryStatic {
    getTargetComponent(component: Component, actionTarget: string): Component;
    getMainComponent(): Component;
    getParentComponent(component: Component): Component;
    getOverlayComponent(): Component;
    getModalComponent(): Component;
}

jQuery.extend({
    getMainComponent: function (): Component {
        var $main: JQuery = $('.main-component');
        return new Component($main);
    },

    getParentComponent: function (): Component {
        var $parent: JQuery = this.$component.closest('.component-wrapper');
        return new Component($parent);
    },

    getOverlayComponent: function (): Component {
        return new OverlayComponent(null);
    },

    getModalComponent: function (): Component {
        return new ModalComponent(null);
    },

    getTargetComponent: function (component: Component, target: string): Component {
        switch (target) {
            case 'self': return null;
            case 'main': return jQuery.getMainComponent();
            case 'parent': return jQuery.getParentComponent(component);
            case 'overlay': return jQuery.getOverlayComponent();
            case 'modal': return jQuery.getModalComponent();
            default: return null;
        }
    }
})

interface JQuery {
    getComponent(): Component;
    getTargetString(): string;
}

jQuery.fn.extend({
    getComponent: function (): Component {
        var $component: JQuery = this.closest('.component-wrapper')

        var type = this.data('type');
        var target = this.data('target');

        switch (type) {
            case 'overlay': return new OverlayComponent($component, target);
            case 'modal': return new ModalComponent($component, target);
            default: return new Component($component, target);
        }
    },

    getTargetString: function (): string {
        var target: string = this.data('target');
        return target ? target.toLowerCase() : target;
    }
})