class Component {
    constructor(public $component: JQuery) {

    }

    replace($replace: JQuery): void {
        this.$component.children().replaceWith($replace);
    }

    getParent(): Component {
        var $parent: JQuery = this.$component.closest('.component-wrapper');
        return new Component($parent);
    }

    getMain(): Component {
        var $main: JQuery = this.$component.closest('.main-component');
        return new Component($main);
    }
}