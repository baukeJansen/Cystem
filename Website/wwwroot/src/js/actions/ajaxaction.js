var AjaxAction = (function () {
    function AjaxAction(method, url, data, actionResult) {
        if (actionResult === void 0) { actionResult = ActionResult.DISPLAY; }
        this.method = method;
        this.url = url;
        this.data = data;
        this.actionResult = actionResult;
    }
    AjaxAction.prototype.send = function (fnSucces, caller) {
        var self = this;
        $.ajax({
            method: this.method,
            url: this.url,
            data: this.data,
            mimeType: 'text/html'
        }).done(function (response, status, xhr) {
            switch (xhr.status) {
                case 200:
                    fnSucces.call(caller, response);
                    break;
                case 205:
                    window.location.href = self.url;
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
    return AjaxAction;
}());
//# sourceMappingURL=ajaxaction.js.map