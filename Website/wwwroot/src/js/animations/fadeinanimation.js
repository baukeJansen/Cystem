var FadeInAnimation = (function () {
    function FadeInAnimation($wrapper, $content, fnReady) {
        $content.addClass('fade-in');
        $wrapper.css({ height: $content.outerHeight() });
        setTimeout(function () {
            $content.removeClass('fade-in');
            $wrapper.css({ height: 'auto' });
            if (fnReady) {
                fnReady();
            }
        }, 300);
    }
    return FadeInAnimation;
}());
//# sourceMappingURL=fadeinanimation.js.map