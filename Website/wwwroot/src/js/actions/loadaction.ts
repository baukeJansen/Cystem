﻿class LoadAction implements IAction {
    private component: IComponent;

    constructor(private $el: JQuery, method: Method = Method.GET, private fnSucces?: Function) {
        var self = this;
        var action: ComponentAction = $el.getAction();
        var target: ComponentType = $el.getTarget();

        this.component = $el.findComponent().getTargetComponent(target);
        this.component.clearContent();

        var url = $el.getUrl();
        var data = $el.getData();

        var history: HistoryAction = null;

        if (method === Method.GET && action === ComponentAction.LOAD) {
            history = new HistoryAction(url);
        }

        var ajax = new AjaxAction(method, url, data);
        ajax.send(function (response: any) { self.succes.call(self, response, history) });
    }

    succes(response: any, history: HistoryAction) {
        var $response = $(response);
        this.component.setContent($response);

        if (this.fnSucces) {
            this.fnSucces(this.component);
        }

        cystem.apply($response);
        HistoryAction.reloadState();
    }
}