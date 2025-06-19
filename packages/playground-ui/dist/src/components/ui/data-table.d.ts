import { ColumnDef as ReactTableColumnDef } from '@tanstack/react-table';
import { PaginationResult } from '../../lib/pagination/types';

export interface DataTableProps<TData, TValue> {
    /**
     * table columns
     */
    columns: ReactTableColumnDef<TData, TValue>[];
    /**
     * table data
     */
    data: TData[];
    pagination?: PaginationResult;
    /**
     * goto next page
     */
    gotoNextPage?: () => void;
    /**
     * goto previous page
     */
    gotoPreviousPage?: () => void;
    /**
     * get the row id
     */
    getRowId?: (row: TData) => string;
    /**
     * selected row id to use for row selection
     */
    selectedRowId?: string;
    /**
     * loading state
     */
    isLoading?: boolean;
    /**
     * text to display when there are no results
     */
    emptyText?: string;
    onClick?: (row: TData) => void;
}
export declare const DataTable: <TData, TValue>({ columns, data, pagination, gotoNextPage, gotoPreviousPage, getRowId, selectedRowId, isLoading, emptyText, onClick, }: DataTableProps<TData, TValue>) => import("react/jsx-runtime").JSX.Element;
