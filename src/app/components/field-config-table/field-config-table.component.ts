import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ClientSideRowModelModule, ColDef, Module } from 'ag-grid-community';
import { CheckboxDropdownCellComponent } from '../checkbox-dropdown-cell/checkbox-dropdown-cell.component';
import { FieldConfigService, FieldType } from '../../services/field-config.service';
import { firstValueFrom, map } from 'rxjs';

interface FieldConfigContext {
  getAvailableOrders: (data: any, field: string) => Promise<number[]>;
}

@Component({
  selector: 'app-field-config-table',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    AgGridModule,
    CheckboxDropdownCellComponent
  ],
  template: `
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4">Field Configuration</h2>
      
      <div class="ag-theme-alpine w-full" style="height: 500px; min-height: 500px;">
        @if (isBrowser) {
          <ag-grid-angular
            class="w-full h-full"
            [modules]="modules"
            [rowData]="fieldConfigs$ | async"
            [columnDefs]="columnDefs"
            [context]="context"
            [defaultColDef]="defaultColDef"
            theme="legacy"
          >
          </ag-grid-angular>
        }
      </div>
      
      <div class="mt-4 flex justify-end">
        <button 
          (click)="saveConfiguration()"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Configuration
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldConfigTableComponent {
  private readonly fieldConfigService = inject(FieldConfigService);
  readonly isBrowser: boolean;
  readonly columnDefs: ColDef[];
  readonly modules: Module[] = [
    ClientSideRowModelModule,
    AllCommunityModule
  ];

  readonly defaultColDef = {
    sortable: true,
    resizable: true
  };

  readonly context: FieldConfigContext = {
    getAvailableOrders: async (data: any, field: string) => {
      const orders = await firstValueFrom(this.fieldConfigService.getAvailableOrder(field as FieldType));
      return orders;
    }
  };

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.columnDefs = this.createColumnDefs();
  }

  private createColumnDefs(): ColDef[] {
    if (!this.isBrowser) return [];

    return [
      { 
        field: 'fieldName', 
        headerName: 'Field Name',
        flex: 1
      },
      this.createOrderColumn('collapsedHeader', 'Collapsed Header Field Order'),
      this.createOrderColumn('samplePane', 'Sample Pane Field Order')
    ];
  }

  private createOrderColumn(field: string, headerName: string): ColDef {
    return {
      field,
      headerName,
      flex: 1.5,
      cellRenderer: CheckboxDropdownCellComponent,
      cellRendererParams: {
        onChange: (params: { data: any, field: string, visible: boolean }) => {
          const updateFn = field === 'collapsedHeader' 
            ? this.fieldConfigService.updateHeaderVisibility.bind(this.fieldConfigService)
            : this.fieldConfigService.updatePaneVisibility.bind(this.fieldConfigService);
          updateFn(params.data.id, params.visible);
        },
        onOrderChange: (params: { data: any, field: string, order: number }) => {
          const updateFn = field === 'collapsedHeader'
            ? this.fieldConfigService.updateHeaderOrder.bind(this.fieldConfigService)
            : this.fieldConfigService.updatePaneOrder.bind(this.fieldConfigService);
          updateFn(params.data.id, params.order);
        }
      }
    };
  }

  readonly fieldConfigs$ = this.fieldConfigService.getFieldConfigs().pipe(
    map(configs => configs.map(config => ({
      ...config,
      collapsedHeader: {
        visible: config.collapsedHeaderFieldVisible,
        order: config.collapsedHeaderFieldOrder
      },
      samplePane: {
        visible: config.samplePaneVisible,
        order: config.samplePaneOrder
      }
    })))
  );

  async saveConfiguration(): Promise<void> {
    // You can add any validation or additional logic here before saving
    console.log('Configuration saved successfully');
    // TODO: Add actual save to backend implementation when needed
  }
}
