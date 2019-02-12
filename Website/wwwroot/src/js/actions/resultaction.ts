class ResultAction {
    constructor($el: JQuery) {
        var result: string = $el.data('value');
        var component: IComponent = $el.findComponent();
        component.onResult(result);
    }
}