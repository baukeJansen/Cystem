jQuery.extend({
    getMainComponent: function () {
        var $main = $('.main-component');
        return $main.data('component');
    },
    getParentComponent: function (component) {
        var $parent = component.$component.parent().closest('.component-wrapper');
        if ($parent.length) {
            return $parent.data('component');
        }
        return jQuery.getMainComponent();
    },
    createOverlayComponent: function () {
        var $overlay = OverlayComponent.$template.clone();
        $('body').append($overlay);
        cystem.bindActions($overlay);
        var component = $overlay.find('.component-wrapper').data('component');
        return component;
    },
    createModalComponent: function () {
        var $modal = ModalComponent.$template.clone();
        var component = $modal.find('.component-wrapper').data('component');
        return component;
    },
    getTargetComponent: function (component, target) {
        switch (target) {
            case ComponentType.SELF: return component;
            case ComponentType.MAIN: return jQuery.getMainComponent();
            case ComponentType.PARENT: return jQuery.getParentComponent(component);
            case ComponentType.OVERLAY: return jQuery.createOverlayComponent();
            case ComponentType.MODAL: return jQuery.createModalComponent();
            default: return component;
        }
    }
});
jQuery.fn.extend({
    findComponent: function () {
        var $component = this.closest('.component-wrapper');
        var component = $component.data('component');
        var targetType = this.getTarget();
        if (targetType) {
            return $.getTargetComponent(component, targetType);
        }
        if (component.target) {
            return component.target;
        }
        return component;
    },
    getComponent: function () {
        return this.data('component');
    },
    setComponent: function (component) {
        this.data('component', component);
    },
    getOverlayComponent: function () {
        return this.closest('.overlay-wrapper').data('component');
    },
    getFormComponent: function () {
        return this.closest('form').data('component');
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
        var url;
        if (this[0].hasAttribute('href')) {
            url = this.attr('href');
        }
        else {
            url = this.data('url');
        }
        if (keepParams) {
            return url;
        }
        else {
            return url.split('?')[0];
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