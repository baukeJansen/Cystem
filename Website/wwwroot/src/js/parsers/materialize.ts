//@ParserManager.register(Service.Load)
@ServiceManager.register(Service.Load)
class Materialize {
    parse(component: Component, element: HTMLElement) {
        console.log('x');
        /*
        var registry = {
            Autocomplete: {
                el: element.querySelectorAll('.autocomplete:not(.no-autoinit)'), config: {}
            },
            Carousel: {
                el: element.querySelectorAll('.carousel:not(.no-autoinit)'), config: {}
            },
            Chips: {
                el: element.querySelectorAll('.chips:not(.no-autoinit)'), config: {}
            },
            Collapsible: {
                el: element.querySelectorAll('.collapsible:not(.no-autoinit)'), config: {}
            },
            Datepicker: {
                el: element.querySelectorAll('.datepicker:not(.no-autoinit)'), config: { format: "dd-mm-yyyy", autoClose: true }
            },
            Dropdown: {
                el: element.querySelectorAll('.dropdown-trigger:not(.no-autoinit)'), config: {}
            },
            Materialbox: {
                el: element.querySelectorAll('.materialboxed:not(.no-autoinit)'), config: {}
            },
            //Modal: {
            //    el: root.querySelectorAll('.modal:not(.no-autoinit)'), config: {}
            //},
            Parallax: {
                el: element.querySelectorAll('.parallax:not(.no-autoinit)'), config: {}
            },
            Pushpin: {
                el: element.querySelectorAll('.pushpin:not(.no-autoinit)'), config: {}
            },
            ScrollSpy: {
                el: element.querySelectorAll('.scrollspy:not(.no-autoinit)'), config: {}
            },
            FormSelect: {
                el: element.querySelectorAll('select:not(.no-autoinit)'), config: {}
            },
            Sidenav: {
                el: element.querySelectorAll('.sidenav:not(.no-autoinit)'), config: {}
            },
            Tabs: {
                el: element.querySelectorAll('.tabs:not(.no-autoinit)'), config: {}
            },
            TapTarget: {
                el: element.querySelectorAll('.tap-target:not(.no-autoinit)'), config: {}
            },
            Timepicker: {
                el: element.querySelectorAll('.timepicker:not(.no-autoinit)'), config: {}
            },
            Tooltip: {
                el: element.querySelectorAll('.tooltipped:not(.no-autoinit)'), config: {}
            }//,
            //FloatingActionButton: {
            //    el: root.querySelectorAll('.fixed-action-btn:not(.no-autoinit)'), config: {}
            //}
        };

        for (var pluginName in registry) {
            var plugin = M[pluginName];
            plugin.init(registry[pluginName].el, registry[pluginName].config);
        }

        // Update textfields
        M.updateTextFields();

        // Close menu on link click
        $(element).find('#nav-mobile a').click(function () {
            // @ts-ignore
            $('#nav-mobile').sidenav('close');
        });
        console.log('b');*/
    }
}