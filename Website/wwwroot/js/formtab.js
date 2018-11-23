(function (global, $) {
    var formtab;
    var Formtab = function () {

    };

    Formtab.prototype.init = function (el) {
        var $formtabs = $(el).find('.tabs.formtab');

        $formtabs.each(function (_, tabWrapper) {
            var $tabs = $(tabWrapper).find('.tab');

            $tabs.click(function () {
                var $tab = $(this);
                $tab.find('input[type="radio"]').prop('checked', true);
            });
        });
    };

    formtab = new Formtab();
    global.Cystem.register('Formtab', formtab, formtab.init);
})(window, jQuery);