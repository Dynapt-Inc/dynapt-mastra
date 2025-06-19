import { ReactNode } from '../../../node_modules/@types/react';
import { ModelSettings } from '../../types';

type NetworkContextType = {
    modelSettings: ModelSettings;
    setModelSettings: React.Dispatch<React.SetStateAction<ModelSettings>>;
    resetModelSettings: () => void;
};
export declare const NetworkContext: import('../../../node_modules/@types/react').Context<NetworkContextType>;
export declare function NetworkProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
