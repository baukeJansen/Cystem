class LoadAction implements IAction {
    private component: Component;
    constructor(private $el: JQuery, method: Method = Method.GET) {
        var action: ComponentAction = $el.getAction();

        this.component = $el.findComponent();
        this.component.empty();

        var url = $el.getUrl();
        var data = $el.getData();

        var ajax = new AjaxAction(method, url, data);
        ajax.send(this.onResult, this);

        if (method === Method.GET && action === ComponentAction.LOAD) {
            var target: ComponentType = $el.getTarget();

            var state = {
                target: target
            };
            new HistoryAction(url, state);
            //history.pushState(state, "", url);
        }
    }

    onResult(response) {
        var $response = $(response);
        this.component.load($response);

        cystem.bindActions($response);
    }
}