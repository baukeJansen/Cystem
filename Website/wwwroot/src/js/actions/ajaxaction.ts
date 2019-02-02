class AjaxAction implements IAction {
    constructor(private method: string, private url: string, private data: any) {
    }

    send(fnSucces: Function, fnError?: Function) {
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
            var modal: IComponent = Modal.new();
            var $content: JQuery = $('<div class="content"></div>');
            var $iframe: JQuery = $('<iframe>');
            $content.append($iframe);
            modal.setContent($content);

            setTimeout(function () {
                var iframe = $iframe[0] as HTMLIFrameElement;
                var doc = iframe.contentWindow.document;
                var $iframeBody = $('body', doc);
                $iframeBody.html(error.responseText);
            }, 1);
        });
    }
}