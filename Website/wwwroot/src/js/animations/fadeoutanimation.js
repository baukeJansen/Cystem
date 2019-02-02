var FadeOutAnimation = (function () {
    function FadeOutAnimation($wrapper, $content, fnReady) {
        $wrapper.css({ height: $content.outerHeight() });
        $content.addClass('fade-out');
        setTimeout(function () {
            if (fnReady) {
                fnReady();
            }
        }, 500);
    }
    return FadeOutAnimation;
}());
//# sourceMappingURL=fadeoutanimation.js.map