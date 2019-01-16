//declare var M: any;

(function (global, $) {
    var materialize;
    var Materialize = function () {

    };

    // Materialize => M.AutoInit() with additional config
    Materialize.prototype.init = function (context) {
        // Use document.body if no context is given
        var root = !!context ? context : document.body;

        var registry = {
            Autocomplete: {
                el: root.querySelectorAll('.autocomplete:not(.no-autoinit)'), config: {}
            },
            Carousel: {
                el: root.querySelectorAll('.carousel:not(.no-autoinit)'), config: {}
            },
            Chips: {
                el: root.querySelectorAll('.chips:not(.no-autoinit)'), config: {}
            },
            Collapsible: {
                el: root.querySelectorAll('.collapsible:not(.no-autoinit)'), config: {}
            },
            Datepicker: {
                el: root.querySelectorAll('.datepicker:not(.no-autoinit)'), config: { format: "dd-mm-yyyy", autoClose: true }
            },
            Dropdown: {
                el: root.querySelectorAll('.dropdown-trigger:not(.no-autoinit)'), config: {}
            },
            Materialbox: {
                el: root.querySelectorAll('.materialboxed:not(.no-autoinit)'), config: {}
            },
            Modal: {
                el: root.querySelectorAll('.modal:not(.no-autoinit)'), config: {}
            },
            Parallax: {
                el: root.querySelectorAll('.parallax:not(.no-autoinit)'), config: {}
            },
            Pushpin: {
                el: root.querySelectorAll('.pushpin:not(.no-autoinit)'), config: {}
            },
            ScrollSpy: {
                el: root.querySelectorAll('.scrollspy:not(.no-autoinit)'), config: {}
            },
            FormSelect: {
                el: root.querySelectorAll('select:not(.no-autoinit)'), config: {}
            },
            Sidenav: {
                el: root.querySelectorAll('.sidenav:not(.no-autoinit)'), config: {}
            },
            Tabs: {
                el: root.querySelectorAll('.tabs:not(.no-autoinit)'), config: {}
            },
            TapTarget: {
                el: root.querySelectorAll('.tap-target:not(.no-autoinit)'), config: {}
            },
            Timepicker: {
                el: root.querySelectorAll('.timepicker:not(.no-autoinit)'), config: {}
            },
            Tooltip: {
                el: root.querySelectorAll('.tooltipped:not(.no-autoinit)'), config: {}
            },
            FloatingActionButton: {
                el: root.querySelectorAll('.fixed-action-btn:not(.no-autoinit)'), config: {}
            }
        };

        for (var pluginName in registry) {
            var plugin = M[pluginName];
            plugin.init(registry[pluginName].el, registry[pluginName].config);
        }

        // Update textfields
        M.updateTextFields();

        // Close menu on link click
        $(root).find('#nav-mobile a').click(function () {
            // @ts-ignore
            $('#nav-mobile').sidenav('close');
        });
    };

    materialize = new Materialize();

    global.Cystem.register('Materialize', materialize, materialize.init);
})(this, jQuery);