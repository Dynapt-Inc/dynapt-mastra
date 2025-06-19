interface PlaygroundStore {
    runtimeContext: Record<string, any>;
    setRuntimeContext: (runtimeContext: Record<string, any>) => void;
}
export declare const usePlaygroundStore: import('zustand').UseBoundStore<Omit<import('zustand').StoreApi<PlaygroundStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<PlaygroundStore, PlaygroundStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: PlaygroundStore) => void) => () => void;
        onFinishHydration: (fn: (state: PlaygroundStore) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<PlaygroundStore, PlaygroundStore>>;
    };
}>;
export {};
