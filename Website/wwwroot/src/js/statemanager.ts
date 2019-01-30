class Page {
    public $page: JQuery;
    public components: Component1[] = [];
    private mainComponent: Component1;

    public constructor() {
        this.$page = $('body');
    }

    addComponent($component) {
        var $parent = $component.parent().closest('.component-wrapper');
        var parent: IComponent;
        if ($parent.length) {
            parent = $parent.getComponent();
        }

        var component: Component1 = new Component1($component, parent);
    }

    public getState(): object {
        return {};
    }
}

class Component1 implements IComponent {
    public components: IComponent[] = [];

    public constructor(public $component: JQuery, public parent: IComponent) {
        $component.setComponent(this);
    }

    public addChild(component: IComponent): void {
        this.components.push(component);
    }

    public unload(): void {
        this.components = [];
    }

    public getState(): object {
        return {};
    }
}

class OverlayComponent1 {

}

interface IComponent {
    getState(): object;
    addChild(component: IComponent): void;
    unload(): void;
}