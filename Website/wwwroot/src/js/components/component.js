var Component2 = (function () {
    function Component2($component) {
        this.$component = $component;
        this.ready = true;
        this.fnReady = [];
        this.target = null;
        var targetType = $component.getTarget();
        if (targetType) {
        }
        $component.data('component', this);
    }
    Component2.prototype.empty = function () {
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
    Component2.prototype.load = function ($replace) {
        var self = this;
        $replace.addClass('fade-in');
        if (!this.ready) {
            this.fnReady.push(function () { self.load($replace); });
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
    return Component2;
}());
//# sourceMappingURL=component.js.map