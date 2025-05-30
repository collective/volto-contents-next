import { ComponentProps } from 'react';
import './styles/basic/main.css';
import './styles/quanta/main.css';
// import type { ActionsResponse } from '@plone/types';
import { VisuallyHidden } from 'react-aria';
import {
  TooltipTrigger,
  useDragAndDrop,
  type Selection,
  DialogTrigger,
  MenuTrigger,
} from 'react-aria-components';
import { useIntl } from 'react-intl';
import { useMediaQuery } from 'usehooks-ts';
import {
  // AddIcon,
  Breadcrumbs,
  CollectionIcon,
  Container,
  MoreoptionsIcon,
  PasteIcon,
  QuantaTextField,
  Tooltip,
} from '@plone/components';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import type { Toast as ToastType } from 'react-toastify';
import { Button } from '../Button';
import { Table } from '../Table/Table';
import { ContentsCell } from './ContentsCell';
import { TableIndexesPopover } from './TableIndexesPopover';
import { RearrangePopover } from './RearrangePopover';
import { ContentsActions } from './ContentsActions';
// import { AddContentPopover } from './AddContentPopover';
import type { ArrayElement, Brain } from '../../types';

interface ContentsProps {
  // pathname: string;
  breadcrumbs: ComponentProps<typeof Breadcrumbs>['items'];
  // objectActions: ActionsResponse['object'];
  title: string;
  // loading: boolean;
  canPaste: boolean;
  textFilter: string;
  onChangeTextFilter: (value: string) => void;
  items: Brain[];
  selected: Selection;
  setSelected: (value: Selection) => void;
  indexes: {
    order: (keyof Brain)[];
    values: {
      [index: string]: {
        type: string;
        label: string;
        selected: boolean;
        sort_on?: string;
      };
    };
    selectedCount: number;
  };
  onSelectIndex: (index: string) => void;
  sortItems: (index: string) => void;
  upload: () => Promise<void>;
  rename: () => Promise<void>;
  workflow: () => Promise<void>;
  tags: () => Promise<void>;
  properties: () => Promise<void>;
  cut: (value?: string) => Promise<void>;
  copy: (value?: string) => Promise<void>;
  paste: () => Promise<void>;
  deleteItem: (value?: string) => Promise<void>;
  orderItem: (id: string, delta: number) => Promise<void>;
  moveToTop: (index: number) => Promise<void>;
  moveToBottom: (index: number) => Promise<void>;
  // addableTypes: ComponentProps<typeof AddContentPopover>['addableTypes'];
  toast: ToastType;
}

/**
 * A table showing the contents of an object.
 *
 * It has a toolbar for interactions with the items and a searchbar for filtering.
 * Items can be sorted by drag and drop.
 */
