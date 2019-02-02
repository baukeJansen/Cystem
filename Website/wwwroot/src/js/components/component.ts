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

            var $content = $('<div class="content" data-url="' + state.url + '" data-action="' + ComponentAction.LOADSILENT + '" data-target="' + ComponentType.SELF + '"></div>');
            this.setContent($content);
            new LoadAction($content);
        }

        super.setState(state);
    }
}