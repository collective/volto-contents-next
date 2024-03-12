import React from 'react';
import {
  Link,
  Button,
  Popover,
  type PopoverProps,
  EditIcon,
  EyeIcon,
  RowbeforeIcon,
  RowafterIcon,
  CutIcon,
  CopyIcon,
  BinIcon,
} from '@plone/components';

interface Props extends Omit<PopoverProps, 'children'> {
  editLink: string;
  viewLink: string;
  onMoveToTop: () => Promise<void>;
  onMoveToBottom: () => Promise<void>;
  onCut: () => Promise<void>;
  onCopy: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export function ItemActionsPopover({
  editLink,
  viewLink,
  onMoveToTop,
  onMoveToBottom,
  onCut,
  onCopy,
  onDelete,
  ...popoverProps
}: Props) {
  return (
    <Popover
      {...popoverProps}
      className="react-aria-Popover item-actions-popover"
    >
      <ul className="item-actions-list">
        <li className="item-actions-list-item edit">
          <Link href={editLink}>
            <EditIcon />
            Edit
          </Link>
        </li>
        <li className="item-actions-list-item view">
          <Link href={viewLink}>
            <EyeIcon />
            View
          </Link>
        </li>
        <li className="item-actions-list-item move-to-top">
          <Button onPress={onMoveToTop}>
            <RowbeforeIcon />
            Move to top
          </Button>
        </li>
        <li className="item-actions-list-item move-to-bottom">
          <Button onPress={onMoveToBottom}>
            <RowafterIcon />
            Move to bottom
          </Button>
        </li>
        <li className="item-actions-list-item cut">
          <Button onPress={onCut}>
            <CutIcon />
            Cut
          </Button>
        </li>
        <li className="item-actions-list-item copy">
          <Button onPress={onCopy}>
            <CopyIcon />
            Copy
          </Button>
        </li>
        <li className="item-actions-list-item delete">
          <Button onPress={onDelete}>
            <BinIcon />
            Delete
          </Button>
        </li>
      </ul>
    </Popover>
  );
}
