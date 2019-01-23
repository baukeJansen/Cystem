namespace ParserManager {
    type Constructor<T> = {
        new(...args: any[]): T;
        readonly prototype: T;
    }

    const parser: Map<IParser> = new Map();

    export function get(key: Service): IParser {
        return parser.get(key.toString());
    }

    export function getAll(): IParser[] {
        return parser.getValues();
    }

    export function register<T extends Constructor<IParser>>(key: Service) {
        return (ctor: T) => {
            parser.add(key.toString(), <IParser>ServiceManager.get(key));
        }
    }
}