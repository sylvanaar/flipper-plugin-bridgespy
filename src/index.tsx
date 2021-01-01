import {ManagedDataInspector, Panel, Text, createTablePlugin} from 'flipper';
import React from "react";

type Id = string;

type Row = {
  id: Id,
  time: number,
  type: string,
  module: string,
  method: string | number,
  args: string
};

function buildRow(row: Row) {
  return {
    columns: {
      index: {
        value: <Text>{row.id}</Text>
      },
      time: {
        value: <Text>{new Date(row.time).toLocaleString()}</Text>,
      },      
      type: {
        value: <Text>{row.type}</Text>,
        filterValue: row.type,
      },
      module: {
        value: <Text>{row.module ?? ""}</Text>,
        filterValue: row.module ?? "",
      },
      method: {
        value: <Text>{row.method.toString()}</Text>,
        filterValue: row.method,
      },
      args: {
        value: <Text>{JSON.stringify(row.args)}</Text>,
        filterValue: JSON.stringify(row.args),
      }
    },
    key: row.id,
    copyText: JSON.stringify(row),
    filterValue: `${row.type} ${row.module} ${row.method} ${row.args}`,
  };
}

function renderSidebar(row: Row) {
  return (
    <Panel floating={false} heading={'Data'}>
      <ManagedDataInspector data={row.args} expandRoot={true} />
    </Panel>
  );
}

const columns = {
  index: {
    value: "Id"
  },
  time: {
    value: 'Timestamp',
  },
  type: {
    value: 'Direction',
  },
  module: {
    value: 'Module',
  },
  method: {
    value: 'Method',
  },
  args: {
    value: 'Data',
  },  
};

const columnSizes = {
  index: "5%",
  time: '10%',
  type: '5%',
  module: '10%',
  method: '10%', 
  name: 'flex',
};

export default createTablePlugin({
  method: 'newRow', // Method which should be subscribed to to get new rows with share Row (from above),
  columns,
  columnSizes,
  renderSidebar,
  buildRow,
});