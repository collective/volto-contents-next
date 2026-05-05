import { useIntl } from 'react-intl';
import { Checkbox } from '@plone/components';
import { Popover } from '../Popover';

interface Props {
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
  onSelectIndex: (index: string) => void;
}

export const TableIndexesPopover = ({
  indexes,
  onSelectIndex,
  ...popoverOptions
}: Props) => {
  const intl = useIntl();

  return (
    <Popover
      {...popoverOptions}
      className="react-aria-Popover table-indexes-popover scroll"
      dialogAriaLabel={intl.formatMessage({ id: 'Columns' })}
    >
      <ul className="table-indexes-list">
        {indexes.order
          .filter((index) => index !== 'portal_type')
          .map((index) => {
            if (index === 'sortable_title') return null;
            return (
              <li key={index} className="table-indexes-list-item">
                <Checkbox
                  value={index}
                  isSelected={indexes.values[index].selected}
                  onChange={() => {
                    onSelectIndex(index);
                  }}
                  label={intl.formatMessage({
                    id: indexes.values[index].label,
                  })}
                  slot={null}
                />
              </li>
            );
          })}
      </ul>
    </Popover>
  );
};
