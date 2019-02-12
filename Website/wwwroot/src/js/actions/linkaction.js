var LinkAction = (function () {
    function LinkAction($el) {
        this.$el = $el;
        var self = this;
        $el.click(function () {
            var action = $el.getAction();
            switch (action) {
                case ComponentAction.CLOSE:
                    new CloseAction($el);
                    break;
                case ComponentAction.NONE:
                    break;
                case ComponentAction.SELECT:
                    var method = self.getMethod($el);
                    new LoadAction($el, method, function (component) {
                        component.onResultAction(function (result) {
                            $el.closest('.select-field').find('input').val(result);
                        });
                    });
                    break;
                case ComponentAction.RESULT:
                    new ResultAction($el);
                    new CloseAction($el);
                    break;
                case ComponentAction.LOAD:
                case ComponentAction.LOADSILENT:
                default:
                    var method = self.getMethod($el);
                    new LoadAction($el, method);
                    break;
            }
            return false;
        });
    }
    LinkAction.prototype.getMethod = function ($el) {
        return Method.GET;
    };
    return LinkAction;
}());
//# sourceMappingURL=linkaction.js.map