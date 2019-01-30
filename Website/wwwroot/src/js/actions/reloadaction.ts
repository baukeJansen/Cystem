class ReloadAction {
    constructor(private component?: Component, private $el?: JQuery) {
        if (component) {
            this.$el = component.$component;
        }

        var $reload = this.$el.find('.component');
        new LoadAction($reload);
    }
}