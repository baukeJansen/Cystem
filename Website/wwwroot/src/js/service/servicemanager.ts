class ServiceManager implements IServiceManager{
    private _services: IService[] = [];

    register<T extends IService>(r: new (cystem: IServiceManager) => T): void {
        var registerable: T = new r(this);
        this._services[registerable.Name] = registerable;
    }

    get<T extends IService>(r: new () => T): T {
        var registerable: T = new r();
        var o: T = <T>this._services[registerable.Name];
        return o;
    }

    getServices(): IService[] {
        return this._services;
    }

    init(): void {
        for(var service of this._services) {
            service.construct(this);
        }
    }
}

var serviceManager: ServiceManager = new ServiceManager();
serviceManager.register(Cystem);
serviceManager.register(Navigate);
serviceManager.register(OverlayHelper);
serviceManager.register(ModalHelper);
serviceManager.register(Materialize);
serviceManager.register(Graph);
serviceManager.register(Formtab);
serviceManager.register(FloatingActionButton);
serviceManager.init();

var cystem: Cystem = serviceManager.get(Cystem);
cystem.bindNew(document.body);