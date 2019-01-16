interface IService {
    Name: ServiceName;
    construct(serviceManager: IServiceManager): void
    bind(el: HTMLElement): void;
}