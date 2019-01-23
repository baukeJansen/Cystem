class Map<T> {
    private items: { [key: string]: T };

    constructor() {
        this.items = {};
    }

    add(key: string, value: T): void {
        this.items[key] = value;
    }

    has(key: string): boolean {
        return key in this.items;
    }

    get(key: string): T {
        return this.items[key];
    }

    getValues(): T[] {
        var items: T[] = [];


        for (var item in this.items) {
            items.push(this.items[item]);
        }

        return items;
    }
}