class AjaxAction implements IAction {
    constructor(private method: string, private url: string, private data: any, private actionResult: ActionResult = ActionResult.DISPLAY) {
    }

    send(fnSucces: Function, self: any) {
        $.ajax({
            method: this.method,
            url: this.url,
            data: this.data,
            mimeType: 'text/html'
        }).done(function (response, status, xhr) {
            switch (xhr.status) {
                case 200:
                    fnSucces.call(self, response);
                    break;
                case 205:
                    this.data.Layout = "None";
                    window.location.href = this.url; // self._createUrl(action.url, action.data);
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
    }
}