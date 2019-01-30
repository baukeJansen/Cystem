var Navigate = (function () {
    function Navigate() {
        this._currentUrl = '';
    }
    Navigate.prototype.bind = function (el) {
        var self = this;
        var $el = $(el);
        $el.find('.ajax-get').click(function (e) { return self._action.call(self, e, Method.GET, $(this)); });
        $el.find('.ajax-post').click(function (e) { return self._action.call(self, e, Method.POST, $(this)); });
        $el.find('.ajax-put').click(function (e) { return self._action.call(self, e, Method.PUT, $(this)); });
        $el.find('.ajax-delete').click(function (e) { return self._action.call(self, e, Method.DELETE, $(this)); });
        $el.find('.ajax-submit').click(function (e) { return self._submit.call(self, e, $(this)); });
        $el.find('.ajax-load').each(function (i, el) { self._action.call(self, null, Method.GET, $(el)); });
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
        var action = new Action(method, url, data, $el, actionResult);
        this._exec(action);
        return false;
    };
    ;
    Navigate.prototype._submit = function (event, $el) {
        var self = this;
        var $form = $el.closest('form');
        var method = $form.attr('method').toLowerCase();
        var url = $form.attr('action');
        var data = $form.serialize();
        var actionResult = this._getActionResult($el);
        var action = new Action(method, url, data, $el, actionResult);
        this._exec(action);
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
        var action = new Action(Method.POPSTATE, url, data, undefined, state.actionResult || ComponentAction.LOAD);
        this._exec(action);
    };
    ;
    Navigate.prototype._exec = function (action) {
        var self = this;
        this._beforeSend(action);
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
            var $popup = $('<div class="popup error"></div>');
            var $wrapper = $('<div class="wrapper"></div>');
            var $closeButton = $('<div class="close">x</div>');
            var $iframe = $('<iframe>');
            $wrapper.append($closeButton);
            $wrapper.append($iframe);
            $popup.append($wrapper);
            $('body').append($popup);
            setTimeout(function () {
                var iframe = $iframe[0];
                var doc = iframe.contentWindow.document;
                var $iframeBody = $('body', doc);
                $iframeBody.html(error.responseText);
                $closeButton.click(function () { $popup.remove(); });
            }, 1);
        });
    };
    ;
    Navigate.prototype._beforeSend = function (action) {
        var $target = action.$target;
        var $oldContent = action.$oldContent;
        var state;
        if (action.method === Method.GET && action.actionResult === ComponentAction.LOAD) {
            state = state || {};
            history.pushState(state, "", action.url);
            this._currentUrl = action.url;
        }
        if (action.method === Method.POPSTATE) {
            action.method = Method.GET;
        }
        switch (action.actionResult) {
            case ComponentAction.LOAD:
                if (action.hasOldContent()) {
                    $target.css({ height: action.$oldContent.outerHeight() });
                    $oldContent.addClass('fade-out');
                }
                setTimeout(function () {
                    $oldContent.remove();
                    action.ready();
                }, 50);
                break;
            case ComponentAction.CLOSE:
                break;
            case ComponentAction.NONE:
                break;
        }
    };
    ;
    Navigate.prototype._done = function (action) {
        switch (action.actionResult) {
            case ComponentAction.LOAD:
                this._display(action);
                break;
            case ComponentAction.CLOSE:
                this._close(action);
                break;
            case ComponentAction.NONE:
                break;
        }
    };
    ;
    Navigate.prototype._display = function (action) {
        var self = this;
        var $target = action.$target;
        var $newContent = $(action.response);
        action.$newContent = $newContent;
        $newContent.addClass('fade-in');
        action.onReady(function () {
            $target.append($newContent);
            $target.css({ height: $newContent.outerHeight() });
            setTimeout(function () {
                $newContent.removeClass('fade-in');
                $target.css({ height: 'auto' });
            }, 30);
        });
    };
    ;
    Navigate.prototype._setOverlay = function (action) {
        action.overlay.setContent(action.response);
    };
    ;
    Navigate.prototype._setModal = function (action) {
        action.modal.setContent(action.response);
    };
    ;
    Navigate.prototype._close = function (action) {
    };
    ;
    Navigate.prototype._getActionResult = function ($el) {
        var actionResult = ComponentAction.LOAD;
        if ($el.length) {
            var result = $el.data('on-result');
            if (result) {
                var resultKey = result.toUpperCase();
                actionResult = ComponentAction[resultKey];
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