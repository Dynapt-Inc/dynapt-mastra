import { default as React } from '../../../../node_modules/@types/react';
import { FontSizes } from '../../tokens';

export interface TxtProps extends React.HTMLAttributes<HTMLDivElement | HTMLLabelElement> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label';
    variant?: keyof typeof FontSizes;
    font?: 'mono';
    htmlFor?: string;
    className?: string;
    children?: React.ReactNode;
}
export declare const Txt: ({ as: Root, className, variant, font, ...props }: TxtProps) => import("react/jsx-runtime").JSX.Element;
