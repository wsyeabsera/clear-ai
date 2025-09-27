import React from 'react';
import { useTheme } from '../themes/ThemeProvider';

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
  sortInfo?: { key: string; direction: 'asc' | 'desc' };
  emptyText?: string;
  headerClassName?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  cellClassName?: string | ((record: T, index: number, column: TableColumn<T>) => string);
}

export const Table = <T extends Record<string, any>>({
  columns,
  dataSource,
  loading = false,
  bordered = true,
  striped = true,
  hoverable = true,
  size = 'medium',
  className = '',
  rowKey = 'id',
  onRowClick,
  onSort,
  sortInfo,
  emptyText = 'No data available',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
}: TableProps<T>) => {
  const { theme } = useTheme();

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  const getRowClassName = (record: T, index: number): string => {
    const baseClass = 'table-row';
    const themeClass = `table-row-${theme.name}`;
    const stripedClass = striped && index % 2 === 1 ? 'table-row-striped' : '';
    const hoverClass = hoverable ? 'table-row-hoverable' : '';
    const customClass = typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName;
    
    return [baseClass, themeClass, stripedClass, hoverClass, customClass].filter(Boolean).join(' ');
  };

  const getCellClassName = (record: T, index: number, column: TableColumn<T>): string => {
    const baseClass = 'table-cell';
    const themeClass = `table-cell-${theme.name}`;
    const alignClass = column.align ? `table-cell-${column.align}` : '';
    const customClass = typeof cellClassName === 'function' ? cellClassName(record, index, column) : cellClassName;
    
    return [baseClass, themeClass, alignClass, customClass, column.className].filter(Boolean).join(' ');
  };

  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const currentDirection = sortInfo?.key === key ? sortInfo.direction : null;
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const renderSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return null;
    
    const isActive = sortInfo?.key === column.key;
    const direction = isActive ? sortInfo.direction : null;
    
    return (
      <span className="table-sort-icon">
        {direction === 'asc' && <span className="sort-asc">↑</span>}
        {direction === 'desc' && <span className="sort-desc">↓</span>}
        {!direction && <span className="sort-default">↕</span>}
      </span>
    );
  };

  const renderCell = (column: TableColumn<T>, record: T, index: number) => {
    const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
    return column.render ? column.render(value, record, index) : value;
  };

  const tableStyles = {
    '--table-primary-color': theme.colors.primary.main,
    '--table-primary-light': theme.colors.primary.light,
    '--table-primary-dark': theme.colors.primary.dark,
    '--table-secondary-color': theme.colors.secondary.main,
    '--table-background-default': theme.colors.background.default,
    '--table-background-paper': theme.colors.background.paper,
    '--table-background-elevated': theme.colors.background.elevated,
    '--table-text-primary': theme.colors.text.primary,
    '--table-text-secondary': theme.colors.text.secondary,
    '--table-text-disabled': theme.colors.text.disabled,
    '--table-border-default': theme.colors.border.default,
    '--table-border-light': theme.colors.border.light,
    '--table-border-dark': theme.colors.border.dark,
    '--table-interactive-hover': theme.colors.interactive.hover,
    '--table-interactive-active': theme.colors.interactive.active,
    '--table-interactive-focus': theme.colors.interactive.focus,
    '--table-interactive-disabled': theme.colors.interactive.disabled,
    '--table-shadow-sm': theme.effects.shadow.sm,
    '--table-shadow-md': theme.effects.shadow.md,
    '--table-shadow-lg': theme.effects.shadow.lg,
    '--table-border-radius-sm': theme.effects.borderRadius.sm,
    '--table-border-radius-md': theme.effects.borderRadius.md,
    '--table-border-radius-lg': theme.effects.borderRadius.lg,
    '--table-transition-fast': theme.effects.transition.fast,
    '--table-transition-normal': theme.effects.transition.normal,
    '--table-transition-slow': theme.effects.transition.slow,
    '--table-hover-scale': theme.effects.hover.scale,
    '--table-hover-glow': theme.effects.hover.glow,
    '--table-hover-shadow': theme.effects.hover.shadow,
    '--table-hover-background': theme.effects.hover.background,
    '--table-font-family-primary': theme.typography.fontFamily.primary,
    '--table-font-size-sm': theme.typography.fontSize.sm,
    '--table-font-size-base': theme.typography.fontSize.base,
    '--table-font-size-lg': theme.typography.fontSize.lg,
    '--table-font-weight-normal': theme.typography.fontWeight.normal,
    '--table-font-weight-medium': theme.typography.fontWeight.medium,
    '--table-font-weight-semibold': theme.typography.fontWeight.semibold,
    '--table-font-weight-bold': theme.typography.fontWeight.bold,
  } as React.CSSProperties;

  return (
    <div className={`table-container table-container-${theme.name} ${className}`} style={tableStyles}>
      <div className={`table-wrapper ${loading ? 'table-loading' : ''}`}>
        <table className={`table table-${theme.name} table-${size} ${bordered ? 'table-bordered' : ''}`}>
          <thead className={`table-header ${headerClassName}`}>
            <tr className="table-header-row">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`table-header-cell table-header-cell-${theme.name} ${column.sortable ? 'table-header-cell-sortable' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="table-header-content">
                    <span className="table-header-title">{column.title}</span>
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {dataSource.length === 0 ? (
              <tr className="table-empty-row">
                <td className="table-empty-cell" colSpan={columns.length}>
                  <div className="table-empty-content">
                    {emptyText}
                  </div>
                </td>
              </tr>
            ) : (
              dataSource.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={getRowClassName(record, index)}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={getCellClassName(record, index, column)}
                    >
                      {renderCell(column, record, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {loading && (
        <div className="table-loading-overlay">
          <div className="table-loading-spinner">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};
