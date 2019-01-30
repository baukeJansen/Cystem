class ModalComponent implements IClosable {
    static $template: JQuery;

    constructor(public $component: JQuery) {
        var self = this;
        $component.removeClass('hide');
        $component.addClass('fade');

        setTimeout(function () {
            self.$component.removeClass('fade');
        }, 50);

        $component.data('component', this);
    }

    close(): void {
        var self = this;
        if (this.$component.hasClass('fade')) return;

        this.$component.addClass('fade');
        //this._helper.moveParents(this, 'right');
        //this._helper.reloadParent(this);

        setTimeout(function () {
            self.$component.remove();
        }, 400);
    }

    static setTemplate($template: JQuery): void {
        if ($template.length) {
            $template.removeClass('overlay-template');
            $template.detach();
            this.$template = $template;
        }
    }

    static hasTemplate(): boolean {
        return this.$template != null;
    }
}