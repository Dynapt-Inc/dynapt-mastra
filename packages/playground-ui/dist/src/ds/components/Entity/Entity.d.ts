export interface EntityProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}
export declare const Entity: ({ children, className, onClick }: EntityProps) => import("react/jsx-runtime").JSX.Element;
export declare const EntityIcon: ({ children, className }: EntityProps) => import("react/jsx-runtime").JSX.Element;
export declare const EntityName: ({ children, className }: EntityProps) => import("react/jsx-runtime").JSX.Element;
export declare const EntityDescription: ({ children, className }: EntityProps) => import("react/jsx-runtime").JSX.Element;
export declare const EntityContent: ({ children, className }: EntityProps) => import("react/jsx-runtime").JSX.Element;
