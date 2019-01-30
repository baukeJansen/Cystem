class SubmitAction implements IAction {
    public component: Component = null;
    private formComponent: FormComponent;

    constructor(private $el: JQuery) {
        var self = this;

        $el.click(function () {
            self.component = $el.findComponent();
            self.formComponent = $el.getFormComponent();
            self.formComponent.send();

            var method: Method = self.formComponent.getMethod();
            var url = self.formComponent.getUrl();
            var data = self.formComponent.getData();

            var ajax = new AjaxAction(method, url, data);

            //ajax.send(self.onResult, self);
            ajax.send2(function () {
                self.succes.call(self);
            }, function () {
                self.error.call(self);
            });

            return false;
        });
    }

    succes(response: string): void {
        var self = this;
        var parentComponent: Component = $.getParentComponent(this.component);

        this.formComponent.succes();

        new ReloadAction(parentComponent);

        setTimeout(function () {
            new CloseAction(self.$el);
        }, 500);
    }

    error(message: string): void {
        this.formComponent.error($(message));
    }
}