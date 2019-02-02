var Formtab1 = (function () {
    function Formtab1() {
    }
    Formtab1.prototype.bind = function (el) {
        var self = this;
        var $formtabs = $(el).find('.tabs.formtab');
        $formtabs.each(function (_, tabWrapper) {
            var $tabs = $(tabWrapper).find('.tab');
            self.targetInputs($tabs);
            $tabs.click(function () {
                var $tab = $(this);
                $tab.find('input[type="radio"]').prop('checked', true);
                self.targetInputs($tabs);
            });
        });
    };
    Formtab1.prototype.targetInputs = function ($tabs) {
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
    ;
    return Formtab1;
}());
//# sourceMappingURL=formtab.js.map