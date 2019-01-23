var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Ajax = (function () {
    function Ajax() {
    }
    Ajax.prototype.send = function (component, action) {
        $.ajax({
            method: action.method,
            url: action.url,
            data: action.data,
            mimeType: 'text/html'
        }).done(function (response, status, xhr) {
            switch (xhr.status) {
                case 200:
                    component.setContent(response);
                    break;
                case 205:
                    break;
                default:
                    console.log('unknown status: ', xhr.status);
                    break;
            }
        }).fail(function (error) {
            var $content = $('<div class="content error-modal"></div>');
            var $iframe = $('<iframe>');
            setTimeout(function () {
                var iframe = $iframe[0];
                var $iframeContent = $('body', iframe.contentWindow.document);
                $iframeContent.html(error.responseText);
            }, 1);
        });
    };
    Ajax = __decorate([
        ServiceManager.register(Service.Ajax)
    ], Ajax);
    return Ajax;
}());
//# sourceMappingURL=ajax.js.map