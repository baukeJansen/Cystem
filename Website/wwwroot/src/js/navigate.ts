
interface JQuery {
    ajax(action: Action): JQuery,
    getUrl(keepParams: boolean): string,
    getData(): string,
    getActionResult(): ActionResult
}

jQuery.fn.extend({
    link: function (method: Method) {
        return this.click(function() {
            //$(this).load(scope, method);
        });
    },
    load: function (method: Method) {
        return this.each(function (_, el) {
            //var action: Action = new Action(scope, $(el), method);
            //$(this).ajax(action);
        });
    },
    ajax: function (action: Action) {
        return this.each(function () {
            //this._beforeSend(action);

            $.ajax({
                method: action.method,
                url: action.url,
                data: action.data,
                mimeType: 'text/html'
            }).done(function (response, status, xhr) {
                switch (xhr.status) {
                    case 200:
                        action.response = response;
                        //self._done.call(self, action);
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
                //var _modalHelper: ModalHelper = self._serviceManager.get(ModalHelper);
                //var modal: ModalHelper = _modalHelper.open();
                var $content: JQuery = $('<div class="content error-modal"></div>');
                var $iframe: JQuery = $('<iframe>');
                //modal.setJqueryContent($content.append($iframe));
                //modal.setJqueryContent($('<div class="modal-footer"><button class= "btn modal-close waves-effect"> Close </button></div>'));

                setTimeout(function () {
                    var iframe: HTMLIFrameElement = $iframe[0] as HTMLIFrameElement;
                    var $iframeContent: JQuery = $('body', iframe.contentWindow.document);
                    $iframeContent.html(error.responseText);
                }, 1);
            });
        });
    },
    getUrl: function (keepParams: boolean = false) {
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
        var actionResult: ActionResult = ActionResult.LOAD;

        if (this.length) {
            var result: string = this.data('on-result');

            if (result) {
                var resultKey = result.toUpperCase() as keyof typeof ActionResult;
                actionResult = ActionResult[resultKey];
            }
        }

        return actionResult;
    }
});

class Navigate{
    Name: Service = Service.Navigate;
    //private _serviceManager: IServiceManager
    private _currentUrl: string = '';

    constructor() {
        var self = this;
        window.onpopstate = function (e) { self.onPopState.call(self, e); };
    }

    bind(): void {
        //var $content = scope.$content;
        //$content.find('.ajax-get').link(scope, Method.GET);
        //$content.find('.ajax-post').link(scope, Method.POST);
        //$content.find('.ajax-put').link(scope, Method.PUT);
        //$content.find('.ajax-delete').link(scope, Method.DELETE);
        //$content.find('.ajax-load').load(scope, Method.GET);
        /*var self = this;
        var $el = $(el);

        $el.find('.ajax-get').click(function (e) { return self._action.call(self, e, Method.GET, $(this)); });
        $el.find('.ajax-post').click(function (e) { return self._action.call(self, e, Method.POST, $(this)); });
        $el.find('.ajax-put').click(function (e) { return self._action.call(self, e, Method.PUT, $(this)); });
        $el.find('.ajax-delete').click(function (e) { return self._action.call(self, e, Method.DELETE, $(this)); });
        $el.find('.ajax-submit').click(function (e) { return self._submit.call(self, e, $(this)); });
        $el.find('.ajax-load').each(function (i, el) { self._action.call(self, null, Method.GET, $(el)); });*/
    };

    reload($content: JQuery): void {
        this._action(null, Method.GET, $content);
    };

    // Action button
    private _action(event, method: string, $el: JQuery) {
        var actionResult: ActionResult = this._getActionResult($el);
        var url = this._getUrl($el);
        var data = this._getData($el, actionResult);
        //var action = new Action(method, url, data, $el, actionResult);

        //this._exec(action);
        return false;
    };

    // Form
    private _submit(event, $el: JQuery): boolean {
        var self = this;
        var $form = $el.closest('form');
        var $method: JQuery = $('form').find('#zmethod');
        var method: string;
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
        //var action = new Action(method, url, data, $el, actionResult);

        //this._exec(action);

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

        //var action = new Action(Method.POPSTATE, url, data, undefined, state.actionResult || ActionResult.DISPLAY);
        //this._exec(action);
    };

    private _exec(action: Action) {
        var self = this;
        //this._beforeSend(action);

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
            //var _modalHelper: ModalHelper = self._serviceManager.get(ModalHelper);
            //var modal: ModalHelper = _modalHelper.open();
            var $content: JQuery = $('<div class="content error-modal"></div>');
            var $iframe: JQuery = $('<iframe>');
            //modal.setJqueryContent($content.append($iframe));
            //modal.setJqueryContent($('<div class="modal-footer"><button class= "btn modal-close waves-effect"> Close </button></div>'));

            setTimeout(function () {
                var iframe: HTMLIFrameElement = $iframe[0] as HTMLIFrameElement;
                var $iframeContent: JQuery = $('body', iframe.contentWindow.document);
                $iframeContent.html(error.responseText);
            }, 1);
        });
    };

    /*private _beforeSend(action: Action) {
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
                //var _overlayHelper: OverlayHelper = this._serviceManager.get(OverlayHelper);
                //action.overlay = _overlayHelper.open();
                break;
            case ActionResult.MODAL:
                //var _modalHelper: ModalHelper = this._serviceManager.get(ModalHelper);
                //action.modal = _modalHelper.open();
                break;
            case ActionResult.CLOSE:
                break;
            case ActionResult.NONE:
                break;
        }
    };*/

    private _done(action: Action) {
        switch (action.actionResult) {
            case ActionResult.DISPLAY:
            case ActionResult.LOAD:
            case ActionResult.RELOAD:
                //this._display(action);
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

    /*private _display(action: Action) {
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
    };*/

    private _setOverlay(action: Action) {
        //action.overlay.setContent(action.response);
    };

    private _setModal(action: Action) {
        //action.modal.setContent(action.response);
    };

    private _close(action: Action) {
        //var _overlayHelper: OverlayHelper = this._serviceManager.get(OverlayHelper);
        //_overlayHelper.close();
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