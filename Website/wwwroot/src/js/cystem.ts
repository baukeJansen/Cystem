﻿class Cystem {
    public page: Page;

    constructor() {
        this.page = new Page();
    }

    init() {
        this.apply(this.page.$component);

        new PopstateAction();
        new KeyActions();
    }

    apply($el: JQuery) {
        Overlay.findTemplate($el);
        Modal.findTemplate($el);

        $el.find(COMPONENT_SELECTOR).addBack(COMPONENT_SELECTOR).each(function (_, el) {
            var $component = $(el);

            var type: ComponentType = $component.getType();

            switch (type) {
                case ComponentType.OVERLAY: new Overlay($component); break;
                case ComponentType.MODAL: new Modal($component); break;
                default: new Component($component);
            }
        });

        $el.find('form').each(function (_, el) {
            new FormComponent($(el));
        });

        $el.find('.load').each(function (_, el) {
            new LoadAction($(el));
        });

        $el.find('.ajax-get, .ajax-post, .ajax-delete, .link').each(function (_, el) {
            new LinkAction($(el));
        });

        new Materialize($el[0]);

        $el.find('.tabs.formtab').each(function (_, el) {
            new Formtab($(el));
        });

        $el.find('.ajax-submit, .submit').each(function (_, el) {
            new SubmitAction($(el));
        });

        $el.find('.fixed-action-btn').each(function (_, el) {
            new FloatingActionButton($(el));
        });

        $el.find('.graph').each(function (_, el) {
            new Graph($(el));
        });
    }
}

var cystem: Cystem = new Cystem();
cystem.init();