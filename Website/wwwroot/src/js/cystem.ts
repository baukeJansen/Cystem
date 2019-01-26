class Cystem {
    parsers: IAction[] = [];

    constructor() {
        this.bindActions($('body'));
    }

    bindActions($el: JQuery) {
        $el.find('.load').each(function (_, el) {
            var action: LoadAction = new LoadAction($(el));
        });

        $el.find('.ajax-get, .ajax-post, .ajax-delete, .link').each(function (_, el){
            var action: LinkAction = new LinkAction($(el));
        });

        var materialize = new Materialize();
        materialize.bind($el[0]);

        var popstateAction = new PopstateAction();
    }

    getComponent($component: JQuery): Component {
        return new Component($component);
    }
}