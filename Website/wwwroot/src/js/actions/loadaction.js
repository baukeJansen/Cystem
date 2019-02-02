var LoadAction = (function () {
    function LoadAction($el, method) {
        if (method === void 0) { method = Method.GET; }
        this.$el = $el;
        var self = this;
        var action = $el.getAction();
        var target = $el.getTarget();
        this.component = $el.findComponent().getTargetComponent(target);
        this.component.clearContent();
        var url = $el.getUrl();
        var data = $el.getData();
        var history = null;
        if (method === Method.GET && action === ComponentAction.LOAD) {
            history = new HistoryAction(url);
        }
        var ajax = new AjaxAction(method, url, data);
        ajax.send2(function (response) { self.succes.call(self, response, history); });
    }
    LoadAction.prototype.succes = function (response, history) {
        var $response = $(response);
        this.component.setContent($response);
        cystem.apply($response);
        HistoryAction.reloadState();
    };
    return LoadAction;
}());
//# sourceMappingURL=loadaction.js.map