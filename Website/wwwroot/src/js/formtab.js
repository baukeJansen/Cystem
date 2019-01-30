var Formtab = (function () {
    function Formtab() {
    }
    Formtab.prototype.bind = function (el) {
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
    ;
    return Formtab;
}());
//# sourceMappingURL=formtab.js.map