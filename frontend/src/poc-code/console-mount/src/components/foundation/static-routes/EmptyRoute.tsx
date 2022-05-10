import * as React from 'react';
import { sortable, SortByDirection, Td } from '@patternfly/react-table';
import { RowProps } from '@console/dynamic-plugin-sdk';
import TableView from './table-view/TableView';
import { Card } from '@patternfly/react-core';

export const Row: React.FC<RowProps<Record<string, string>>> = ({ obj }) => (
  <>
    <Td dataLabel={obj.name}>{obj.name}</Td>
    <Td dataLabel={obj.prs}>{obj.prs}</Td>
    <Td dataLabel={obj.branches}>{obj.branches}</Td>
    <Td dataLabel={obj.workspaces}>{obj.workspaces}</Td>
    <Td dataLabel={obj.one} visibility={['hiddenOnSm', 'hiddenOnMd', 'visibleOnLg']}>{obj.one}</Td>
    <Td dataLabel={obj.two} visibility={['hiddenOnSm', 'hiddenOnMd', 'visibleOnLg']}>{obj.two}</Td>
    <Td dataLabel={obj.three} visibility={['hiddenOnSm', 'hiddenOnMd', 'visibleOnLg']}>{obj.three}</Td>
  </>
);

const EmptyRoute: React.FC = () => {
  let temp = [];
  for (let i = 0; i < 100; i++) {
    temp.push({ name: `name-${i}`, branches: `branch-${i}`, prs: `prs-${i}`, workspaces: `work-${i}`, lastCommit: `commit-${i}`, one: `one-${i}`, two: `two-${i}`, three: `three-${i}` });
  }
  const [data, setData] = React.useState(temp);

  const columns = [
    {
      title: 'Name',
      id: 'name',
      // sort: 'metadata.name', // back compatibility
      transforms: [sortable], // back compatibility
      props: {
        className: '',
      },
    },
    {
      title: 'PRs',
      id: 'prs',
      sort: {
        sortBy: {
          index: 1,
          direction: SortByDirection.desc,
        },
        onSort: () => {
          setData([
            { name: 'one', branches: 'two', prs: 'three', workspaces: 'four', lastCommit: 'five' },
            {
              name: 'one - 2',
              branches: null,
              prs: null,
              workspaces: 'four - 2',
              lastCommit: 'five - 2',
            },
          ]);
        },
        columnIndex: 1,
      },
      props: {
        className: '',
      },
    },
    {
      title: 'Branches',
      id: 'branches',
      props: {
        className: '',
      },
    },
    {
      title: 'Workspaces',
      id: 'workspaces',
      transforms: [sortable],
      sort: 'name',
      props: {
        className: '',
      },
    },
    {
      title: 'Branches',
      id: 'one',
      props: {
        className: '',
      },
      visibility: ['hiddenOnSm', 'hiddenOnMd', 'visibleOnLg']
    },
    {
      title: 'Branches',
      id: 'two',
      props: {
        className: '',
      },
      visibility: ['hiddenOnSm', 'hiddenOnMd', 'visibleOnLg']
    },
    {
      title: 'Branches',
      id: 'three',
      props: {
        className: '',
      },
      visibility: ['hiddenOnSm', 'hiddenOnMd', 'visibleOnLg']
    },
  ];

  return (
    <>
      <Card style={{ margin: '40px' }}>
        <TableView
          // areFiltersApplied={false}
          emptyLabel="No data applicable to the filter value."
          columns={columns}
          data={data}
          loaded
          // label={'Something went wrong...'}
          // loadError={'An error occured when fetching the data'}
          loadError={undefined}
          Row={Row}
          filters={[
            {
              id: 'name',
              label: 'Name',
            },
            {
              id: 'branches',
              label: 'Branches',
            },
            {
              id: 'workspaces',
              label: 'Workspaces',
            },
          ]}
        />
      </Card>
    </>
  );
};

export default EmptyRoute;
