var KeyActions = (function () {
    function KeyActions() {
        var press = false;
        $(document).keydown(function (e) {
            if (e.which === 17 && !press) {
                press = true;
                $('.component').addClass('show');
            }
        }).keyup(function (e) {
            if (e.which === 17) {
                press = false;
                $('.component').removeClass('show');
            }
        });
    }
    return KeyActions;
}());
//# sourceMappingURL=keyactions.js.map