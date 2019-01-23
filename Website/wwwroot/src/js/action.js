var Action = (function () {
    function Action(component, $source, method) {
        this.component = component;
        this.$source = $source;
        this.method = method;
        this._readyStack = [];
        this.actionResult = this._getActionResult($source);
        this.url = this._getUrl($source);
        this.data = this._getData($source, this.actionResult);
    }
    Action.prototype.setSource = function ($source) {
        this.$source = $source || undefined;
    };
    Action.prototype.hasSource = function () {
        return !!(this.$source && this.$source.length);
    };
    Action.prototype.onReady = function (fn) {
        this._readyStack.push(fn);
    };
    Action.prototype.ready = function () {
        this.onReady = function (fn) {
            fn();
        };
        this._readyStack.forEach(function (fn) { fn(); });
    };
    Action.prototype._getUrl = function ($el, keepParams) {
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
    Action.prototype._getData = function ($el, actionResult) {
        var url = this._getUrl($el, true).split('?');
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
    Action.prototype._getActionResult = function ($el) {
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
    return Action;
}());
//# sourceMappingURL=action.js.map