jQuery.fn.extend({
    link: function (method) {
        return this.click(function () {
        });
    },
    load: function (method) {
        return this.each(function (_, el) {
        });
    },
    ajax: function (action) {
        return this.each(function () {
            $.ajax({
                method: action.method,
                url: action.url,
                data: action.data,
                mimeType: 'text/html'
            }).done(function (response, status, xhr) {
                switch (xhr.status) {
                    case 200:
                        action.response = response;
                        break;
                    case 205:
                        action.data.Layout = "None";
                        window.location.href = action.url;
                        break;
                    default:
                        console.log('unknown status: ', xhr.status);
                        break;
                }
            }).fail(function (error) {
                var $content = $('<div class="content error-modal"></div>');
                var $iframe = $('<iframe>');
                setTimeout(function () {
                    var iframe = $iframe[0];
                    var $iframeContent = $('body', iframe.contentWindow.document);
                    $iframeContent.html(error.responseText);
                }, 1);
            });
        });
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
        var data = this.data('params');
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
    },
    getActionResult: function () {
        var actionResult = ActionResult.LOAD;
        if (this.length) {
            var result = this.data('on-result');
            if (result) {
                var resultKey = result.toUpperCase();
                actionResult = ActionResult[resultKey];
            }
        }
        return actionResult;
    }
});
var Navigate = (function () {
    function Navigate() {
        this.Name = Service.Navigate;
        this._currentUrl = '';
        var self = this;
        window.onpopstate = function (e) { self.onPopState.call(self, e); };
    }
    Navigate.prototype.bind = function () {
    };
    ;
    Navigate.prototype.reload = function ($content) {
        this._action(null, Method.GET, $content);
    };
    ;
    Navigate.prototype._action = function (event, method, $el) {
        var actionResult = this._getActionResult($el);
        var url = this._getUrl($el);
        var data = this._getData($el, actionResult);
        return false;
    };
    ;
    Navigate.prototype._submit = function (event, $el) {
        var self = this;
        var $form = $el.closest('form');
        var $method = $('form').find('#zmethod');
        var method;
        console.log($method);
        if ($method.length) {
            method = $method.attr('value').toLowerCase();
        }
        else {
            method = $form.attr('method').toLowerCase();
        }
        console.log(method);
        var url = $form.attr('action');
        var data = $form.serialize();
        var actionResult = this._getActionResult($el);
        return false;
    };
    ;
    Navigate.prototype.onPopState = function (event) {
        var url = document.location.href;
        var state = event.state || {};
        var data = {
            CurrentLayout: $("#Layout").val(),
            Layout: "AjaxLayout"
        };
        console.log(this._currentUrl, url);
    };
    ;
    Navigate.prototype._exec = function (action) {
        var self = this;
        $.ajax({
            method: action.method,
            url: action.url,
            data: action.data,
            mimeType: 'text/html'
        }).done(function (response, status, xhr) {
            switch (xhr.status) {
                case 200:
                    action.response = response;
                    self._done.call(self, action);
                    break;
                case 205:
                    action.data.Layout = "None";
                    window.location.href = action.url;
                    break;
                default:
                    console.log('unknown status: ', xhr.status);
                    break;
            }
        }).fail(function (error) {
            var $content = $('<div class="content error-modal"></div>');
            var $iframe = $('<iframe>');
            setTimeout(function () {
                var iframe = $iframe[0];
                var $iframeContent = $('body', iframe.contentWindow.document);
                $iframeContent.html(error.responseText);
            }, 1);
        });
    };
    ;
    Navigate.prototype._done = function (action) {
        switch (action.actionResult) {
            case ActionResult.DISPLAY:
            case ActionResult.LOAD:
            case ActionResult.RELOAD:
                break;
            case ActionResult.OVERLAY:
                this._setOverlay(action);
                break;
            case ActionResult.MODAL:
                this._setModal(action);
                break;
            case ActionResult.CLOSE:
                this._close(action);
                break;
            case ActionResult.NONE:
                break;
        }
    };
    ;
    Navigate.prototype._setOverlay = function (action) {
    };
    ;
    Navigate.prototype._setModal = function (action) {
    };
    ;
    Navigate.prototype._close = function (action) {
    };
    ;
    Navigate.prototype._getActionResult = function ($el) {
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
    Navigate.prototype._getUrl = function ($el, keepParams) {
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
    Navigate.prototype._getData = function ($el, actionResult) {
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
    ;
    Navigate.prototype._createUrl = function (url, data) {
        var params = "";
        for (var key in data) {
            params += params === "" ? "?" : "&";
            params += key + "=" + encodeURIComponent(data[key]);
        }
        return url + params;
    };
    ;
    return Navigate;
}());
//# sourceMappingURL=navigate.js.map