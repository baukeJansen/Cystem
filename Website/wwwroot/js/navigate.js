(function (global, $) {
    var Action = function (method, url , data, $source, actionResult) {
        this.method = method;
        this.url = url;
        this.data = data;
        this.actionResult = actionResult || ActionResult.DISPLAY;
        this.readyStack = [];

        this.setSource($source);
    };

    Action.prototype.setSource = function ($source) {
        this.$source = $source || undefined;
        var $target;

        if (this.hasSource()) {
            var target = this.$source.data('target');
            $target = target ? $(target) : undefined;

            if (!($target && $target.length)) {
                $target = this.$source.closest('.content-wrapper');
            }

            if (!($target && $target.length)) {
                $target = undefined;
            }
        }

        this.$target = $target || $('.content-wrapper.main-content');
        this.$oldContent = this.$target.find('.content');
        this.$newContent = undefined;
    };

    Action.prototype.hasSource = function() {
        return !!this.$source && this.$source.length;
    };

    Action.prototype.hasTarget = function () {
        return !!this.$target && this.$target.length;
    };

    Action.prototype.hasOldContent = function () {
        return !!this.$oldContent && this.$oldContent.length;
    };

    Action.prototype.hasNewContent = function () {
        return !!this.$newContent && this.$newContent.length;
    };

    Action.prototype.onReady = function (fn) {
        this.readyStack.push(fn);
    };

    Action.prototype.ready = function () {
        this.onReady = function (fn) {
            fn();
        };

        this.readyStack.forEach(function (fn) { fn(); });
    };

    var Navigate = function () {
        var self = this;

        global.onpopstate = function (e) { self.onPopState.call(self, e); };
    };

    Navigate.prototype.init = function (el) {
        var self = this;
        var $el = $(el);

        $el.find('.ajax-get').click(function (e) { return self._action.call(self, e, Method.GET, $(this)); });
        $el.find('.ajax-post').click(function (e) { return self._action.call(self, e, Method.POST, $(this)); });
        $el.find('.ajax-put').click(function (e) { return self._action.call(self, e, Method.PUT, $(this)); });
        $el.find('.ajax-delete').click(function (e) { return self._action.call(self, e, Method.DELETE, $(this)); });
        $el.find('.ajax-submit').click(function (e) { return self._submit.call(self, e, $(this)); });

        $el.find('.ajax-load').each(function (i, el) { self._action.call(self, null, Method.GET, $(el)); });
    };

    Navigate.prototype.reload = function ($content) {
        this._action(null, Method.GET, $content);
    };

    // Action button
    Navigate.prototype._action = function (event, method, $el) {
        var actionResult = this._getActionResult($el);
        var url = this._getUrl($el);
        var data = this._getData($el, actionResult);
        var action = new Action(method, url, data, $el, actionResult);

        this._exec(action);
        return false;
    };

    // Form
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

    // Browser navigate => back or forward button
    Navigate.prototype.onPopState = function (event) {
        var url = document.location;
        var state = event.state || {};
        var data = {
            CurrentLayout: $("#Layout").val(),
            Layout: "AjaxLayout"
        };

        var action = new Action(Method.POPSTATE, url, data, undefined, state.actionResult || ActionResult.DISPLAY);
        this._exec(action);
    };

    Navigate.prototype._exec = function (action) {
        var self = this;
        this._beforeSend(action);
        
        $.ajax({
            method: action.method,
            url: action.url,
            data: action.data,
            mimeType: 'text/html'
        }).done(function (response) {
            action.response = response;
            self._done.call(self, action);
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
                var doc = $iframe[0].contentWindow.document;
                var $iframeBody = $('body', doc);
                $iframeBody.html(error.responseText);

                $closeButton.click(function () { $popup.remove(); });
            }, 1);
        });
    };

    Navigate.prototype._beforeSend = function (action) {
        var $target = action.$target;
        var $oldContent = action.$oldContent;
        var state;

        if (action.method === Method.GET && action.actionResult === ActionResult.DISPLAY) {
            state = state || {};
            history.pushState(state, "", action.url);
        }

        if (action.method === Method.POPSTATE) {
            action.method = Method.GET;
        }

        switch (action.actionResult) {
            case ActionResult.DISPLAY:
            case ActionResult.LOAD:
            case ActionResult.RELOAD:
                if (action.hasOldContent()) {
                    $target.css({ height: action.$oldContent.outerHeight() });
                    $oldContent.addClass('fade-out');
                }

                setTimeout(function () {
                    $oldContent.remove();
                    action.ready();
                }, 50);

                break;
            case ActionResult.OVERLAY:
                action.overlay = global.Cystem.Overlay.open();
                break;
            case ActionResult.POPUP:
                break;
            case ActionResult.CLOSE:
                break;
            case ActionResult.NONE:
                break;
        }
    };

    Navigate.prototype._done = function (action) {
        switch (action.actionResult) {
            case ActionResult.DISPLAY:
            case ActionResult.LOAD:
            case ActionResult.RELOAD:
                this._display(action);
                break;
            case ActionResult.OVERLAY:
                this._overlay(action);
                break;
            case ActionResult.POPUP:
                break;
            case ActionResult.CLOSE:
                this._close(action);
                break;
            case ActionResult.NONE:
                break;
        }
    };

    Navigate.prototype._display = function (action) {
        var $target = action.$target;
        var $newContent = $(action.response);
        action.$newContent = $newContent;
        $newContent.addClass('fade-in');

        action.onReady(function () {
            $target.append($newContent);

            global.Cystem.init($newContent[0]);
            $target.css({ height: $newContent.outerHeight() });

            setTimeout(function () {
                $newContent.removeClass('fade-in');
                $target.css({ height: 'auto' });
            }, 30);

            
        });
    };

    Navigate.prototype._overlay = function (action) {
        action.overlay.setContent(action.response);
    };

    Navigate.prototype._close = function (action) {
        global.Cystem.Overlay.close();
    };

    Navigate.prototype._getActionResult = function ($el) {
        var actionResult = $el ? $el.data('on-result') : ActionResult.DISPLAY;
        actionResult = actionResult ? actionResult.toLowerCase() : ActionResult.DISPLAY;

        return ActionResult.get(actionResult);
    };

    Navigate.prototype._getUrl = function ($el, keepParams) {
        var url;
        if ($el[0].hasAttribute('href')) {
            url = $el.attr('href');
        } else {
            url = $el.data('url');
        }

        if (keepParams) {
            return url;
        } else {
            return url.split('?')[0];
        }
    };

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
        data.overlay = actionResult === ActionResult.OVERLAY;

        return data;
    };

    var navigate = new Navigate();

    global.Cystem.register('Navigate', navigate, function () { navigate.init.apply(navigate, arguments); });
})(this, jQuery);