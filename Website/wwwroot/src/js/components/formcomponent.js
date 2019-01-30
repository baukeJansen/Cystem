var FormComponent = (function () {
    function FormComponent($form) {
        this.$form = $form;
        $form.data('component', this);
    }
    FormComponent.prototype.send = function () {
        this.$form.css({ width: this.$form.outerWidth(), height: this.$form.outerHeight() });
        this.$form.addClass('loading');
        var $content = this.$form.find('> .form-content');
        $content.addClass('send');
    };
    FormComponent.prototype.succes = function () {
        this.$form.removeClass('loading').addClass('succes');
    };
    FormComponent.prototype.error = function (message) {
        this.$form.removeClass('loading').addClass('error');
        this.$form.empty().append($(message));
    };
    FormComponent.prototype.getMethod = function () {
        var method = this.$form.attr('method').toLowerCase();
        var resultKey = method.toUpperCase();
        return Method[resultKey];
    };
    FormComponent.prototype.getUrl = function () {
        return this.$form.attr('action');
    };
    FormComponent.prototype.getData = function () {
        return this.$form.serialize();
    };
    return FormComponent;
}());
//# sourceMappingURL=formcomponent.js.map