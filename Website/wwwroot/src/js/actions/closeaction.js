var CloseAction = (function () {
    function CloseAction($el, component) {
        if (!component) {
            var $wrapper = $el.closest('.overlay-wrapper, .modal-wrapper').addBack('.overlay-wrapper, .modal-wrapper');
            component = $wrapper.data('component');
        }
        component.close();
    }
    return CloseAction;
}());
//# sourceMappingURL=closeaction.js.map