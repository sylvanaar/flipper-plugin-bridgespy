import React from "react";
import {
  Button,
  colors,
  DetailSidebar,
  FlipperPlugin,
  ManagedDataInspector,
  Panel,
  FlexCenter,
  SearchableTable,
  styled,
  TableHighlightedRows,
  FlexColumn,
} from "flipper";

type Id = string;

type DataRow = {
  id: Id;
  time: number;
  type: string;
  module: string;
  method: string | number;
  args: string;
};

type MessageRow = {
  columns: {
    index: {
      value: string;
    };
    time: {
      value: string;
    };
    type: {
      value?: string;
      isFilterable: true;
    };
    module: {
      value: string;
      isFilterable: true;
    };
    method: {
      value?: string;
      isFilterable: true;
    };
    args: {
      value?: string;
      isFilterable: true;
    };
  };
  timestamp: number;
  payload?: any;
  key: string;
};

type State = {
  selectedId: string | null;
};

type PersistedState = {
  messageRows: Array<MessageRow>;
};

const Placeholder = styled(FlexCenter)({
  fontSize: 18,
  color: colors.macOSTitleBarIcon,
});

function buildRow(row: DataRow | DataRow[]): MessageRow[] {
  if (!(row instanceof Array)) row = [row];

  return row.map((r) => ({
    columns: {
      index: {
        value: r.id,
      },
      time: {
        value: new Date(r.time).toLocaleString(undefined, {
          fractionalSecondDigits: 3,
          hour12: false,
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      },
      type: {
        value: r.type,
        isFilterable: true,
      },
      module: {
        value: r.module ?? "",
        isFilterable: true,
      },
      method: {
        value: r.method.toString(),
        isFilterable: true,
      },
      args: {
        value: JSON.stringify(r.args),
        isFilterable: true,
      },
    },
    key: r.id,
    payload: r,
    timestamp: r.time,
  }));
}

const columns = {
  index: {
    value: "Id",
  },
  time: {
    value: "Timestamp",
  },
  type: {
    value: "Direction",
  },
  module: {
    value: "Module",
  },
  method: {
    value: "Method",
  },
  args: {
    value: "Data",
  },
};

const columnSizes = {
  index: "5%",
  time: "10%",
  type: "5%",
  module: "10%",
  method: "10%",
  args: "flex",
};



export default class extends FlipperPlugin<State, any, PersistedState> {
  static defaultPersistedState = {
    messageRows: [],
  };

  state: State = {
    selectedId: null,
  };

  static persistedStateReducer = (persistedState: PersistedState, method: string, payload: any): PersistedState => {
    if (method === "newRow") {
      return {
        ...persistedState,
        messageRows: [...persistedState.messageRows, ...buildRow(payload)].filter(
          (row) => Date.now() - row.timestamp < 5 * 60 * 1000,
        ),
      };
    }
    return persistedState;
  };
  render() {
    const clearTableButton = (
      <Button onClick={this.clear} key="clear">
        Clear Table
      </Button>
    );

    return (
      <FlexColumn grow={true}>
        <SearchableTable
          rowLineHeight={28}
          floating={false}
          multiline={true}
          allowRegexSearch={true}
          columnSizes={columnSizes}
          columns={columns}
          onRowHighlighted={this.onRowHighlighted}
          rows={this.props.persistedState.messageRows}
          stickyBottom={true}
          actions={[ clearTableButton]}
        />
        <DetailSidebar>{this.renderSidebar()}</DetailSidebar>
      </FlexColumn>
    );
  }

  onRowHighlighted = (keys: TableHighlightedRows) => {
    if (keys.length > 0) {
      this.setState({
        selectedId: keys[0],
      });
    }
  };

  renderSidebar() {
    const { selectedId } = this.state;
    const { messageRows } = this.props.persistedState;
    if (selectedId !== null) {
      const message = messageRows.find((row) => row.key == selectedId);
      if (message != null) {
        return this.renderExtra(message.payload);
      }
    }
    return <Placeholder grow>Select a message to view details</Placeholder>;
  }

  renderExtra(extra: any) {
    return (
      <Panel floating={false} grow={false} heading={"Payload"}>
        <ManagedDataInspector data={extra} expandRoot={false} />
      </Panel>
    );
  }

  clear = () => {
    this.setState({ selectedId: null });
    this.props.setPersistedState({ messageRows: [] });
  };
}
