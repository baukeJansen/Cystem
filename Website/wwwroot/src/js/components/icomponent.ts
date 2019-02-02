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
    clearContent(): void;
    delete(): void;
    setContent($content: JQuery): void;
    close(silent?: boolean): void;
}