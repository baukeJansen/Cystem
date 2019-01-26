var Component = (function () {
    function Component($component, target) {
        if (target === void 0) { target = null; }
        this.$component = $component;
        this.ready = true;
        this.fnReady = [];
        if (target == null) {
            target = this.getTarget($component);
        }
        this.target = target;
    }
    Component.prototype.unloadContent = function () {
        if (this.target != null)
            return this.target.unloadContent();
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
    };
    Component.prototype.loadContent = function ($replace) {
        if (this.target != null)
            return this.target.loadContent($replace);
        var self = this;
        $replace.addClass('fade-in');
        if (!this.ready) {
            this.fnReady.push(function () { self.loadContent($replace); });
        }
        else {
            this.$component.append($replace);
            this.$component.css({ height: $replace.outerHeight() });
            setTimeout(function () {
                $replace.removeClass('fade-in');
                self.$component.css({ height: 'auto' });
            }, 300);
        }
    };
    Component.prototype.getParent = function () {
        var $parent = this.$component.closest('.component-wrapper');
        return new Component($parent);
    };
    Component.prototype.getMain = function () {
        var $main = this.$component.closest('.main-component');
        return new Component($main);
    };
    Component.prototype.getTarget = function ($component) {
        switch ($component.data('target').toLower()) {
            case 'main': return this.getMain();
            case 'parent': return this.getParent();
            default: return null;
        }
    };
    return Component;
}());
//# sourceMappingURL=component.js.map