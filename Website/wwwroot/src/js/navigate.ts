class Navigate implements IService {
    Name: ServiceName = ServiceName.Navigate;
    private _serviceManager: IServiceManager
    private _currentUrl: string = '';

    constructor() {
        var self = this;
        window.onpopstate = function (e) { self.onPopState.call(self, e); };
    }

    construct(serviceManager: IServiceManager) {
        this._serviceManager = serviceManager;
    }

    bind(el: HTMLElement): void {
        var self = this;
        var $el = $(el);

        $el.find('.ajax-get').click(function (e) { return self._action.call(self, e, Method.GET, $(this)); });
        $el.find('.ajax-post').click(function (e) { return self._action.call(self, e, Method.POST, $(this)); });
        $el.find('.ajax-put').click(function (e) { return self._action.call(self, e, Method.PUT, $(this)); });
        $el.find('.ajax-delete').click(function (e) { return self._action.call(self, e, Method.DELETE, $(this)); });
        $el.find('.ajax-submit').click(function (e) { return self._submit.call(self, e, $(this)); });
        $el.find('.ajax-load').each(function (i, el) { self._action.call(self, null, Method.GET, $(el)); });
    };

    reload($content: JQuery): void {
        this._action(null, Method.GET, $content);
    };

    // Action button
    private _action(event, method: string, $el: JQuery) {
        var actionResult: ActionResult = this._getActionResult($el);
        var url = this._getUrl($el);
        var data = this._getData($el, actionResult);
        var action = new Action(method, url, data, $el, actionResult);

        this._exec(action);
        return false;
    };

    // Form
    private _submit(event, $el: JQuery): boolean {
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
    onPopState(event): void {
        var url = document.location.href;
        var state = event.state || {};
        var data = {
            CurrentLayout: $("#Layout").val(),
            Layout: "AjaxLayout"
        };

        console.log(this._currentUrl, url);

        var action = new Action(Method.POPSTATE, url, data, undefined, state.actionResult || ActionResult.DISPLAY);
        this._exec(action);
    };

    private _exec(action: Action) {
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
                    window.location.href = action.url; // self._createUrl(action.url, action.data);
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
                var iframe = $iframe[0] as HTMLIFrameElement;
                var doc = iframe.contentWindow.document;
                var $iframeBody = $('body', doc);
                $iframeBody.html(error.responseText);

                $closeButton.click(function () { $popup.remove(); });
            }, 1);
        });
    };

    private _beforeSend(action: Action) {
        var $target = action.$target;
        var $oldContent = action.$oldContent;
        var state;

        if (action.method === Method.GET && action.actionResult === ActionResult.DISPLAY) {
            state = state || {};
            history.pushState(state, "", action.url);
            this._currentUrl = action.url;
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
                var _overlayHelper: OverlayHelper = this._serviceManager.get(OverlayHelper);
                action.overlay = _overlayHelper.open();
                break;
            case ActionResult.MODAL:
                var _modalHelper: ModalHelper = this._serviceManager.get(ModalHelper);
                action.modal = _modalHelper.open(action.$source);
                break;
            case ActionResult.CLOSE:
                break;
            case ActionResult.NONE:
                break;
        }
    };

    private _done(action: Action) {
        switch (action.actionResult) {
            case ActionResult.DISPLAY:
            case ActionResult.LOAD:
            case ActionResult.RELOAD:
                this._display(action);
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

    private _display(action: Action) {
        var self = this;
        var $target = action.$target;
        var $newContent = $(action.response);
        action.$newContent = $newContent;
        $newContent.addClass('fade-in');

        action.onReady(function () {
            $target.append($newContent);

            //var cystem: Cystem = self._serviceManager.get(Cystem);
            //cystem.bindNew($newContent[0]);
            $target.css({ height: $newContent.outerHeight() });

            setTimeout(function () {
                $newContent.removeClass('fade-in');
                $target.css({ height: 'auto' });
            }, 30);


        });
    };

    private _setOverlay(action: Action) {
        action.overlay.setContent(action.response);
    };

    private _setModal(action: Action) {
        action.modal.setContent(action.response);
    };

    private _close(action: Action) {
        var _overlayHelper: OverlayHelper = this._serviceManager.get(OverlayHelper);
        _overlayHelper.close();
    };

    private _getActionResult($el: JQuery): ActionResult {
        var actionResult: ActionResult = ActionResult.DISPLAY;

        if ($el.length) {
            var result: string = $el.data('on-result');

            if (result) {
                var resultKey = result.toUpperCase() as keyof typeof ActionResult;
                actionResult = ActionResult[resultKey];
            }
        }

        return actionResult;
    };

    private _getUrl($el: JQuery, keepParams: boolean = false): string {
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

    private _getData($el: JQuery, actionResult: ActionResult): object {
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

    private _createUrl(url: string, data: object): string {
        var params = "";
        for (var key in data) {
            params += params === "" ? "?" : "&";

            params += key + "=" + encodeURIComponent(data[key]);
        }

        return url + params;
    };
}