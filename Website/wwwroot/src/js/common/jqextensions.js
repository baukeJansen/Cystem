jQuery.extend({});
jQuery.fn.extend({
    findComponent: function () {
        var $component = this.parent().closest(COMPONENT_SELECTOR);
        return $component.getComponent();
    },
    getComponent: function () {
        return this.data(COMPONENT_DATA);
    },
    setComponent: function (component) {
        this.data(COMPONENT_DATA, component);
    },
    getFormComponent: function () {
        return this.closest('form').data(COMPONENT_DATA);
    },
    getAction: function () {
        var action = this.data('action');
        if (action) {
            var resultKey = action.toUpperCase();
            return ComponentAction[resultKey];
        }
        return ComponentAction.LOAD;
    },
    getType: function () {
        var type = this.data('type');
        if (type) {
            var resultKey = type.toUpperCase();
            return ComponentType[resultKey];
        }
        return ComponentType.SELF;
    },
    getTarget: function () {
        var target = this.data('target');
        if (target) {
            var resultKey = target.toUpperCase();
            return ComponentType[resultKey];
        }
        return null;
    },
    getUrl: function (keepParams) {
        if (keepParams === void 0) { keepParams = false; }
        var url = this.attr('href') || this.data('url');
        if (keepParams) {
            return url;
        }
        else {
            return url ? url.split('?')[0] : url;
        }
    },
    getData: function () {
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
//# sourceMappingURL=jqextensions.js.map