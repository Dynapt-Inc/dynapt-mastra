import { default as z } from 'zod';

interface DynamicFormProps<T extends z.ZodSchema> {
    schema: T;
    onSubmit?: (values: z.infer<T>) => void | Promise<void>;
    defaultValues?: z.infer<T>;
    isSubmitLoading?: boolean;
    submitButtonLabel?: string;
    className?: string;
    readOnly?: boolean;
}
export declare function DynamicForm<T extends z.ZodSchema>({ schema, onSubmit, defaultValues, isSubmitLoading, submitButtonLabel, className, readOnly, }: DynamicFormProps<T>): import("react/jsx-runtime").JSX.Element | null;
export {};
