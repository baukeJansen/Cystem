class LinkAction implements IAction {
    constructor(private $el: JQuery) {
        var self = this;

        $el.click(function () {
            var action: ComponentAction = $el.getAction();

            switch (action) {
                case ComponentAction.CLOSE:
                    new CloseAction($el);
                    break;

                case ComponentAction.NONE:
                    break;

                case ComponentAction.SELECT:
                    var method: Method = self.getMethod($el);
                    new LoadAction($el, method, function (component: IComponent) {
                        component.onResultAction(function (result: any) {
                            $el.closest('.select-field').find('input').val(result);
                        });
                    });
                    break;

                case ComponentAction.RESULT:
                    new ResultAction($el);
                    new CloseAction($el);
                    break;

                case ComponentAction.LOAD:
                case ComponentAction.LOADSILENT:
                default:
                    var method: Method = self.getMethod($el);
                    new LoadAction($el, method);
                    break;
            }
            
            return false;
        });
    }

    getMethod($el: JQuery): Method {
        return Method.GET;
    }
}