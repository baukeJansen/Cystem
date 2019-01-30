class PopstateAction {
    component: Component;

    constructor() {
        var self = this;
        window.onpopstate = function (e) { self.onPopState.call(self, e); };

        this.component = $.getMainComponent();
    }

    onPopState(event): void {
        var self = this;
        var url = document.location.href;
        var state = event.state || {};
        console.log(event);
        var previousState: any = event.originalEvent.state;

        switch (previousState.target) {
            case ComponentType.OVERLAY:
                new CloseAction(null, $('.overlay-wrapper').last().data('component'));
                break;
        }

        var data = {
            CurrentLayout: $("#Layout").val(),
            Layout: "AjaxLayout"
        };

        var ajax = new AjaxAction(Method.GET, url, data);

        switch (state.target) {
            case ComponentType.OVERLAY:
                var overlay: Component = $.createOverlayComponent();

                ajax.send2(function (response: string) {
                    self.succes.call(self, response, overlay);
                });
                break;

            default:
                self.component.empty();

                ajax.send2(function (response: string) {
                    self.succes.call(self, response, self.component);
                });
                break;
        }
    }

    succes(response: string, component: Component) {
        var $response = $(response);
        component.load($response);

        cystem.bindActions($response);
    }
}