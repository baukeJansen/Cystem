const COMPONENT_SELECTOR: string = '.component';
const CONTENT_SELECTOR: string = '.content';
const COMPONENT_DATA: string = 'component';

interface IComponent {
    $component: JQuery;

    getType(): ComponentType;
    getState(): object;
    setState(state: any): void;
    getTargetComponent(actionTarget?: ComponentType): IComponent;
    addChild(component: IComponent): void;
    removeChild(component: IComponent): void;
    getChildren(): IComponent[];
    getParent(): IComponent;
    clearContent(): void;
    delete(): void;
    setContent($content: JQuery): void;
    close(silent?: boolean): void;
}

abstract class BaseComponent implements IComponent {
    protected parent: IComponent
    protected children: IComponent[] = [];
    protected url: string;

    public abstract getType(): ComponentType;

    public abstract getState(): object;

    public setState(state: any): void {
        for(var i: number = 0; i < this.children.length || i < state.components.length; i++) {
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

    public delete(): void {
        this.$component.remove();
        this.parent.removeChild(this);
    }

    public setContent($content: JQuery): void {
        this.$component.removeClass('loading');

        this.$component.append($content);
        new FadeInAnimation(this.$component, $content);
    }

    public close(): void {
        this.parent.close();
    }
}

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

        return { type: this.getType(), components: childstate};
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

class Component extends BaseComponent {
    public constructor(public $component: JQuery) {
        super($component);
    }

    public getType(): ComponentType {
        return ComponentType.COMPONENT;
    }

    public getState(): object {
        var childstate: object[] = [];
        for (var child of this.children) {
            childstate.push(child.getState());
        }

        return { type: this.getType(), url: this.url, components: childstate };
    }

    public setContent($content: JQuery): void {
        super.setContent($content);

        this.url = $content.getUrl(true);
    }

    public setState(state: any) {
        if (this.url != state.url) {
            this.clearContent();

            var $content = $('<div class="content" data-url="' + state.url + '" data-action="'+ ComponentAction.LOADSILENT +'" data-target="' + ComponentType.SELF + '"></div>');
            this.setContent($content);
            new LoadAction($content);
        }

        super.setState(state);
    }
}

class Overlay extends BaseComponent {
    private static $template: JQuery;

    public constructor(public $component: JQuery) {
        super($component);

        var self = this;
        $component.removeClass('hide');
        $component.addClass('fade');

        setTimeout(function () {
            self.$component.removeClass('fade');
        }, 50);

        $component.click(function (e) {
            var $target = $(e.target);

            if ($target.hasClass('overlay')) {
                new CloseAction(null, self);
            }
        });
    }

    static new(): IComponent {
        var $overlay = Overlay.$template.clone();
        $('body').append($overlay);
        cystem.apply($overlay);

        return $overlay.getComponent().getChildren()[0];
    }

    public getType(): ComponentType {
        return ComponentType.OVERLAY;
    }

    public getState(): object {
        var childstate: object[] = [];
        for (var child of this.children) {
            childstate.push(child.getState());
        }

        return { type: 'overlay', components: childstate };
    }

    public close(silent: boolean = false): void {
        var self = this;
        if (this.$component.hasClass('fade')) return;

        this.$component.addClass('fade');
        //this._helper.moveParents(this, 'right');

        var mainComponent: IComponent = cystem.page.getMainComponent();
        var url: string = mainComponent.$component.find(CONTENT_SELECTOR).getUrl();

        if (!silent) {
            var history: HistoryAction = new HistoryAction(url);
        }

        setTimeout(function () {
            self.delete();
            HistoryAction.reloadState();
        }, 400);
    }

    public static findTemplate($el: JQuery): void {
        if (!this.$template) {
            var $template = $el.find('.overlay-template');

            if ($template.length) {
                var component: IComponent = $template.findComponent();

                this.$template = $template;
                $template.removeClass('overlay-template');
                $template.detach();

                component.delete();
            }
        }
    }
}

class Modal extends BaseComponent {
    private static $template: JQuery;

    public constructor(public $component: JQuery) {
        super($component);
    }

    public getType(): ComponentType {
        return ComponentType.MODAL;
    }

    static new(): IComponent {
        var $overlay = Modal.$template.clone();
        $('body').append($overlay);
        cystem.apply($overlay);

        return $overlay.getComponent();
    }

    public getState(): object {
        var childstate: object[] = [];
        for (var child of this.children) {
            childstate.push(child.getState());
        }

        return { type: 'overlay', components: childstate };
    }

    public close(): void {
        this.delete();
    }

    public static findTemplate($el: JQuery): void {
        if (!this.$template) {
            var $template = $el.find('.modal-template');

            if ($template.length) {
                var component: IComponent = $template.findComponent();

                this.$template = $template;
                $template.removeClass('modal-template');
                $template.detach();

                component.delete();
            }
        }
    }
}