class Component {
    private ready: boolean = true;
    private fnReady: Function[] = [];
    private target: Component;

    constructor(public $component: JQuery, actionTarget: string = null) {
        this.target = this.getTarget($component, actionTarget);
    }

    unloadContent(): void {
        if (this.target != null) return this.target.unloadContent();

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

    loadContent($replace: JQuery): void {
        if (this.target != null) return this.target.loadContent($replace);

        var self = this;
        $replace.addClass('fade-in');

        if (!this.ready) {
            this.fnReady.push(function () { self.loadContent($replace); });
        } else {
            this.$component.append($replace);

            this.$component.css({ height: $replace.outerHeight() });

            setTimeout(function () {
                $replace.removeClass('fade-in');
                self.$component.css({ height: 'auto' });
            }, 300);
        }
    }

    getParent(): Component {
        var $parent: JQuery = this.$component.closest('.component-wrapper');
        return new Component($parent);
    }

    static getMain(): Component {
        var $main: JQuery = $('.main-component');
        return new Component($main);
    }

    getTarget($component: JQuery, actionTarget: string): Component {
        var target: string = actionTarget ? actionTarget : $component.data('target')
        if (target) target = target.toLowerCase();

        switch (target) {
            case 'self': return null;
            case 'main': return Component.getMain();
            case 'parent': return this.getParent();
            default: return null;
        }
    }
}