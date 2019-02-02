class OverlayComponent implements IClosable {
    static $template: JQuery = null;

    constructor(public $component: JQuery) {
        var self = this;
        $component.removeClass('hide');
        $component.addClass('fade');

        setTimeout(function () {
            self.$component.removeClass('fade');
        }, 50);

        $component.click(function (e) {
            var $target = $(e.target);

            if ($target.hasClass('overlay-wrapper')) {
                //new CloseAction(null, self);
            }
        });

        $component.data('component', this);
    }

    /*onAction(): void {
        var self = this;
        //this._helper.moveParents(this, 'left');

        
    }*/

    close(): void {
        /*var self = this;
        if (this.$component.hasClass('fade')) return;

        this.$component.addClass('fade');
        //this._helper.moveParents(this, 'right');

        var mainComponent: Component2 = $.getMainComponent();
        var url: string = mainComponent.$component.find('.component').getUrl();
        var state = {};

        new HistoryAction(url, state);

        setTimeout(function () {
            self.$component.remove();
        }, 400);*/
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