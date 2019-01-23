@ServiceManager.register(Service.Ajax)
class Ajax {
    send(component: Component, action: Action) {
        $.ajax({
            method: action.method,
            url: action.url,
            data: action.data,
            mimeType: 'text/html'
        }).done(function (response, status, xhr) {
            switch (xhr.status) {
                case 200:
                    component.setContent(response);
                    //action.response = response;
                    //self._done.call(self, action);
                    break;
                case 205:
                    //action.data.Layout = "None";
                    //window.location.href = action.url; // self._createUrl(action.url, action.data);
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
    }
}