class ComponentActio {
    constructor($component: JQuery) {
        //var type: ComponentType = $component.getType();
        var component: Component2 = new Component2($component);

        /*switch (type) {
            //case ComponentType.MAIN: component = new Component($component); break;
            //case ComponentType.OVERLAY: component = new OverlayComponent($component); break;
            //case ComponentType.MODAL: component = new ModalComponent($component); break;
            default: component = new Component($component); break;
        }*/

        $component.data('component', component);
    }
}