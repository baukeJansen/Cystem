class LinkAction implements IAction {
    constructor(private $el: JQuery) {
        var self = this;

        $el.click(function () {
            var action: ComponentAction = $el.getAction();

            switch (action) {
                case ComponentAction.CLOSE:
                    new CloseAction($el);
                    break;
                case ComponentAction.NONE: break;
                case ComponentAction.LOAD:
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