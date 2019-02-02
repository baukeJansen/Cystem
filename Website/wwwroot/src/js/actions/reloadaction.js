var ReloadAction = (function () {
    function ReloadAction(component, $el) {
        this.component = component;
        this.$el = $el;
        if (component) {
            this.$el = component.$component;
        }
        var $reload = this.$el.find(CONTENT_SELECTOR);
        new LoadAction($reload);
    }
    return ReloadAction;
}());
//# sourceMappingURL=reloadaction.js.map