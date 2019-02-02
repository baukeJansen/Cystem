class CloseAction implements IAction {
    constructor($el: JQuery, component?: IComponent) {
        if (!component) {
            component = $el.findComponent();
        }

        component.close();
    }
}