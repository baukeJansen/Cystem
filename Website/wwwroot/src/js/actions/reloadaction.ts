class ReloadAction {
    constructor(private component?: IComponent, private $el?: JQuery) {
        if (component) {
            this.$el = component.$component;
        }

        var $reload = this.$el.find(CONTENT_SELECTOR);
        new LoadAction($reload);
    }
}