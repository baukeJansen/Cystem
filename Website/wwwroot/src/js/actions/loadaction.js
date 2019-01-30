var LoadAction = (function () {
    function LoadAction($el, method) {
        if (method === void 0) { method = Method.GET; }
        this.$el = $el;
        var action = $el.getAction();
        this.component = $el.findComponent();
        this.component.empty();
        var url = $el.getUrl();
        var data = $el.getData();
        var ajax = new AjaxAction(method, url, data);
        ajax.send(this.onResult, this);
        if (method === Method.GET && action === ComponentAction.LOAD) {
            var target = $el.getTarget();
            var state = {
                target: target
            };
            new HistoryAction(url, state);
        }
    }
    LoadAction.prototype.onResult = function (response) {
        var $response = $(response);
        this.component.load($response);
        cystem.bindActions($response);
    };
    return LoadAction;
}());
//# sourceMappingURL=loadaction.js.map