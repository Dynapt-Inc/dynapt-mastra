import { ElementType } from '../../node_modules/@types/react';

export interface ThreadsProps {
    children: React.ReactNode;
}
export declare const Threads: ({ children }: ThreadsProps) => import("react/jsx-runtime").JSX.Element;
export interface ThreadLinkProps {
    children: React.ReactNode;
    as?: ElementType;
    href?: string;
    className?: string;
    prefetch?: boolean;
    to?: string;
}
export declare const ThreadLink: ({ children, as: Component, href, className, prefetch, to }: ThreadLinkProps) => import("react/jsx-runtime").JSX.Element;
export interface ThreadListProps {
    children: React.ReactNode;
}
export declare const ThreadList: ({ children }: ThreadListProps) => import("react/jsx-runtime").JSX.Element;
export interface ThreadItemProps {
    children: React.ReactNode;
    isActive?: boolean;
}
export declare const ThreadItem: ({ children, isActive }: ThreadItemProps) => import("react/jsx-runtime").JSX.Element;
export interface ThreadDeleteButtonProps {
    onClick: () => void;
}
export declare const ThreadDeleteButton: ({ onClick }: ThreadDeleteButtonProps) => import("react/jsx-runtime").JSX.Element;
