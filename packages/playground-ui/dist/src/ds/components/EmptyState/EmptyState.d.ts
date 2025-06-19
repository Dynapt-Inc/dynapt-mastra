import { ElementType, ReactNode } from '../../../../node_modules/@types/react';

export interface EmptyStateProps {
    as?: ElementType;
    iconSlot: ReactNode;
    titleSlot: ReactNode;
    descriptionSlot: ReactNode;
    actionSlot: ReactNode;
}
export declare const EmptyState: ({ iconSlot, titleSlot, descriptionSlot, actionSlot, as: Component, }: EmptyStateProps) => import("react/jsx-runtime").JSX.Element;
