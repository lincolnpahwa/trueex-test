import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Cell, Column, ColumnGroup, Table } from 'fixed-data-table';
import '../../../node_modules/fixed-data-table/dist/fixed-data-table.css';
import _ from 'lodash';

import styles from '../../styles/app.css';

function throttle(fn, time) {
  let timeoutId = null;
  
  const inner = () => {
    fn()
    timeoutId = null
  }
  
  return () => {
    if (!timeoutId) {
      timeoutId = setTimeout(inner, time)
    }
  }
}

@connect(
    state => ({rows: state.rows, cols: state.cols || new Array(10)})
)
export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      cols: new Array(10),
      bufferedRows: []
    };
    this.onSnapshotReceived = this.onSnapshotReceived.bind(this);
    this.onUpdateReceived = this.onUpdateReceived.bind(this);
    this._onSocketConnect = this._onSocketConnect.bind(this);
    this._cell = this._cell.bind(this);
    this._headerCell = this._headerCell.bind(this);
    this._generateCols = this._generateCols.bind(this);
    this.throttledRowUpdate = throttle(this.updateRows.bind(this), 500);
    this._resetColors = this._resetColors.bind(this);
    this._checkSocketConnection = this._checkSocketConnection.bind(this);
  }

  onSnapshotReceived(data) {
    let rows = [];
    data.forEach(row => {
      rows[row.id] = row;
    });
    // const rows = this.state.rows.concat(data);
    console.log('snapshot' + rows);
    const cols = Object.keys(rows[0]);
    this.setState({rows, cols, bufferedRows: rows});
  };
  onUpdateReceived(data) {
    // const rows = this.state.rows.concat(data);

    let bufferedRows = this.state.bufferedRows;
    data.forEach(newRow => {
      bufferedRows[newRow.id] = newRow;
    });

    this.throttledRowUpdate();
  };

  updateRows() {
    let bufferedRows = this.state.bufferedRows;
    let rows = this.state.rows;

    let updatedRows = rows.map((row) => {
      return this._calculateDiff(bufferedRows[row.id], row);
    });

    this.setState({rows: updatedRows});

    setTimeout(this._resetColors, 150);
  }
  _cell(cellProps) {
    const rowIndex = cellProps.rowIndex;
    const rowData = this.state.rows[rowIndex];
    const col = this.state.cols[cellProps.columnKey];
    const content = rowData[col];
    const contentDiff = rowData[`${col}_diff`];
    let className = ''
    if (contentDiff !== undefined && contentDiff !== 0 && contentDiff !== null) {
      className = contentDiff > 0 ? 'change-green' : 'change-red';
    }
    return (
      <Cell className={className}>{content}</Cell>
    );
  }

  _headerCell(cellProps) {
    const col = this.state.cols[cellProps.columnKey];
    return (
      <Cell>{col}</Cell>
    );
  }

  _generateCols() {
    let cols = [];
    this.state.cols.forEach((row, index) => {
      cols.push(
        <Column
          width={100}
          flexGrow={1}
          cell={this._cell}
          header={this._headerCell}
          columnKey={index}
          />
      );
    });
    return cols;
  };

  _calculateDiff(updated, current) {
    Object.keys(current).forEach((key) => {
      updated[`${key}_diff`] = updated[key] - current[key]
    })

    return updated;
  };

  _resetColors() {
    let rows = this.state.rows.map((row) => {
      Object.keys(row).forEach((key) => {
        if (!key.includes('_diff')) {
          row[`${key}_diff`] = undefined; 
        }

      })
      return row;
    })

    this.setState({rows})
  };

  _onSocketConnect() {
    socket.on('snapshot', this.onSnapshotReceived);
    socket.on('updates', this.onUpdateReceived);
  }

  _checkSocketConnection() {
    if (socket && socket.connected) {
      this._onSocketConnect();
      socket.on('disconnect', this._checkSocketConnection);
    } else {
      setTimeout(this._checkSocketConnection, 1000);
    }
  }

  componentDidMount() {
    if (socket) {
      this._onSocketConnect();
      socket.on('disconnect', this._checkSocketConnection);
    }
  };
  componentWillUnmount() {
    if (socket) {
      socket.removeListener('snapshot', this.onSnapshotReceived);
      socket.removeListener('updates', this.onUpdateReceived);
      socket.removeListener('disconnect', this._checkSocketConnection);
    }
  };

  render() {
    const columns = this._generateCols();
    return (
      <Table
        rowHeight={30}
        width={window.innerWidth}
        maxHeight={window.innerHeight}
        headerHeight={35}
        rowsCount={this.state.rows.length}
        >
        {columns}
      </Table>
    );
  }
}
