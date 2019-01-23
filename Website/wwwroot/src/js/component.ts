class Component {
    children: Component[] = [];
    constructor(private parent: Component, private $component: JQuery) {
        $component.children().iterate(this);
    }

    addChild(child: Component) {
        this.children.push(child);
    }

    parse(el: HTMLElement) {
        var parsers: IParser[] = ParserManager.getAll();

        for (var i: number = 0; i < parsers.length; i++) {
            var parser: IParser = parsers[i];
            parser.parse(this, el);
        }
    }

    setContent(content: string) {
        var $content = $(content);
        this.$component.empty();
        this.$component.append($content);

        this.parse($content[0]);
    }
}