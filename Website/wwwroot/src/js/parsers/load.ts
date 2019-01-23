@ParserManager.register(Service.Load)
@ServiceManager.register(Service.Load)
class Load {
    constructor() {
    }

    parse(component: Component, el: HTMLElement) {
        if (el.hasAttribute('data-load')) {
            this.load(component, el);
        }
    }

    load(component: Component, el: HTMLElement) {
        var ajax: Ajax = <Ajax>ServiceManager.get(Service.Ajax);
        var action: Action = new Action(component, $(el), Method.GET);

        ajax.send(component, action);
    }
}