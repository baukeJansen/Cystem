/*class Formtab {
    Name: ServiceName = ServiceName.Formtab;
    private $modal: JQuery;

    private _serviceManager: IServiceManager;

    constructor() {

    }

    construct(serviceManager: IServiceManager) {
        this._serviceManager = serviceManager;
    }

    bind(el: HTMLElement): void {
        var self: Formtab = this;
        var $formtabs: JQuery = $(el).find('.tabs.formtab');

        $formtabs.each(function (_, tabWrapper) {
            var $tabs = $(tabWrapper).find('.tab');

            self.targetInputs($tabs);

            $tabs.click(function () {
                var $tab = $(this);
                $tab.find('input[type="radio"]').prop('checked', true);

                self.targetInputs($tabs);
            });
        });
    }

    targetInputs($tabs: JQuery): void {
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
}*/