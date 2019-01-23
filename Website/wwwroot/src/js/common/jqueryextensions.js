jQuery.fn.extend({
    component: function (parent) {
        return new Component(parent, this);
    },
    iterate: function (component) {
        return this.each(function (_, el) {
            var $el = $(el);
            if (el.hasAttribute('data-component-wrapper')) {
                component.addChild(new Component(component, $el));
            }
            else {
                component.parse(el);
                $el.children().iterate(component);
            }
        });
    }
});
//# sourceMappingURL=jqueryextensions.js.map