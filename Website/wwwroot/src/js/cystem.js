var Cystem = (function () {
    function Cystem() {
        this.parsers = [];
        this.bindActions($('body'));
    }
    Cystem.prototype.bindActions = function ($el) {
        $el.find('.load').each(function (_, el) {
            var action = new LoadAction($(el));
        });
        $el.find('.ajax-get, .ajax-post, .ajax-delete, .link').each(function (_, el) {
            var action = new LinkAction($(el));
        });
        var materialize = new Materialize($el[0]);
        var popstateAction = new PopstateAction();
        $el.find('.fixed-action-btn').each(function (_, el) {
            var fab = new FloatingActionButton($(el));
        });
    };
    return Cystem;
}());
//# sourceMappingURL=cystem.js.map