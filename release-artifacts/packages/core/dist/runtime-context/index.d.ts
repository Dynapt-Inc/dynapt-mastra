type RecordToTuple<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];
declare class RuntimeContext<Values extends Record<string, any> | unknown = unknown> {
    private registry;
    constructor(iterable?: Values extends Record<string, any> ? RecordToTuple<Partial<Values>> : Iterable<readonly [string, unknown]>);
    /**
     * set a value with strict typing if `Values` is a Record and the key exists in it.
     */
    set<K extends Values extends Record<string, any> ? keyof Values : string>(key: K, value: Values extends Record<string, any> ? (K extends keyof Values ? Values[K] : never) : unknown): void;
    /**
     * Get a value with its type
     */
    get<K extends Values extends Record<string, any> ? keyof Values : string, R = Values extends Record<string, any> ? (K extends keyof Values ? Values[K] : never) : unknown>(key: K): R;
    /**
     * Check if a key exists in the container
     */
    has<K extends Values extends Record<string, any> ? keyof Values : string>(key: K): boolean;
    /**
     * Delete a value by key
     */
    delete<K extends Values extends Record<string, any> ? keyof Values : string>(key: K): boolean;
    /**
     * Clear all values from the container
     */
    clear(): void;
    /**
     * Get all keys in the container
     */
    keys<R = Values extends Record<string, any> ? keyof Values : string>(): IterableIterator<R>;
    /**
     * Get all values in the container
     */
    values<R = Values extends Record<string, any> ? Values[keyof Values] : unknown>(): IterableIterator<R>;
    /**
     * Get all entries in the container
     */
    entries<R = Values extends Record<string, any> ? Values[keyof Values] : unknown>(): IterableIterator<[
        string,
        R
    ]>;
    /**
     * Get the size of the container
     */
    size(): number;
    /**
     * Execute a function for each entry in the container
     */
    forEach<T = any>(callbackfn: (value: T, key: string, map: Map<string, any>) => void): void;
}

export { RuntimeContext };
