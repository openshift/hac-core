import * as React from 'react';
import { Th, Thead, Tr } from '@patternfly/react-table';
import * as _ from 'lodash';
import {
  TableComposable,
} from '@patternfly/react-table';
import { AutoSizer, WindowScroller } from '@patternfly/react-virtualized-extension';
import VirtualizedTableBody, { RowProps, TableColumn } from './VirtualizedTableBody';
import { LoadError, StatusBox } from '../status/StatusBox';

export type VirtualizedTableProps<D> = {
  areFiltersApplied?: boolean;
  data: D[];
  height?: number;
  loaded: boolean;
  loadError?: LoadError;
  columns: TableColumn<D>[];
  Row: React.FC<RowProps<D>>;
  LoadErrorDefaultMsg?: React.ComponentType;
  NoDataEmptyMsg?: React.ComponentType;
  EmptyMsg?: React.ComponentType;
  emptyLabel?: string;
  'aria-label'?: string;
  scrollNode?: () => HTMLElement;
};

export type VirtualizedTableFC = <D>(
  props: VirtualizedTableProps<D>,
) => JSX.Element;

const isHTMLElement = (n: Node): n is HTMLElement => {
  return n.nodeType === Node.ELEMENT_NODE;
};

export const getParentScrollableElement = (node: HTMLElement) => {
  let parentNode: Node = node;
  while (parentNode) {
    if (isHTMLElement(parentNode)) {
      let overflow = parentNode.style?.overflow;
      if (!overflow.includes('scroll') && !overflow.includes('auto')) {
        overflow = window.getComputedStyle(parentNode).overflow;
      }
      if (overflow.includes('scroll') || overflow.includes('auto')) {
        return parentNode;
      }
    }
    parentNode = parentNode.parentNode;
  }
  return undefined;
};

type WithScrollContainerProps = {
  children: (scrollContainer: HTMLElement) => React.ReactElement | null;
};

export const WithScrollContainer: React.FC<WithScrollContainerProps> = ({ children }) => {
  const [scrollContainer, setScrollContainer] = React.useState<HTMLElement>();
  const ref = React.useCallback((node) => {
    if (node) {
      setScrollContainer(getParentScrollableElement(node));
    }
  }, []);
  return scrollContainer ? children(scrollContainer) : <span ref={ref} />;
};

const VirtualizedTable: VirtualizedTableFC = ({
  areFiltersApplied,
  data: initialData,
  loaded,
  loadError,
  columns,
  Row,
  LoadErrorDefaultMsg,
  NoDataEmptyMsg,
  EmptyMsg,
  emptyLabel,
  scrollNode,
  'aria-label': ariaLabel,
}) => {
  const [data, setData] = React.useState(initialData);
  const [activeSortIndex, setActiveSortIndex] = React.useState(-1);
  const [activeSortDirection, setActiveSortDirection] = React.useState('none');

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const onSort = (event: React.FormEvent, index: number, direction: string) => {
    setActiveSortIndex(index);
    setActiveSortDirection(direction);
    // back compatibility with sort column attribute defined as a string + transforms: [sortable]
    const columnSort = _.isString(columns[index].sort) ? columns[index].sort : undefined;
    const updatedRows = data.sort((objA, objB) => {
      const a = columnSort ? _.get(objA, String(columnSort)) : Object.values(objA)[index];
      const b = columnSort ? _.get(objB, String(columnSort)) : Object.values(objB)[index];
      if (typeof a === 'number' && typeof b === 'number') {
        return direction === 'asc' ? a - b : b - a;
      }
      return direction === 'asc' ? String(a).localeCompare(String(b)) : String(b).localeCompare(String(a));
    });
    setData(updatedRows);
  };

  const renderVirtualizedTable = (scrollContainer) => (
    <WindowScroller scrollElement={scrollContainer}>
      {({ height, isScrolling, registerChild, onChildScroll, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <div ref={registerChild}>
              <VirtualizedTableBody
                Row={Row}
                height={height}
                isScrolling={isScrolling}
                onChildScroll={onChildScroll}
                data={data}
                columns={columns}
                scrollTop={scrollTop}
                width={width}
              />
            </div>
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );

  return (
    <StatusBox
      noData={!data || _.isEmpty(data)}
      loaded={loaded}
      loadError={loadError}
      areFiltersApplied={areFiltersApplied}
      emptyLabel={emptyLabel}
      LoadErrorDefaultMsg={LoadErrorDefaultMsg}
      NoDataEmptyMsg={NoDataEmptyMsg}
      EmptyMsg={EmptyMsg}
    >
      <div
        role="grid"
        aria-label={ariaLabel}
        aria-rowcount={data?.length}
      >
        <TableComposable aria-label={ariaLabel} role="presentation">
          <Thead>
            <Tr>
              {columns.map(({ title, props: properties, sort, transforms, visibility }, columnIndex) => {
                const isSortable = !!transforms?.find((item) => item?.name === 'sortable');
                const defaultSort = {
                  sortBy: {
                    index: activeSortIndex,
                    direction: activeSortDirection,
                  },
                  onSort,
                  columnIndex,
                };
                return (
                  <Th
                    // eslint-disable-next-line react/no-array-index-key
                    key={`column-${columnIndex}`}
                    sort={isSortable ? defaultSort : sort}
                    visibility={visibility}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...properties}
                  >
                    {title}
                  </Th>
                );
              })}
            </Tr>
          </Thead>
        </TableComposable>
        {scrollNode ? (
          renderVirtualizedTable(scrollNode)
        ) : (
          <WithScrollContainer>{renderVirtualizedTable}</WithScrollContainer>
        )}
      </div>
    </StatusBox>
  );
};

export default VirtualizedTable;
