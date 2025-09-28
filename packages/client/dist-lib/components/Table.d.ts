import React from 'react';
export interface TableColumn<T = any> {
    key: string;
    title: string;
    dataIndex?: keyof T;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    className?: string;
}
export interface TableProps<T = any> {
    columns: TableColumn<T>[];
    dataSource: T[];
    loading?: boolean;
    bordered?: boolean;
    striped?: boolean;
    hoverable?: boolean;
    size?: 'small' | 'medium' | 'large';
    className?: string;
    rowKey?: string | ((record: T) => string);
    onRowClick?: (record: T, index: number) => void;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    sortInfo?: {
        key: string;
        direction: 'asc' | 'desc';
    };
    emptyText?: string;
    headerClassName?: string;
    rowClassName?: string | ((record: T, index: number) => string);
    cellClassName?: string | ((record: T, index: number, column: TableColumn<T>) => string);
}
export declare const Table: <T extends Record<string, any>>({ columns, dataSource, loading, bordered, striped, hoverable, size, className, rowKey, onRowClick, onSort, sortInfo, emptyText, headerClassName, rowClassName, cellClassName, }: TableProps<T>) => import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Table.d.ts.map