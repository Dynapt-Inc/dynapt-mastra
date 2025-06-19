import { default as React } from '../../../../node_modules/@types/react';

export interface CellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
    className?: string;
    children: React.ReactNode;
}
export declare const Cell: ({ className, children, ...props }: CellProps) => import("react/jsx-runtime").JSX.Element;
export declare const TxtCell: ({ className, children }: CellProps) => import("react/jsx-runtime").JSX.Element;
export declare const UnitCell: ({ className, children, unit }: CellProps & {
    unit: string;
}) => import("react/jsx-runtime").JSX.Element;
export interface DateTimeCellProps extends Omit<CellProps, 'children'> {
    dateTime: Date;
}
export declare const DateTimeCell: ({ dateTime, ...props }: DateTimeCellProps) => import("react/jsx-runtime").JSX.Element;
export interface EntryCellProps extends Omit<CellProps, 'children'> {
    name: React.ReactNode;
    description?: React.ReactNode;
    icon: React.ReactNode;
    meta?: React.ReactNode;
}
export declare const EntryCell: ({ name, description, icon, meta, ...props }: EntryCellProps) => import("react/jsx-runtime").JSX.Element;
