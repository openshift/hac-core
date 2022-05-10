import * as React from 'react';
import { VirtualTableBody } from '@patternfly/react-virtualized-extension';
import { CellMeasurerCache, CellMeasurer } from 'react-virtualized';
import { Scroll } from '@patternfly/react-virtualized-extension/dist/js/components/Virtualized/types';
import { ICell, SortByDirection, ThProps } from '@patternfly/react-table';

export type RowProps<D> = {
  obj: D;
};

export type TableColumn<D> = ICell & {
  title: string;
  id: string;
  sort?: ((data: D[], sortDirection: SortByDirection) => D[]) | ThProps['sort'] | string;
  visibility?: string[]; // debt???
};

export type TableRowProps = {
  id: React.ReactText;
  index: number;
  title?: string;
  trKey: string;
  style: object;
  className?: string;
};

export const TableRow: React.FC<TableRowProps> = ({
  id,
  style,
  className,
  ...props
}) => {
  return (
    <tr
      {...props}
      style={style}
      className={className}
      role="row"
    />
  );
};

type VirtualizedTableBodyProps<D> = {
  Row: React.ComponentType<RowProps<D>>;
  data: D[];
  height: number;
  isScrolling: boolean;
  onChildScroll: (params: Scroll) => void;
  columns: TableColumn<D>[];
  scrollTop: number;
  width: number;
  getRowId?: (obj: D) => string;
  getRowTitle?: (obj: D) => string;
  getRowClassName?: (obj: D) => string;
};

const RowMemo = React.memo<RowProps<any> & { Row: React.ComponentType<RowProps<any>> }>(
  ({ Row, ...props }) => <Row {...props} />,
);

const VirtualizedTableBody = <D extends any>({
  Row,
  height,
  isScrolling,
  onChildScroll,
  data,
  columns,
  scrollTop,
  width,
}: VirtualizedTableBodyProps<D>) => {
  const cellMeasurementCache = new CellMeasurerCache({
    fixedWidth: true,
    minHeight: 44,
    keyMapper: (rowIndex) => (data?.[rowIndex] as Record<string, Record<string, unknown>>)?.metadata?.uid ?? rowIndex,
  });

  const rowRenderer = ({ index, isVisible, key, style, parent }) => {
    const rowArgs: RowProps<D> = {
      obj: data[index]
    };

    // do not render non visible elements (this excludes overscan)
    if (!isVisible) {
      return null;
    }
    return (
      <CellMeasurer
        cache={cellMeasurementCache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        <TableRow
          id={key}
          index={index}
          trKey={key}
          style={style}
        >
          <RowMemo Row={Row} {...rowArgs} />
        </TableRow>
      </CellMeasurer>
    );
  };

  return (
    <VirtualTableBody
      autoHeight
      className="pf-c-table pf-m-border-rows pf-c-virtualized pf-c-window-scroller"
      deferredMeasurementCache={cellMeasurementCache}
      rowHeight={cellMeasurementCache.rowHeight}
      height={height || 0}
      isScrolling={isScrolling}
      onScroll={onChildScroll}
      overscanRowCount={10}
      columns={columns}
      rows={data}
      rowCount={data.length}
      rowRenderer={rowRenderer}
      scrollTop={scrollTop}
      width={width}
    />
  );
};

export default VirtualizedTableBody;
