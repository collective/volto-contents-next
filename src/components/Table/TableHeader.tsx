import React from 'react';
import {
  type TableHeaderProps,
  TableHeader as RACTableHeader,
  useTableOptions,
  Collection,
} from 'react-aria-components';
import { Checkbox } from '@plone/components';
import { Column } from './Column';

export function TableHeader<T extends object>({
  columns,
  children,
}: TableHeaderProps<T>) {
  let { selectionBehavior, selectionMode, allowsDragging } = useTableOptions();

  return (
    <RACTableHeader>
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && <Column />}
      {selectionBehavior === 'toggle' && (
        <Column>
          {selectionMode === 'multiple' && <Checkbox slot="selection" />}
        </Column>
      )}
      <Collection items={columns}>{children}</Collection>
    </RACTableHeader>
  );
}
