var LoadAction = (function () {
    function LoadAction($el, method) {
        if (method === void 0) { method = Method.GET; }
        this.$el = $el;
        var actionResult = this.getActionResult($el);
        var url = this.getUrl($el);
        var data = this.getData($el, actionResult);
        var ajax = new AjaxAction(method, url, data, actionResult);
        ajax.send(this.onResult, this);
    }
    LoadAction.prototype.onResult = function (response) {
        var component = new Component(this.$el.closest('.component-wrapper'));
        component.replace($(response));
    };
    LoadAction.prototype.getActionResult = function ($el) {
        var actionResult = ActionResult.DISPLAY;
        if ($el.length) {
            var result = $el.data('on-result');
            if (result) {
                var resultKey = result.toUpperCase();
                actionResult = ActionResult[resultKey];
            }
        }
        return actionResult;
    };
    ;
    LoadAction.prototype.getUrl = function ($el, keepParams) {
        if (keepParams === void 0) { keepParams = false; }
        var url;
        if ($el[0].hasAttribute('href')) {
            url = $el.attr('href');
        }
        else {
            url = $el.data('url');
        }
        if (keepParams) {
            return url;
        }
        else {
            return url.split('?')[0];
        }
    };
    ;
    LoadAction.prototype.getData = function ($el, actionResult) {
        var url = this.getUrl($el, true).split('?');
        var data = $el ? $el.data('params') : {};
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
    };
    ;
    return LoadAction;
}());
//# sourceMappingURL=loadaction.js.map