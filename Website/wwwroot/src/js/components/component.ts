class Component {
    private ready: boolean = true;
    private fnReady: Function[] = [];
    private target: Component;

    constructor(public $component: JQuery, target: Component = null) {
        if (target == null) {
            target = this.getTarget($component);
        }

        this.target = target;
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

    getMain(): Component {
        var $main: JQuery = this.$component.closest('.main-component');
        return new Component($main);
    }

    getTarget($component: JQuery): Component {
        switch ($component.data('target').toLower()) {
            case 'main': return this.getMain();
            case 'parent': return this.getParent();
            default: return null;
        }
    }
}