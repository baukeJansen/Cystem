var FormComponent = (function () {
    function FormComponent($form) {
        this.$form = $form;
        $form.data('component', this);
    }
    FormComponent.prototype.send = function () {
        var $formContent = this.$form.find('> .form-content');
        new SubmitAnimation(this.$form, $formContent);
    };
    FormComponent.prototype.succes = function () {
        this.$form.removeClass('loading').addClass('succes');
    };
    FormComponent.prototype.error = function (message) {
        this.$form.removeClass('loading').addClass('error');
        new FadeInAnimation(this.$form, message);
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