import { Component, Input, OnChanges, OnInit, Type, EventEmitter, Output } from '@angular/core';
import { TableComparatorService } from '../../../services/table-comparator.service';
import { SortBy, SortOrder } from '../../../types/sort-properties';
import { Logger } from 'path-to-logger-service';

export class SortableTableComponent implements OnInit, OnChanges {

  constructor(private tableComparatorService: TableComparatorService, private logger: Logger) { } // 添加logger服务

  ngOnInit(): void {
    this.logger.info('Initializing SortableTableComponent...');
    this.tableRows = this.rows;
    this.initialSort(); // Performs an initial sort on the table
    this.setMainTableStyle = this.headerColorScheme === SortableTableHeaderColorScheme.BLUE;
  }

  ngOnChanges(): void {
    this.logger.info('Changes detected in SortableTableComponent. Updating rows...');
    this.tableRows = this.rows;
    this.sortRows();
  }

  onClickHeader(columnHeader: string): void {
    this.logger.info(`Header clicked: ${columnHeader}. Sorting rows...`);
    this.sortOrder = this.columnToSortBy === columnHeader && this.sortOrder === SortOrder.ASC
        ? SortOrder.DESC : SortOrder.ASC;
    this.columnToSortBy = columnHeader;
    this.sortRows();
  }

  sortRows(): void {
    this.logger.info(`Sorting rows by column: ${this.columnToSortBy}`);
  }

  initialSort(): void {
    this.logger.info('Performing initial sort...');
  }


}



/**
 * The color scheme of the header of the table
 */
export enum SortableTableHeaderColorScheme {
  /**
   * Blue background with white text.
   */
  BLUE,

  /**
   * White background with black text.
   */
  WHITE,

  /**
   * Custom background setting
   */
  OTHERS,
}

/**
 * Column data for sortable table
 */
export interface ColumnData {
  header: string;
  headerToolTip?: string;
  sortBy?: SortBy; // optional if the column is not sortable
  alignment?: 'start' | 'center' | 'end'; // defaults to start
  headerClass?: string; // additional stylings
}

export type SortableEvent = {
  sortBy: SortBy,
  sortOrder: SortOrder,
};

/**
 * Data provided for each table cell
 * Priority of display
 * 1. customComponent
 * 2. displayValue
 * 3. value
 */
export interface SortableTableCellData {
  value?: any; // Optional value used for sorting with sortBy provided in ColumnData
  displayValue?: string; // Raw string to be display in the cell
  style?: string; // Optional value used to set style of data
  customComponent?: {
    component: Type<any>,
    componentData: (idx: number) => Record<string, any>, // @Input values for component
  };
}

/**
 * Displays a sortable table, sorting by clicking on the header
 * Optional sortBy option provided for each column
 * Columns and rows provided must be aligned
 * Remember to register new dynamic components using the withComponents method under sortable-table-module
 */
@Component({
  selector: 'tm-sortable-table',
  templateUrl: './sortable-table.component.html',
  styleUrls: ['./sortable-table.component.scss'],
})
export class SortableTableComponent implements OnInit, OnChanges {

  // enum
  SortOrder: typeof SortOrder = SortOrder;

  @Input()
  tableId: string = '';

  @Input()
  headerColorScheme: SortableTableHeaderColorScheme = SortableTableHeaderColorScheme.BLUE;

  @Input()
  customHeaderStyle: string = '';

  @Input()
  columns: ColumnData[] = [];

  @Input()
  rows: SortableTableCellData[][] = [];

  @Input()
  initialSortBy: SortBy = SortBy.NONE;

  @Input()
  sortOrder: SortOrder = SortOrder.ASC;

  @Output()
  sortEvent: EventEmitter<SortableEvent> = new EventEmitter();

  columnToSortBy: string = '';
  tableRows: SortableTableCellData[][] = [];
  setMainTableStyle: boolean = true;

  constructor(private tableComparatorService: TableComparatorService) { }


  ngOnInit(): void {
    this.tableRows = this.rows;
    this.initialSort(); // Performs an initial sort on the table
    this.setMainTableStyle = this.headerColorScheme === SortableTableHeaderColorScheme.BLUE;
  }

  ngOnChanges(): void {
    this.tableRows = this.rows;
    this.sortRows();
  }

  onClickHeader(columnHeader: string): void {
    this.sortOrder = this.columnToSortBy === columnHeader && this.sortOrder === SortOrder.ASC
        ? SortOrder.DESC : SortOrder.ASC;
    this.columnToSortBy = columnHeader;
    this.sortRows();
  }

  getAriaSort(column: String): String {
    if (column !== this.columnToSortBy) {
      return 'none';
    }
    return this.sortOrder === SortOrder.ASC ? 'ascending' : 'descending';
  }

  sortRows(): void {
    if (!this.columnToSortBy) {
      return;
    }
    const columnIndex: number = this.columns.findIndex(
        (column: ColumnData) => column.header === this.columnToSortBy);
    if (columnIndex < 0) {
      return;
    }
    const sortBy: SortBy | undefined = this.columns[columnIndex].sortBy;
    if (!sortBy) {
      return;
    }

/**
 * This code snippet is responsible for sorting table rows based on the team number extracted from a string.
 */
    const extractTeamNumber = (teamString: string): number => {
        return parseInt(teamString.replace('Team ', ''), 10);
    };

     this.tableRows.sort((row1: any[], row2: any[]) => {
            const teamNumber1 = extractTeamNumber(row1[columnIndex].value);
            const teamNumber2 = extractTeamNumber(row2[columnIndex].value);
            return teamNumber1 - teamNumber2;
        });

    this.sortEvent.emit({ sortBy, sortOrder: this.sortOrder });
  }

  /**
   * Sorts the table with an initial SortBy
   */
  initialSort(): void {
    const indexOfColumnToSort: number =
        this.columns.findIndex((column: ColumnData) => column.sortBy === this.initialSortBy);
    if (indexOfColumnToSort < 0) {
      return;
    }

    this.columnToSortBy = this.columns[indexOfColumnToSort].header;
    this.sortRows();
  }

  getStyle(cellData: SortableTableCellData): string | undefined {
    return cellData.style;
  }

  getAlignment(column: ColumnData): { 'text-align': ColumnData['alignment'] } {
    return {
      'text-align': `${column?.alignment || 'start'}`,
    };
  }
}
