class LinkAction implements IAction {
    constructor(private $el: JQuery) {
        var self = this;

        $el.click(function () {
            var method: Method = self.getMethod($el);
            var loadAction: LoadAction = new LoadAction($el, method);
            return false;
        });
    }

    getMethod($el: JQuery): Method {
        return Method.GET;
    }
}