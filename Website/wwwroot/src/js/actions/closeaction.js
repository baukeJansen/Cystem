var CloseAction = (function () {
    function CloseAction($el, component) {
        if (!component) {
            component = $el.findComponent();
        }
        component.close();
    }
    return CloseAction;
}());
//# sourceMappingURL=closeaction.js.map