class Component {
    protected ready: boolean = true;
    protected fnReady: Function[] = [];
    public target: Component = null;

    constructor(public $component: JQuery) {
        var targetType: ComponentType = $component.getTarget();

        if (targetType) {
            this.target = $.getTargetComponent(this, targetType);
        }

        $component.data('component', this);
    }

    empty(): void {
        var self = this;
        this.ready = false;

        var $children = this.$component.children();
        this.$component.css({ height: $children.outerHeight() });
        $children.addClass('fade-out');

        setTimeout(function () {
            $children.remove();
            self.ready = true;

            $.each(self.fnReady, function (_, fn) {
                fn();
            });
        }, 50);
    }

    load($replace: JQuery): void {
        var self = this;
        $replace.addClass('fade-in');

        if (!this.ready) {
            this.fnReady.push(function () { self.load($replace); });
        } else {
            this.$component.append($replace);

            this.$component.css({ height: $replace.outerHeight() });

            setTimeout(function () {
                $replace.removeClass('fade-in');
                self.$component.css({ height: 'auto' });
            }, 300);
        }
    }
}