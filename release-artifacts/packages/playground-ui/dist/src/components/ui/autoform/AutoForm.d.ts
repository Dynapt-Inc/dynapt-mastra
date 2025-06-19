import { default as React } from '../../../../node_modules/@types/react';
import { AutoFormProps } from './types';

export declare const ShadcnAutoFormFieldComponents: {
    string: React.FC<import('@autoform/react').AutoFormFieldProps>;
    number: React.FC<import('@autoform/react').AutoFormFieldProps>;
    boolean: React.FC<import('@autoform/react').AutoFormFieldProps>;
    date: React.FC<import('@autoform/react').AutoFormFieldProps>;
    select: React.FC<import('@autoform/react').AutoFormFieldProps>;
    record: React.FC<import('@autoform/react').AutoFormFieldProps>;
};
export type FieldTypes = keyof typeof ShadcnAutoFormFieldComponents;
export declare function AutoForm<T extends Record<string, any>>({ uiComponents, formComponents, readOnly, ...props }: AutoFormProps<T> & {
    readOnly?: boolean;
}): import("react/jsx-runtime").JSX.Element;
