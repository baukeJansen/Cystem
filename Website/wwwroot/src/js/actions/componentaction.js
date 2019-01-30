var ComponentActio = (function () {
    function ComponentActio($component) {
        var component = new Component($component);
        $component.data('component', component);
    }
    return ComponentActio;
}());
//# sourceMappingURL=componentaction.js.map