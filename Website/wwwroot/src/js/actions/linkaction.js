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
                case ComponentAction.NONE: break;
                case ComponentAction.LOAD:
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