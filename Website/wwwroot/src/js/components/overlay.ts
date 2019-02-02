class Overlay extends BaseComponent {
    private static $template: JQuery;

    public constructor(public $component: JQuery) {
        super($component);

        var self = this;
        $component.removeClass('hide');
        $component.addClass('fade');

        setTimeout(function () {
            self.$component.removeClass('fade');
        }, 50);

        $component.click(function (e) {
            var $target = $(e.target);

            if ($target.hasClass('overlay')) {
                new CloseAction(null, self);
            }
        });
    }

    static new(): IComponent {
        var $overlay = Overlay.$template.clone();
        $('body').append($overlay);
        cystem.apply($overlay);

        return $overlay.getComponent().getChildren()[0];
    }

    public getType(): ComponentType {
        return ComponentType.OVERLAY;
    }

    public getState(): object {
        var childstate: object[] = [];
        for (var child of this.children) {
            childstate.push(child.getState());
        }

        return { type: 'overlay', components: childstate };
    }

    public close(silent: boolean = false): void {
        var self = this;
        if (this.$component.hasClass('fade')) return;

        this.$component.addClass('fade');
        //this._helper.moveParents(this, 'right');

        var mainComponent: IComponent = cystem.page.getMainComponent();
        var url: string = mainComponent.$component.find(CONTENT_SELECTOR).getUrl();

        if (!silent) {
            var history: HistoryAction = new HistoryAction(url);
        }

        setTimeout(function () {
            self.delete();
            HistoryAction.reloadState();
        }, 400);
    }

    public static findTemplate($el: JQuery): void {
        if (!this.$template) {
            var $template = $el.find('.overlay-template');

            if ($template.length) {
                var component: IComponent = $template.findComponent();

                this.$template = $template;
                $template.removeClass('overlay-template');
                $template.detach();

                component.delete();
            }
        }
    }
}