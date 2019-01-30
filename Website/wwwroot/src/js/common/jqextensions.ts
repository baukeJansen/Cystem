interface JQueryStatic {
    getMainComponent(): Component;
    getParentComponent(component: Component): Component;
    createOverlayComponent(): Component;
    createModalComponent(): Component;
    getTargetComponent(component: Component, target: ComponentType): Component;
}

jQuery.extend({
    getMainComponent: function (): Component {
        var $main: JQuery = $('.main-component');
        return $main.data('component');
    },

    getParentComponent: function (component: Component): Component {
        var $parent: JQuery = component.$component.parent().closest('.component-wrapper');

        if ($parent.length) {
            return $parent.data('component');
        }

        return jQuery.getMainComponent();
    },

    createOverlayComponent: function (): Component {
        var $overlay: JQuery = OverlayComponent.$template.clone();
        $('body').append($overlay);

        cystem.bindActions($overlay);

        var component: Component = $overlay.find('.component-wrapper').data('component');
        return component;
    },

    createModalComponent: function (): Component {
        var $modal: JQuery = ModalComponent.$template.clone();

        var component: Component = $modal.find('.component-wrapper').data('component');
        return component;
    },

    getTargetComponent: function (component: Component, target: ComponentType): Component {
        switch (target) {
            case ComponentType.SELF: return component;
            case ComponentType.MAIN: return jQuery.getMainComponent();
            case ComponentType.PARENT: return jQuery.getParentComponent(component);
            case ComponentType.OVERLAY: return jQuery.createOverlayComponent();
            case ComponentType.MODAL: return jQuery.createModalComponent();
            default: return component;
        }
    }
})

interface JQuery {
    findComponent(): Component;
    getComponent(): IComponent;
    setComponent(component: IComponent): void;
    getOverlayComponent(): OverlayComponent;
    getFormComponent(): FormComponent;
    getAction(): ComponentAction;
    getType(): ComponentType;
    getTarget(): ComponentType;
    getUrl(keepParams?: boolean): string;
    getData(): object;
}

jQuery.fn.extend({
    findComponent: function (): Component {
        var $component: JQuery = this.closest('.component-wrapper');
        var component: Component = $component.data('component');

        var targetType: ComponentType = this.getTarget();
        if (targetType) {
            return $.getTargetComponent(component, targetType);
        }

        if (component.target) {
            return component.target;
        }

        return component;

        /*var target: ComponentType = this.getTarget() || $component.getTarget();
        switch (target) {
            case ComponentType.MAIN: return jQuery.getMainComponent();
            case ComponentType.OVERLAY: return new OverlayComponent(null);
            case ComponentType.MODAL: return new ModalComponent(null);
        }

        var type: ComponentType = this.getType();
        var component: Component;
        switch (type) {
            case ComponentType.OVERLAY: component = new OverlayComponent($component);
            case ComponentType.MODAL: component = new ModalComponent($component);
            default: component = new Component($component);
        }

        switch (target) {
            case ComponentType.PARENT: return jQuery.getParentComponent(component);
            default: return component;
        }*/
    },

    getComponent: function (): IComponent {
        return this.data('component');
    },

    setComponent: function (component: IComponent) {
        this.data('component', component);
    },

    getOverlayComponent: function (): OverlayComponent {
        return this.closest('.overlay-wrapper').data('component');
    },

    getFormComponent: function (): FormComponent {
        return this.closest('form').data('component');
    },

    getAction: function(): ComponentAction {
        var action: string = this.data('action');

        if (action) {
            var resultKey = action.toUpperCase() as keyof typeof ComponentAction;
            return ComponentAction[resultKey];
        }

        return ComponentAction.LOAD;
    },

    getType: function (): ComponentType {
        var type: string = this.data('type');

        if (type) {
            var resultKey = type.toUpperCase() as keyof typeof ComponentType;
            return ComponentType[resultKey];
        }

        return ComponentType.SELF;
    },

    getTarget: function(): ComponentType {
        var target: string = this.data('target');

        if (target) {
            var resultKey = target.toUpperCase() as keyof typeof ComponentType;
            return ComponentType[resultKey];
        }

        return null;
    },

    getUrl(keepParams: boolean = false): string {
        var url;
        if (this[0].hasAttribute('href')) {
            url = this.attr('href');
        } else {
            url = this.data('url');
        }

        if (keepParams) {
            return url;
        } else {
            return url.split('?')[0];
        }
    },

    getData(): object {
        var url = this.getUrl(true).split('?');
        var data = this ? this.data('params') : {};
        data = data || {};

        if (url.length > 1) {
            var paramString = url[1];
            var params = paramString.split('&');

            $.each(params, function (_, param) {
                var keyValuePair = param.split('=');

                if (keyValuePair.length === 2) {
                    data[keyValuePair[0]] = keyValuePair[1];
                }
            });
        }

        data.CurrentLayout = $("#Layout").val();
        data.Layout = "AjaxLayout";

        return data;
    }
})