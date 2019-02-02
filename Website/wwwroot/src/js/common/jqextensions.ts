interface JQueryStatic {
}

jQuery.extend({

});

interface JQuery {
    findComponent(): IComponent;
    getComponent(): IComponent;
    setComponent(component: IComponent): void;
    getFormComponent(): FormComponent;
    getAction(): ComponentAction;
    getType(): ComponentType;
    getTarget(): ComponentType;
    getUrl(keepParams?: boolean): string;
    getData(): object;
}

jQuery.fn.extend({
    findComponent: function (): IComponent {
        var $component: JQuery = this.parent().closest(COMPONENT_SELECTOR);
        return $component.getComponent();
    },

    getComponent: function (): IComponent {
        return this.data(COMPONENT_DATA);
    },

    setComponent: function (component: IComponent) {
        this.data(COMPONENT_DATA, component);
    },

    getFormComponent: function (): FormComponent {
        return this.closest('form').data(COMPONENT_DATA);
    },

    getAction: function (): ComponentAction {
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

    getTarget: function (): ComponentType {
        var target: string = this.data('target');

        if (target) {
            var resultKey = target.toUpperCase() as keyof typeof ComponentType;
            return ComponentType[resultKey];
        }

        return null;
    },

    getUrl(keepParams: boolean = false): string {
        var url = this.attr('href') || this.data('url');

        if (keepParams) {
            return url;
        } else {
            return url ? url.split('?')[0] : url;
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
});