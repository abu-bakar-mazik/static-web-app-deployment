'use client';
import type { TableRootProps, TableHeaderProps, TableBodyProps, TableRowProps, TableCellProps, TableColumnHeaderProps, RecipeVariantProps } from '@chakra-ui/react';
import { useRecipe, Table } from '@chakra-ui/react';
import { TableRecipe } from '../styling/table.recipe';
import * as React from 'react';

type TableVariantProps = RecipeVariantProps<typeof TableRecipe>

export interface TableProps extends TableRootProps, TableVariantProps, TableVariantProps {}

export const TableRoot = React.forwardRef<HTMLTableElement, TableProps>(function TableRoot(props, ref) {
  const { visual, children, ...restProps } = props;
  const recipe = useRecipe({ key: 'table' });
  const styles = recipe({ visual });
  return (
    <Table.Root css={styles} ref={ref} {...restProps}>
      {children}
    </Table.Root>
  );
});

export const TableHeader = React.forwardRef<HTMLTableElement, TableHeaderProps>(function TableRoot(props, ref) {
  const { children, ...restProps } = props;
  return <Table.Header {...restProps}>{children}</Table.Header>;
});

export const TableBody = React.forwardRef<HTMLTableElement, TableBodyProps>(function TableRoot(props, ref) {
  const { children, ...restProps } = props;
  return <Table.Body {...restProps}>{children}</Table.Body>;
});

export const TableRow = React.forwardRef<HTMLTableElement, TableRowProps>(function TableRoot(props, ref) {
  const { children, ...restProps } = props;
  return <Table.Row {...restProps}>{children}</Table.Row>;
});

export const TableCell = React.forwardRef<HTMLTableElement, TableCellProps>(function TableRoot(props, ref) {
  const { children, ...restProps } = props;
  return <Table.Cell {...restProps}>{children}</Table.Cell>;
});

export const TableColumnHeader = React.forwardRef<HTMLTableElement, TableColumnHeaderProps>(function TableRoot(props, ref) {
  const { children, ...restProps } = props;
  return <Table.ColumnHeader {...restProps}>{children}</Table.ColumnHeader>;
});
