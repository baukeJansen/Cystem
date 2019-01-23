class Action {
    private _readyStack: Function[] = [];
    url: string;
    data: any;
    response: string;
    actionResult: ActionResult;

    constructor(public component: Component, public $source: JQuery, public method: string) {
        this.actionResult = this._getActionResult($source);
        this.url = this._getUrl($source);
        this.data = this._getData($source, this.actionResult);
    }

    setSource($source: JQuery): void {
        this.$source = $source || undefined;
        /*var $target;

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
        this.$newContent = undefined;*/
    }

    hasSource(): boolean {
        return !!(this.$source && this.$source.length);
    }

    /*hasTarget(): boolean {
        return !!(this.$target && this.$target.length);
    }

    hasOldContent(): boolean {
        return !!(this.$oldContent && this.$oldContent.length);
    }

    hasNewContent(): boolean {
        return !!(this.$newContent && this.$newContent.length);
    }*/

    onReady (fn: Function): void {
        this._readyStack.push(fn);
    }

    ready(): void {
        this.onReady = function (fn: Function) {
            fn();
        };

        this._readyStack.forEach(function (fn: Function) { fn(); });
    }

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
    }

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
    }

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
}