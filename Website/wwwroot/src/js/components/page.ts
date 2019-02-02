class Page extends BaseComponent {
    private mainComponent: IComponent;

    public constructor() {
        super($('body'));
        var self = this;
    }

    public getType(): ComponentType {
        return ComponentType.PAGE;
    }

    public getState(): object {
        var childstate: object[] = [];
        for (var child of this.children) {
            childstate.push(child.getState());
        }

        return { type: this.getType(), components: childstate };
    }

    public getMainComponent(): IComponent {
        return this.mainComponent;
    }

    public addChild(component: IComponent): void {
        super.addChild(component);

        var type: ComponentType = component.$component.getType();
        if (type == ComponentType.MAIN) {
            this.mainComponent = component;
        }
    }

    protected findParent($component: JQuery): IComponent {
        return null;
    }
}