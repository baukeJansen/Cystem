class PopstateAction {
    component: Component;

    constructor() {
        var self = this;
        window.onpopstate = function (e) { self.onPopState.call(self, e); };

        this.component = $.getMainComponent();
    }

    onPopState(event): void {
        var url = document.location.href;
        var state = event.state || {};
        var data = {
            CurrentLayout: $("#Layout").val(),
            Layout: "AjaxLayout"
        };

        //console.log(this._currentUrl, url);
        this.component.unloadContent();

        var ajax = new AjaxAction(Method.GET, url, data, state.actionResult || ActionResult.DISPLAY);
        ajax.send(this.onResult, this);
    }

    onResult(response) {
        var $response = $(response);
        this.component.loadContent($response);

        cystem.bindActions($response);
    }
}