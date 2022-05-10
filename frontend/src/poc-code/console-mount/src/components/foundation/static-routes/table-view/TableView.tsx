import * as React from 'react';
import {
  SearchInput,
  Select,
  SelectOption,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant,
} from '@patternfly/react-core';
// eslint-disable-next-line no-restricted-imports
import { FilterIcon } from '@patternfly/react-icons';
// eslint-disable-next-line no-restricted-imports
import { omit } from 'lodash';
import VirtualizedTable, { VirtualizedTableProps } from '../table/VirtualizedTable';
import FilterChips from './FilterChips';
import './table-view.css';

export type FilterItem = {
  /* Label of a parameter used for filtering. */
  label: string;
  /* Column name for given filtering parameter. */
  id: string;
};

export type TableViewProps<D> = VirtualizedTableProps<D> & {
  /* Optional custom onFilter callback. */
  onFilter?: (key, filterBy) => D[];
  /* Optional array of filterBy options. */
  filters?: FilterItem[];
  /* Optional virtualize table flag. */
  virtualize?: boolean;
};

const TableView: React.FC<TableViewProps<unknown>> = ({
  data,
  loaded,
  columns,
  Row,
  loadError,
  emptyLabel,
  EmptyMsg,
  LoadErrorDefaultMsg,
  NoDataEmptyMsg,
  onFilter,
  filters,
  'aria-label': ariaLabel,
}) => {
  const [activeFilter, setActiveFilter] = React.useState<FilterItem>(filters[0]);
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = React.useState(data);
  const [isFilterSelectExpanded, setFilterSelectExpanded] = React.useState(false);

  React.useEffect(() => {
    filters &&
      setFilteredData(
        onFilter
          ? onFilter(filterValues, activeFilter)
          : [...data].filter((item) =>
              Object.keys(filterValues).every((key) => item[key]?.toLowerCase()?.includes(filterValues[key]?.toLowerCase())),
            ),
      );
  }, [activeFilter, data, filterValues, filters, onFilter]);

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          {filters ? (
            <>
              <ToolbarItem key="filter-select">
                <Select
                  toggleIcon={<FilterIcon />}
                  variant={SelectVariant.single}
                  onToggle={(value) => setFilterSelectExpanded(value)}
                  onSelect={(e, selection) => {
                    setActiveFilter(filters.find((item) => item.id === selection));
                    setFilterSelectExpanded(false);
                  }}
                  placeholderText={activeFilter.label}
                  isOpen={isFilterSelectExpanded}
                >
                  {filters?.map((option) => (
                    <SelectOption key={option.id} value={option.id}>
                      {option.label}
                    </SelectOption>
                  ))}
                </Select>
              </ToolbarItem>
              <ToolbarItem variant={ToolbarItemVariant['search-filter']} key="search-filter">
                <SearchInput
                  className="table-view__search"
                  onChange={(value) => {
                    setFilterValues({
                      ...filterValues,
                      [activeFilter.id]: value,
                    });
                  }}
                  value={filterValues[activeFilter.id]}
                  placeholder={`Filter by ${activeFilter?.label}`}
                />
              </ToolbarItem>
            </>
          ) : null}
        </ToolbarContent>
        {Object.keys(filterValues)?.length > 0 && (
          <ToolbarContent className="table-view__filters">
            <ToolbarItem>
              <FilterChips
                filters={filters}
                filterValues={filterValues}
                onDelete={(key) => {
                  setFilterValues(key ? omit(filterValues, key) : {});
                }}
              />
            </ToolbarItem>
          </ToolbarContent>
        )}
      </Toolbar>
      <VirtualizedTable
        areFiltersApplied={Object.values(filterValues).some((value) => value?.length > 0)}
        data={filters ? filteredData : data}
        loaded={loaded}
        loadError={loadError}
        columns={columns}
        Row={Row}
        LoadErrorDefaultMsg={LoadErrorDefaultMsg}
        NoDataEmptyMsg={NoDataEmptyMsg}
        EmptyMsg={EmptyMsg}
        emptyLabel={emptyLabel}
        aria-label={ariaLabel}
      />
    </>
  );
};

export default TableView;
