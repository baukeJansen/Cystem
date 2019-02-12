interface IComponent {
    $component: JQuery;

    getType(): ComponentType;
    getState(): object;
    setState(state: any): void;
    getTargetComponent(actionTarget?: ComponentType): IComponent;
    addChild(component: IComponent): void;
    removeChild(component: IComponent): void;
    getChildren(): IComponent[];
    getParent(): IComponent;
    setContent($content: JQuery): void;
    clearContent(): void;
    onResultAction(fn: Function): void;
    onResult(result: any): void;
    close(silent?: boolean): void;
    delete(): void;
}