var PopstateAction = (function () {
    function PopstateAction() {
        var self = this;
        window.onpopstate = function (e) { self.onPopState.call(self, e); };
        this.component = $.getMainComponent();
    }
    PopstateAction.prototype.onPopState = function (event) {
        var self = this;
        var url = document.location.href;
        var state = event.state || {};
        console.log(event);
        var previousState = event.originalEvent.state;
        switch (previousState.target) {
            case ComponentType.OVERLAY:
                new CloseAction(null, $('.overlay-wrapper').last().data('component'));
                break;
        }
        var data = {
            CurrentLayout: $("#Layout").val(),
            Layout: "AjaxLayout"
        };
        var ajax = new AjaxAction(Method.GET, url, data);
        switch (state.target) {
            case ComponentType.OVERLAY:
                var overlay = $.createOverlayComponent();
                ajax.send2(function (response) {
                    self.succes.call(self, response, overlay);
                });
                break;
            default:
                self.component.empty();
                ajax.send2(function (response) {
                    self.succes.call(self, response, self.component);
                });
                break;
        }
    };
    PopstateAction.prototype.succes = function (response, component) {
        var $response = $(response);
        component.load($response);
        cystem.bindActions($response);
    };
    return PopstateAction;
}());
//# sourceMappingURL=popstateaction.js.map