export function Contents({
  // pathname,
  breadcrumbs = [],
  // objectActions,
  title,
  // loading,
  canPaste,
  textFilter,
  onChangeTextFilter,
  items,
  selected,
  setSelected,
  indexes: baseIndexes,
  onSelectIndex,
  sortItems,
  upload,
  rename,
  workflow,
  tags,
  properties,
  cut,
  copy,
  paste,
  deleteItem,
  orderItem,
  moveToTop,
  moveToBottom, // addableTypes,
  toast,
}: ContentsProps) {
  const intl = useIntl();
  const isMobileScreenSize = useMediaQuery('(max-width: 768px)');

  // const folderContentsActions = objectActions.find(
  //   (action) => action.id === 'folderContents',
  // );

  // if (!folderContentsActions) {
  //   // TODO current volto returns the Unauthorized component here
  //   // it would be best if the permissions check was done at a higher level
  //   // and this remained null
  //   return null;
  // }

  // TODO "id" is a reserved key for table rows, so we cannot add the "ID" column at this time
  const indexes = {
    ...baseIndexes,
    order: baseIndexes.order.filter((index) => index !== 'id'),
    values: Object.fromEntries(
      Object.entries(baseIndexes.values).filter(([key]) => key !== 'id'),
    ),
  };

  const columns = [
    {
      id: 'title',
      name: intl.formatMessage({ id: 'Title' }),
      isRowHeader: true,
    },
    ...(!isMobileScreenSize
      ? indexes.order
          .filter((index) => indexes.values[index].selected)
          .map((index) => ({
            id: index,
            name: intl.formatMessage({ id: indexes.values[index].label }),
          }))
      : []),
    {
      id: '_actions',
      name: !isMobileScreenSize ? (
        <DialogTrigger>
          <TooltipTrigger>
            <Button className="react-aria-Button actions-cell-header">
              <MoreoptionsIcon />
            </Button>
            <Tooltip className="react-aria-Tooltip tooltip" placement="bottom">
              {intl.formatMessage({
                id: 'contentsNextSelectColumnsToDisplay',
              })}
            </Tooltip>
          </TooltipTrigger>
          <TableIndexesPopover
            indexes={indexes}
            onSelectIndex={onSelectIndex}
          />
        </DialogTrigger>
      ) : canPaste ? (
        <TooltipTrigger>
          <Button
            className="react-aria-Button contents-action-trigger paste"
            onPress={paste}
            aria-label={intl.formatMessage({ id: 'Paste' })}
            isDisabled={!canPaste}
          >
            <PasteIcon />
          </Button>
          <Tooltip placement="bottom">
            {intl.formatMessage({ id: 'Paste' })}
          </Tooltip>
        </TooltipTrigger>
      ) : null,
    },
  ] as const;

  const rows = items.map((item, itemIndex) =>
    columns.reduce<ArrayElement<ComponentProps<typeof Table>['rows']>>(
      (cells, column) => ({
        ...cells,
        [column.id]: (
          <ContentsCell
            item={item}
            column={column.id}
            indexes={indexes}
            onMoveToBottom={() => moveToBottom(itemIndex)}
            onMoveToTop={() => moveToTop(itemIndex)}
            onCut={() => cut(item['@id'])}
            onCopy={() => copy(item['@id'])}
            onDelete={() => deleteItem(item['@id'])}
          />
        ),
      }),
      {
        id: item['@id'],
        // Automatic textValue generation does not work
        // because the title column is a ReactNode and not a string
        textValue: item.title,
      },
    ),
  );

  const { dragAndDropHooks } = useDragAndDrop({
    isDisabled: isMobileScreenSize || selected === 'all' || selected.size > 1,
    getItems: (keys) =>
      [...keys].map((key) => ({
        'text/plain': key.toString(),
      })),
    onReorder(e) {
      if (e.keys.size !== 1) {
        toast.error(
          <Toast
            error
            title={intl.formatMessage({ id: 'Error' })}
            content={intl.formatMessage({
              id: 'contentsMultipleItemsMovedError',
            })}
          />,
        );
        return;
      }
      const target = [...e.keys][0];
      if (target === e.target.key) return;

      const item = items.find((item) => item['@id'] === target);
      if (!item) return;

      const initialPosition = rows.findIndex((row) => row.id === item['@id']);
      if (initialPosition === -1) return;

      const finalPosition = rows.findIndex((row) => row.id === e.target.key);

      let delta = finalPosition - initialPosition;
      if (delta > 0 && e.target.dropPosition === 'before') delta -= 1;
      if (delta < 0 && e.target.dropPosition === 'after') delta += 1;

      if (delta !== 0) {
        orderItem(item.id, delta);
      }
    },
  });

  return (
    <Container
      as="div"
      // id="page-contents"
      className="folder-contents"
      // aria-live="polite"
      layout={false}
      narrow={false}
    >
      <article id="content">
        <section className="topbar">
          <div className="title-block">
            <Breadcrumbs
              includeRoot={true}
              root="/contents"
              items={breadcrumbs}
            />
            <h1>{title}</h1>
          </div>
          {!isMobileScreenSize && (
            <ContentsActions
              upload={upload}
              rename={rename}
              workflow={workflow}
              tags={tags}
              properties={properties}
              cut={cut}
              copy={copy}
              paste={paste}
              deleteItem={deleteItem}
              canPaste={canPaste}
              selected={selected}
            />
          )}
          <QuantaTextField
            name="sortable_title"
            placeholder={intl.formatMessage({ id: 'Filter…' })}
            className="search-input"
            value={textFilter}
            onChange={onChangeTextFilter}
          />
          <VisuallyHidden>
            <span aria-live="polite">
              {intl.formatMessage(
                { id: 'contentsNextNumberOfItems' },
                { count: items.length },
              )}
            </span>
          </VisuallyHidden>
          {/* <TooltipTrigger>
            <DialogTrigger>
              <Button className="react-aria-Button add">
                <AddIcon />
              </Button>
              <AddContentPopover path={path} addableTypes={addableTypes} />
            </DialogTrigger>
            <Tooltip className="react-aria-Tooltip tooltip" placement="bottom">
              Add content
            </Tooltip>
          </TooltipTrigger> */}
        </section>
        <section className="contents-table">
          <Table
            aria-label={intl.formatMessage(
              { id: 'contentsNextContentsOf' },
              { title },
            )}
            columns={[...columns]}
            rows={rows}
            selectionMode={!isMobileScreenSize ? 'multiple' : undefined}
            selectedKeys={selected}
            onSelectionChange={setSelected}
            dragAndDropHooks={dragAndDropHooks}
            dragColumnHeader={
              <MenuTrigger>
                <TooltipTrigger>
                  <Button className="react-aria-Button drag-cell-header">
                    <CollectionIcon />
                  </Button>
                  <Tooltip
                    className="react-aria-Tooltip tooltip"
                    placement="bottom"
                  >
                    {intl.formatMessage({ id: 'Rearrange items by…' })}
                  </Tooltip>
                </TooltipTrigger>
                <RearrangePopover
                  indexes={indexes.values}
                  sortItems={sortItems}
                />
              </MenuTrigger>
            }
            // onRowSelection={onRowSelection}
            // resizableColumns={true}
          />
        </section>
      </article>
    </Container>
  );
}
