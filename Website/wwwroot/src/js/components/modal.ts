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