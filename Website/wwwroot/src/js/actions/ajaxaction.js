var AjaxAction = (function () {
    function AjaxAction(method, url, data) {
        this.method = method;
        this.url = url;
        this.data = data;
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
    AjaxAction.prototype.send2 = function (fnSucces, fnError) {
        var self = this;
        $.ajax({
            method: this.method,
            url: this.url,
            data: this.data,
            mimeType: 'text/html'
        }).done(function (response, status, xhr) {
            switch (xhr.status) {
                case 200:
                    fnSucces(response);
                    break;
                case 205:
                    window.location.href = self.url;
                    break;
                default:
                    console.log('unknown status: ', xhr.status);
                    break;
            }
        }).fail(function (error) {
            if (fnError) {
                fnError(error);
            }
            else {
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
            }
        });
    };
    return AjaxAction;
}());
//# sourceMappingURL=ajaxaction.js.map