class Cystem implements IService {
    Name: ServiceName = ServiceName.Cystem;
    private _serviceManager: IServiceManager;

    constructor() {
    }

    construct(serviceManager: IServiceManager) {
        this._serviceManager = serviceManager;
    }

    bindNew(el: HTMLElement): void {
        var services: IService[] = this._serviceManager.getServices();

        for (var service of services) {
            service.bind(el);
        }
    }

    bind(el: HTMLElement): void {
    }
}