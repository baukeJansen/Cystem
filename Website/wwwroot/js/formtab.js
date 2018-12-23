(function (global, $) {
    var formtab;
    var Formtab = function () {

    };

    Formtab.prototype.init = function (el) {
        var $formtabs = $(el).find('.tabs.formtab');

        $formtabs.each(function (_, tabWrapper) {
            var $tabs = $(tabWrapper).find('.tab');

            formtab.targetInputs($tabs);

            $tabs.click(function () {
                var $tab = $(this);
                $tab.find('input[type="radio"]').prop('checked', true);

                formtab.targetInputs($tabs);
            });
        });
    };

    Formtab.prototype.targetInputs = function ($tabs) {
        setTimeout(function () {
            var $selectedTab = $tabs.has('a.active');

            $tabs.not($selectedTab).each(function (index, tab) {
                var target = $(tab).find('a').attr('href');
                var $inputs = $(target).find('input');
                $inputs.prop('disabled', 'disabled');
            });

        
            var target = $selectedTab.find('a').attr('href');
            var $inputs = $(target).find('input');
            $inputs.removeAttr('disabled');
        }, 1);
    };

    formtab = new Formtab();
    global.Cystem.register('Formtab', formtab, formtab.init);
})(window, jQuery);