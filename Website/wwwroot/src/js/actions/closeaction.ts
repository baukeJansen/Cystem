class CloseAction {
    constructor($el: JQuery, component?: IComponent) {
        if (!component) {
            component = $el.findComponent();
        }

        component.close();
    }
}