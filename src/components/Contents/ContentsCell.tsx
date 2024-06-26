import React, { ComponentProps, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { FormattedDate, Icon } from '@plone/volto/components';
import { getContentIcon } from '@plone/volto/helpers';
import { Brain } from '../../types';
import { Link, MoreoptionsIcon, PageIcon } from '@plone/components';
import { Button } from '../Button';
import { ItemActionsPopover } from './ItemActionsPopover';

interface Props {
  item: Brain;
  column: keyof Brain | '_actions';
  indexes: {
    order: string[];
    values: {
      [index: string]: {
        type: string;
        label: string;
        selected: boolean;
        sort_on?: string;
      };
    };
  };
  onMoveToTop: ComponentProps<typeof ItemActionsPopover>['onMoveToTop'];
  onMoveToBottom: ComponentProps<typeof ItemActionsPopover>['onMoveToBottom'];
  onCut: ComponentProps<typeof ItemActionsPopover>['onCut'];
  onCopy: ComponentProps<typeof ItemActionsPopover>['onCopy'];
  onDelete: ComponentProps<typeof ItemActionsPopover>['onDelete'];
}

export function ContentsCell({
  item,
  column,
  indexes,
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
        <Icon
          name={getContentIcon(item['@type'], item.is_folderish)}
          size="20px"
          className="icon-margin"
          title={item['Type'] || item['@type']}
        />
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
          aria-label={intl.formatMessage({ id: 'contentsNextMoreOptions' })}
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
    if (indexes.values[column].type === 'boolean') {
      return (
        <>
          {item[column]
            ? intl.formatMessage({ id: 'Yes' })
            : intl.formatMessage({ id: 'No' })}
        </>
      );
    } else if (indexes.values[column].type === 'string') {
      if (column !== 'review_state') {
        return <>{item[column]}</>;
      } else {
        return (
          <div className={`review-state ${item[column]}`}>
            {intl.formatMessage({ id: item[column] || 'no workflow state' })}
          </div>
        );
      }
    } else if (indexes.values[column].type === 'date') {
      if (item[column] && item[column] !== 'None') {
        return <FormattedDate date={item[column]} />;
      } else {
        return <>{intl.formatMessage({ id: 'None' })}</>;
      }
    } else if (indexes.values[column].type === 'array') {
      const value = item[column];
      return <>{Array.isArray(value) ? value.join(', ') : value}</>;
    } else {
      // TODO do we get here? needed for type checking?
      return null;
    }
  }
}
