var PopstateAction = (function () {
    function PopstateAction() {
        var self = this;
        window.onpopstate = function (e) { self.onPopState.call(self, e); };
        this.component = Component.getMain();
    }
    PopstateAction.prototype.onPopState = function (event) {
        var url = document.location.href;
        var state = event.state || {};
        var data = {
            CurrentLayout: $("#Layout").val(),
            Layout: "AjaxLayout"
        };
        this.component.unloadContent();
        var ajax = new AjaxAction(Method.GET, url, data, state.actionResult || ActionResult.DISPLAY);
        ajax.send(this.onResult, this);
    };
    PopstateAction.prototype.onResult = function (response) {
        var $response = $(response);
        this.component.loadContent($response);
        cystem.bindActions($response);
    };
    return PopstateAction;
}());
//# sourceMappingURL=popstateaction.js.map