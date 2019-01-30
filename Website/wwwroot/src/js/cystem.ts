class Cystem {
    parsers: IAction[] = [];

    constructor() {
        this.bindActions($('body'));
    }

    bindActions($el: JQuery) {
        if (!OverlayComponent.hasTemplate()) {
            OverlayComponent.setTemplate($el.find('.overlay-template'));
        }

        if (!ModalComponent.hasTemplate()) {
            ModalComponent.setTemplate($el.find('.overlay-template'));
        }

        $el.find('.component-wrapper').each(function (_, el) {
            new Component($(el));
        });


        $el.find('.overlay-wrapper').addBack('.overlay-wrapper').each(function (_, el) {
            new OverlayComponent($(el));
        });

        $el.find('.modal-wrapper').addBack('.modal-wrapper').each(function (_, el) {
            new ModalComponent($(el));
        });

        $el.find('form').addBack('form').each(function (_, el) {
            new FormComponent($(el));
        });

        $el.find('.load').each(function (_, el) {
            new LoadAction($(el));
        });

        $el.find('.ajax-get, .ajax-post, .ajax-delete, .link').each(function (_, el){
            new LinkAction($(el));
        });

        new Materialize($el[0]);

        new PopstateAction();

        $el.find('.fixed-action-btn').each(function (_, el) {
           new FloatingActionButton($(el));
        });


        $el.find('.ajax-submit, .submit').each(function (_, el) {
            new SubmitAction($(el));
        });
    }
}