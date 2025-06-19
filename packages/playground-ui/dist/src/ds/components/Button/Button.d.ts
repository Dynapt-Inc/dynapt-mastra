import { default as React } from '../../../../node_modules/@types/react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    as?: React.ElementType;
    className?: string;
    href?: string;
    to?: string;
    prefetch?: boolean | null;
    children: React.ReactNode;
    size?: 'md' | 'lg';
    variant?: 'default' | 'light';
}
export declare const Button: ({ className, as, size, variant, ...props }: ButtonProps) => import("react/jsx-runtime").JSX.Element;
