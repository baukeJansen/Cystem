interface IServiceManager {
    register<T extends IService>(r: new (serviceManager: IServiceManager) => T);
    get<T extends IService>(r: new (serviceManager: IServiceManager) => T): T;
    getServices(): IService[];
}