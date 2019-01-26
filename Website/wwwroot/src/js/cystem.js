var Cystem = (function () {
    function Cystem() {
        this.parsers = [];
        this.bindActions($('body'));
    }
    Cystem.prototype.bindActions = function ($el) {
        $el.find('.load').each(function (_, el) {
            var action = new LoadAction($(el));
        });
    };
    Cystem.prototype.getComponent = function ($component) {
        return new Component($component);
    };
    return Cystem;
}());
//# sourceMappingURL=cystem.js.map