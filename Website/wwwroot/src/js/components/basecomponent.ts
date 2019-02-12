const COMPONENT_SELECTOR: string = '.component';
const CONTENT_SELECTOR: string = '.content';
const COMPONENT_DATA: string = 'component';

abstract class BaseComponent implements IComponent {
    protected parent: IComponent
    protected children: IComponent[] = [];
    protected url: string;
    protected resultAction: Function = null;

    public abstract getType(): ComponentType;

    public abstract getState(): object;

    public setState(state: any): void {
        for (var i: number = 0; i < this.children.length || i < state.components.length; i++) {
            var child: IComponent = this.children[i];
            var childState: any = state.components[i];

            if (!child) {
                switch (childState.type) {
                    case ComponentType.OVERLAY:
                        var overlay: IComponent = Overlay.new();
                        overlay.setState(childState.components[0]);
                        break;
                    case ComponentType.MODAL:
                        var modal: IComponent = Modal.new();
                        modal.setState(childState.components[0]);
                        break;
                }
            } else if (!childState) {
                child.close(true);
            } else if (child.getType() != childState.type) {
                console.error('missing - set state - replace');
                // replace child
            } else {
                child.setState(childState);
            }
        }
    }

    public constructor(public $component: JQuery) {
        $component.setComponent(this);
        this.parent = this.findParent($component);

        if (this.parent) {
            this.parent.addChild(this);
        }
        this.url = $component.find(CONTENT_SELECTOR).getUrl();
    }

    protected findParent($component: JQuery): IComponent {
        var $parent: JQuery = $component.parent().closest(COMPONENT_SELECTOR + ', body');
        return $parent.getComponent();
    }

    public getTargetComponent(actionTarget: ComponentType = null): IComponent {
        if (!actionTarget) {
            actionTarget = this.$component.getTarget();
        }

        switch (actionTarget) {
            case ComponentType.MAIN: return cystem.page.getMainComponent();
            case ComponentType.PARENT: return this.parent;
            case ComponentType.OVERLAY: return Overlay.new();
            case ComponentType.MODAL: return Modal.new();
            case ComponentType.SELF:
            default:
                return this;
        }
    }

    public addChild(component: IComponent): void {
        this.children.push(component);
    }

    public removeChild(component: IComponent): void {
        this.children.splice(this.children.indexOf(component), 1);
    }

    public getChildren(): IComponent[] {
        return this.children;
    }

    public getParent(): IComponent {
        return this.parent;
    }

    public clearContent(): void {
        var self = this;
        this.$component.addClass('loading');
        this.children = [];

        var $children: JQuery = this.$component.children();
        new FadeOutAnimation(this.$component, $children, function () {
            $children.remove();
        });
    }

    public setContent($content: JQuery): void {
        this.$component.removeClass('loading');

        this.$component.append($content);
        new FadeInAnimation(this.$component, $content);
    }

    public onResultAction(fn: Function): void {
        this.resultAction = fn;
    }

    public onResult(result: any): void {
        if (this.resultAction) {
            this.resultAction(result);
        } else {
            if (this.parent) {
                this.parent.onResult(result);
            }
        }
    }

    public close(): void {
        this.parent.close();
    }

    public delete(): void {
        this.$component.remove();
        this.parent.removeChild(this);
    }

}