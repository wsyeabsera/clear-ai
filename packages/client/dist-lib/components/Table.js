"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ThemeProvider_1 = require("../themes/ThemeProvider");
const Table = ({ columns, dataSource, loading = false, bordered = true, striped = true, hoverable = true, size = 'medium', className = '', rowKey = 'id', onRowClick, onSort, sortInfo, emptyText = 'No data available', headerClassName = '', rowClassName = '', cellClassName = '', }) => {
    const { theme } = (0, ThemeProvider_1.useTheme)();
    const getRowKey = (record, index) => {
        if (typeof rowKey === 'function') {
            return rowKey(record);
        }
        return record[rowKey] || index.toString();
    };
    const getRowClassName = (record, index) => {
        const baseClass = 'table-row';
        const themeClass = `table-row-${theme.name}`;
        const stripedClass = striped && index % 2 === 1 ? 'table-row-striped' : '';
        const hoverClass = hoverable ? 'table-row-hoverable' : '';
        const customClass = typeof rowClassName === 'function' ? rowClassName(record, index) : rowClassName;
        return [baseClass, themeClass, stripedClass, hoverClass, customClass].filter(Boolean).join(' ');
    };
    const getCellClassName = (record, index, column) => {
        const baseClass = 'table-cell';
        const themeClass = `table-cell-${theme.name}`;
        const alignClass = column.align ? `table-cell-${column.align}` : '';
        const customClass = typeof cellClassName === 'function' ? cellClassName(record, index, column) : cellClassName;
        return [baseClass, themeClass, alignClass, customClass, column.className].filter(Boolean).join(' ');
    };
    const handleSort = (key) => {
        if (!onSort)
            return;
        const currentDirection = sortInfo?.key === key ? sortInfo.direction : null;
        const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        onSort(key, newDirection);
    };
    const renderSortIcon = (column) => {
        if (!column.sortable || !onSort)
            return null;
        const isActive = sortInfo?.key === column.key;
        const direction = isActive ? sortInfo.direction : null;
        return ((0, jsx_runtime_1.jsxs)("span", { className: "table-sort-icon", children: [direction === 'asc' && (0, jsx_runtime_1.jsx)("span", { className: "sort-asc", children: "\u2191" }), direction === 'desc' && (0, jsx_runtime_1.jsx)("span", { className: "sort-desc", children: "\u2193" }), !direction && (0, jsx_runtime_1.jsx)("span", { className: "sort-default", children: "\u2195" })] }));
    };
    const renderCell = (column, record, index) => {
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
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `table-container table-container-${theme.name} ${className}`, style: tableStyles, children: [(0, jsx_runtime_1.jsx)("div", { className: `table-wrapper ${loading ? 'table-loading' : ''}`, children: (0, jsx_runtime_1.jsxs)("table", { className: `table table-${theme.name} table-${size} ${bordered ? 'table-bordered' : ''}`, children: [(0, jsx_runtime_1.jsx)("thead", { className: `table-header ${headerClassName}`, children: (0, jsx_runtime_1.jsx)("tr", { className: "table-header-row", children: columns.map((column) => ((0, jsx_runtime_1.jsx)("th", { className: `table-header-cell table-header-cell-${theme.name} ${column.sortable ? 'table-header-cell-sortable' : ''}`, style: { width: column.width }, onClick: () => column.sortable && handleSort(column.key), children: (0, jsx_runtime_1.jsxs)("div", { className: "table-header-content", children: [(0, jsx_runtime_1.jsx)("span", { className: "table-header-title", children: column.title }), renderSortIcon(column)] }) }, column.key))) }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "table-body", children: dataSource.length === 0 ? ((0, jsx_runtime_1.jsx)("tr", { className: "table-empty-row", children: (0, jsx_runtime_1.jsx)("td", { className: "table-empty-cell", colSpan: columns.length, children: (0, jsx_runtime_1.jsx)("div", { className: "table-empty-content", children: emptyText }) }) })) : (dataSource.map((record, index) => ((0, jsx_runtime_1.jsx)("tr", { className: getRowClassName(record, index), onClick: () => onRowClick?.(record, index), children: columns.map((column) => ((0, jsx_runtime_1.jsx)("td", { className: getCellClassName(record, index, column), children: renderCell(column, record, index) }, column.key))) }, getRowKey(record, index))))) })] }) }), loading && ((0, jsx_runtime_1.jsx)("div", { className: "table-loading-overlay", children: (0, jsx_runtime_1.jsxs)("div", { className: "table-loading-spinner", children: [(0, jsx_runtime_1.jsx)("div", { className: "spinner" }), (0, jsx_runtime_1.jsx)("span", { children: "Loading..." })] }) }))] }));
};
exports.Table = Table;
//# sourceMappingURL=Table.js.map