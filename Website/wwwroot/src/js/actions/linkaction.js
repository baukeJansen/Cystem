var LinkAction = (function () {
    function LinkAction($el) {
        this.$el = $el;
        var self = this;
        $el.click(function () {
            var method = self.getMethod($el);
            var loadAction = new LoadAction($el, method);
            return false;
        });
    }
    LinkAction.prototype.getMethod = function ($el) {
        return Method.GET;
    };
    return LinkAction;
}());
//# sourceMappingURL=linkaction.js.map