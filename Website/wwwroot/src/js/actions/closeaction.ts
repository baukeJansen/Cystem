class CloseAction {
    constructor($el: JQuery, component?: IClosable) {
        if (!component) {
            var $wrapper: JQuery = $el.closest('.overlay-wrapper, .modal-wrapper').addBack('.overlay-wrapper, .modal-wrapper');
            component = $wrapper.data('component');
        }

        component.close();
    }
}