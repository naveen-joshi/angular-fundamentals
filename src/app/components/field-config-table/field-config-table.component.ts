import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { CheckboxDropdownCellComponent } from '../checkbox-dropdown-cell/checkbox-dropdown-cell.component';
import { FieldConfigService } from '../../services/field-config.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-field-config-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Field Configuration</h2>
      
      <div class="ag-theme-alpine" style="height: 500px">
        <ag-grid-angular
          [rowData]="fieldConfigs$ | async"
          [columnDefs]="columnDefs"
          [context]="context"
          [defaultColDef]="defaultColDef"
        >
        </ag-grid-angular>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldConfigTableComponent {
  private fieldConfigService = inject(FieldConfigService);
  fieldConfigs$ = this.fieldConfigService.getFieldConfigs();
  
  columnDefs: ColDef[] = [
    { 
      field: 'fieldName', 
      headerName: 'Field Name',
      flex: 1
    },
    {
      field: 'collapsedHeader',
      headerName: 'Collapsed Header Field Order',
      flex: 1.5,
      cellRenderer: CheckboxDropdownCellComponent,
      cellRendererParams: {
        onVisibilityChange: (data: any, checked: boolean) => 
          this.fieldConfigService.updateHeaderVisibility(data.id, checked),
        onOrderChange: (data: any, order: number) =>
          this.fieldConfigService.updateHeaderOrder(data.id, order)
      }
    },
    {
      field: 'samplePane',
      headerName: 'Sample Pane Field Order',
      flex: 1.5,
      cellRenderer: CheckboxDropdownCellComponent,
      cellRendererParams: {
        onVisibilityChange: (data: any, checked: boolean) => 
          this.fieldConfigService.updatePaneVisibility(data.id, checked),
        onOrderChange: (data: any, order: number) =>
          this.fieldConfigService.updatePaneOrder(data.id, order)
      }
    }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true
  };

  context = {
    getAvailableOrders: async (data: any, isHeader: boolean) => {
      const configs = await firstValueFrom(this.fieldConfigService.getFieldConfigs());
      const maxOrder = Math.max(...configs
        .map(c => isHeader ? c.collapsedHeaderFieldOrder : c.samplePaneOrder)
        .filter(order => order !== null)) || 0;
      return Array.from({ length: maxOrder + 2 }, (_, i) => i);
    }
  };

  constructor() {
  }
}
