var SubmitAnimation = (function () {
    function SubmitAnimation($wrapper, $content, fnReady) {
        $wrapper.css({ width: $wrapper.outerWidth(), height: $wrapper.outerHeight() });
        $wrapper.addClass('loading');
        $content.addClass('send');
        setTimeout(function () {
            $content.remove();
            if (fnReady) {
                fnReady();
            }
        }, 1000);
    }
    return SubmitAnimation;
}());
//# sourceMappingURL=submitanimation.js.map