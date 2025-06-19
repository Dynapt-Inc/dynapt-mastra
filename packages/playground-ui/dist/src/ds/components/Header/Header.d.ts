import { default as React } from '../../../../node_modules/@types/react';

export interface HeaderProps {
    children?: React.ReactNode;
    border?: boolean;
}
export declare const Header: ({ children, border }: HeaderProps) => import("react/jsx-runtime").JSX.Element;
export declare const HeaderTitle: ({ children }: HeaderProps) => import("react/jsx-runtime").JSX.Element;
export declare const HeaderAction: ({ children }: HeaderProps) => import("react/jsx-runtime").JSX.Element;
export declare const HeaderGroup: ({ children }: HeaderProps) => import("react/jsx-runtime").JSX.Element;
