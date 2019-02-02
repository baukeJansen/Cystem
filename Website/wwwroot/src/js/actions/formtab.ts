class Formtab {
    constructor($formtab: JQuery) {
        var self: Formtab = this;
        var $tabs = $formtab.find('.tab');

        self.targetInputs($tabs);

        $tabs.click(function () {
            var $tab = $(this);
            $tab.find('input[type="radio"]').prop('checked', true);

            self.targetInputs($tabs);
        });
    }

    targetInputs($tabs: JQuery): void {
        setTimeout(function () {
            var $selectedTab = $tabs.has('a.active');

            $tabs.not($selectedTab).each(function (_, tab) {
                var target = $(tab).find('a').attr('href');
                var $inputs = $(target).find('input');
                $inputs.prop('disabled', 'disabled');
            });

            var target = $selectedTab.find('a').attr('href');
            var $inputs = $(target).find('input');
            $inputs.removeAttr('disabled');
        }, 1);
    };
}