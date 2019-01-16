var FloatingActionButton = (function () {
    function FloatingActionButton() {
        this.Name = ServiceName.FloatingActionButton;
    }
    FloatingActionButton.prototype.construct = function (serviceManager) {
        this._serviceManager = serviceManager;
    };
    FloatingActionButton.prototype.bind = function (el) {
        var $fabs = $(el).find('.fixed-action-btn');
        $fabs.each(function (_, fab) {
            $(fab).floatingActionButton();
        });
    };
    return FloatingActionButton;
}());
//# sourceMappingURL=floatingactionbutton.js.map