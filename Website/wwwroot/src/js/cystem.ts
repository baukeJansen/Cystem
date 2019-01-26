class Cystem {
    parsers: IAction[] = [];

    constructor() {
        this.bindActions($('body'));
    }

    bindActions($el: JQuery) {
        $el.find('.load').each(function (_, el) {
            var action: LoadAction = new LoadAction($(el));
        });
    }

    getComponent($component: JQuery): Component {
        return new Component($component);
    }
}