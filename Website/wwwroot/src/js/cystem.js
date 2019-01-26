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
        var materialize = new Materialize();
        materialize.bind($el[0]);
    };
    Cystem.prototype.getComponent = function ($component) {
        return new Component($component);
    };
    return Cystem;
}());
//# sourceMappingURL=cystem.js.map