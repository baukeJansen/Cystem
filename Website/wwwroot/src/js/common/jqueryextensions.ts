//component
interface JQuery {
    component(parent: Component): Component,
    iterate(component: Component): JQuery,
}

jQuery.fn.extend({
    component: function (parent: Component): Component {
        return new Component(parent, this);
    },
    iterate: function (component: Component): JQuery {
        return this.each(function (_, el: HTMLElement) {
            var $el = $(el);

            if (el.hasAttribute('data-component-wrapper')) {
                component.addChild(new Component(component, $el));
            } else {
                component.parse(el);
                $el.children().iterate(component);
            }
        });
    }
});