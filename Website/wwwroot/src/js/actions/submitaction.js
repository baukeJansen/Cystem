var SubmitAction = (function () {
    function SubmitAction($el) {
        this.$el = $el;
        this.component = null;
        var self = this;
        $el.click(function () {
            self.component = $el.findComponent();
            self.formComponent = $el.getFormComponent();
            self.formComponent.send();
            var method = self.formComponent.getMethod();
            var url = self.formComponent.getUrl();
            var data = self.formComponent.getData();
            var ajax = new AjaxAction(method, url, data);
            ajax.send2(function () {
                self.succes.call(self);
            }, function () {
                self.error.call(self);
            });
            return false;
        });
    }
    SubmitAction.prototype.succes = function (response) {
        var self = this;
        var parentComponent = $.getParentComponent(this.component);
        this.formComponent.succes();
        new ReloadAction(parentComponent);
        setTimeout(function () {
            new CloseAction(self.$el);
        }, 500);
    };
    SubmitAction.prototype.error = function (message) {
        this.formComponent.error($(message));
    };
    return SubmitAction;
}());
//# sourceMappingURL=submitaction.js.map