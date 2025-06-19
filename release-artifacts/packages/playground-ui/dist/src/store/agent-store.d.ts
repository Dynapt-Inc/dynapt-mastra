import { ModelSettings } from '../types';

interface AgentStore {
    modelSettings: Record<string, ModelSettings | null>;
    setModelSettings: (modelSettings: Record<string, ModelSettings | null>) => void;
    chatWithGenerate: Record<string, boolean>;
    setChatWithGenerate: (chatWithGenerate: Record<string, boolean>) => void;
}
export declare const useAgentStore: import('zustand').UseBoundStore<Omit<import('zustand').StoreApi<AgentStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<AgentStore, AgentStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AgentStore) => void) => () => void;
        onFinishHydration: (fn: (state: AgentStore) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<AgentStore, AgentStore>>;
    };
}>;
export {};
