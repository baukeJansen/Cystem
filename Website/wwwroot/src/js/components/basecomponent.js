var COMPONENT_SELECTOR = '.component';
var CONTENT_SELECTOR = '.content';
var COMPONENT_DATA = 'component';
var BaseComponent = (function () {
    function BaseComponent($component) {
        this.$component = $component;
        this.children = [];
        this.resultAction = null;
        $component.setComponent(this);
        this.parent = this.findParent($component);
        if (this.parent) {
            this.parent.addChild(this);
        }
        this.url = $component.find(CONTENT_SELECTOR).getUrl();
    }
    BaseComponent.prototype.setState = function (state) {
        for (var i = 0; i < this.children.length || i < state.components.length; i++) {
            var child = this.children[i];
            var childState = state.components[i];
            if (!child) {
                switch (childState.type) {
                    case ComponentType.OVERLAY:
                        var overlay = Overlay.new();
                        overlay.setState(childState.components[0]);
                        break;
                    case ComponentType.MODAL:
                        var modal = Modal.new();
                        modal.setState(childState.components[0]);
                        break;
                }
            }
            else if (!childState) {
                child.close(true);
            }
            else if (child.getType() != childState.type) {
                console.error('missing - set state - replace');
            }
            else {
                child.setState(childState);
            }
        }
    };
    BaseComponent.prototype.findParent = function ($component) {
        var $parent = $component.parent().closest(COMPONENT_SELECTOR + ', body');
        return $parent.getComponent();
    };
    BaseComponent.prototype.getTargetComponent = function (actionTarget) {
        if (actionTarget === void 0) { actionTarget = null; }
        if (!actionTarget) {
            actionTarget = this.$component.getTarget();
        }
        switch (actionTarget) {
            case ComponentType.MAIN: return cystem.page.getMainComponent();
            case ComponentType.PARENT: return this.parent;
            case ComponentType.OVERLAY: return Overlay.new();
            case ComponentType.MODAL: return Modal.new();
            case ComponentType.SELF:
            default:
                return this;
        }
    };
    BaseComponent.prototype.addChild = function (component) {
        this.children.push(component);
    };
    BaseComponent.prototype.removeChild = function (component) {
        this.children.splice(this.children.indexOf(component), 1);
    };
    BaseComponent.prototype.getChildren = function () {
        return this.children;
    };
    BaseComponent.prototype.getParent = function () {
        return this.parent;
    };
    BaseComponent.prototype.clearContent = function () {
        var self = this;
        this.$component.addClass('loading');
        this.children = [];
        var $children = this.$component.children();
        new FadeOutAnimation(this.$component, $children, function () {
            $children.remove();
        });
    };
    BaseComponent.prototype.setContent = function ($content) {
        this.$component.removeClass('loading');
        this.$component.append($content);
        new FadeInAnimation(this.$component, $content);
    };
    BaseComponent.prototype.onResultAction = function (fn) {
        this.resultAction = fn;
    };
    BaseComponent.prototype.onResult = function (result) {
        if (this.resultAction) {
            this.resultAction(result);
        }
        else {
            if (this.parent) {
                this.parent.onResult(result);
            }
        }
    };
    BaseComponent.prototype.close = function () {
        this.parent.close();
    };
    BaseComponent.prototype.delete = function () {
        this.$component.remove();
        this.parent.removeChild(this);
    };
    return BaseComponent;
}());
//# sourceMappingURL=basecomponent.js.map