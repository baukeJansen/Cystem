namespace ServiceManager {
    type Constructor<T> = {
        new(...args: any[]): T;
        readonly prototype: T;
    }

    const services: Map<IService> = new Map();

    export function get(key: Service): IService {
        return services.get(key.toString());
    }

    export function getAll(): IService[] {
        return services.getValues();
    }

    export function register<T extends Constructor<IService>>(key: Service) {
        return (ctor: T) => {
            services.add(key.toString(), new ctor());
        }
    }
}