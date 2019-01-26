class LoadAction implements IAction {
    private component: Component;
    constructor(private $el: JQuery, method: Method = Method.GET) {
        this.component = new Component($el.closest('.component-wrapper'));
        this.component.unloadContent();

        var actionResult: ActionResult = this.getActionResult($el);
        var url = this.getUrl($el);
        var data = this.getData($el, actionResult);

        var ajax = new AjaxAction(method, url, data, actionResult);
        ajax.send(this.onResult, this);
    }

    onResult(response) {
        var $response = $(response);
        this.component.loadContent($response);

        cystem.bindActions($response);
    }

    getActionResult($el: JQuery): ActionResult {
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

    getUrl($el: JQuery, keepParams: boolean = false): string {
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

    getData($el: JQuery, actionResult: ActionResult): object {
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
}