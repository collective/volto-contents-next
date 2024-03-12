import React, { ComponentProps, useRef, useState } from 'react';
import { DialogTrigger } from 'react-aria-components';
import { useIntl } from 'react-intl';
import { FormattedDate } from '@plone/volto/components';
import { Brain } from '../../helpers/types';
import { Link, MoreoptionsIcon, PageIcon } from '@plone/components';
import { indexes } from '../../helpers/indexes';
import { Button } from '../Button';
import { ItemActionsPopover } from './ItemActionsPopover';

interface Props {
  item: Brain;
  column: keyof typeof indexes | 'title' | '_actions';
  onMoveToTop: ComponentProps<typeof ItemActionsPopover>['onMoveToTop'];
  onMoveToBottom: ComponentProps<typeof ItemActionsPopover>['onMoveToBottom'];
  onCut: ComponentProps<typeof ItemActionsPopover>['onCut'];
  onCopy: ComponentProps<typeof ItemActionsPopover>['onCopy'];
  onDelete: ComponentProps<typeof ItemActionsPopover>['onDelete'];
}

export function ContentsCell({
  item,
  column,
  onMoveToTop,
  onMoveToBottom,
  onCut,
  onCopy,
  onDelete,
}: Props) {
  const intl = useIntl();
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (column === 'title') {
    return (
      <Link
        className="react-aria-Link title-link"
        href={`${item['@id']}${item.is_folderish ? '/contents' : ''}`}
      >
        <PageIcon />
        {item.title}
        {item.ExpirationDate !== 'None' &&
          new Date(item.ExpirationDate).getTime() < new Date().getTime() && (
            <span className="expired">
              {intl.formatMessage({ id: 'Expired' })}
            </span>
          )}
        {item.EffectiveDate !== 'None' &&
          new Date(item.EffectiveDate).getTime() > new Date().getTime() && (
            <span className="future">
              {intl.formatMessage({ id: 'Scheduled' })}
            </span>
          )}
      </Link>
    );
  } else if (column === '_actions') {
    return (
      <>
        <Button
          className="react-aria-Button item-actions-trigger"
          // TODO translate aria-label
          aria-label="More options"
          onPress={() => setIsMoreOptionsOpen(true)}
          ref={triggerRef}
        >
          <MoreoptionsIcon />
        </Button>
        <ItemActionsPopover
          triggerRef={triggerRef}
          isOpen={isMoreOptionsOpen}
          onOpenChange={setIsMoreOptionsOpen}
          editLink={`${item['@id']}/edit`}
          viewLink={item['@id']}
          onMoveToBottom={async () => {
            const res = await onMoveToBottom();
            setIsMoreOptionsOpen(false);
            return res;
          }}
          onMoveToTop={async () => {
            const res = await onMoveToTop();
            setIsMoreOptionsOpen(false);
            return res;
          }}
          onCopy={async () => {
            const res = await onCopy();
            setIsMoreOptionsOpen(false);
            return res;
          }}
          onCut={async () => {
            const res = await onCut();
            setIsMoreOptionsOpen(false);
            return res;
          }}
          onDelete={async () => {
            const res = await onDelete();
            setIsMoreOptionsOpen(false);
            return res;
          }}
        />
      </>
    );
  } else {
    if (indexes[column].type === 'boolean') {
      return (
        <>
          {item[column]
            ? intl.formatMessage({ id: 'Yes' })
            : intl.formatMessage({ id: 'No' })}
        </>
      );
    } else if (indexes[column].type === 'string') {
      if (column !== 'review_state') {
        return <>{item[column]}</>;
      } else {
        return (
          <div className={`review-state ${item[column]}`}>
            {intl.formatMessage({ id: item[column] || 'no workflow state' })}
          </div>
        );
      }
    } else if (indexes[column].type === 'date') {
      if (item[column] && item[column] !== 'None') {
        // @ts-ignore TODO fix this, maybe a stricter type for the indexes?
        return <FormattedDate date={item[column]} />;
      } else {
        return <>{intl.formatMessage({ id: 'None' })}</>;
      }
    } else if (indexes[column].type === 'array') {
      const value = item[column];
      return <>{Array.isArray(value) ? value.join(', ') : value}</>;
    } else {
      // TODO do we get here? needed for type checking?
      return null;
    }
  }
}
