import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ClientSideRowModelModule, ColDef, Module } from 'ag-grid-community';
import { CheckboxDropdownCellComponent } from '../checkbox-dropdown-cell/checkbox-dropdown-cell.component';
import { FieldConfigService, FieldType } from '../../services/field-config.service';
import { firstValueFrom } from 'rxjs';
import { Store } from '@ngrx/store';
import { FieldConfigActions } from '../../store/field-config/field-config.actions';
import { selectFieldConfigs, selectSaving } from '../../store/field-config/field-config.selectors';

interface FieldConfigContext {
  getAvailableOrders: (data: any, field: string) => Promise<number[]>;
}

interface FieldTypeConfig {
  field: FieldType;
  headerName: string;
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
          [disabled]="saving$ | async"
        >
          {{ (saving$ | async) ? 'Saving...' : 'Save Configuration' }}
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldConfigTableComponent {
  private readonly fieldConfigService = inject(FieldConfigService);
  private readonly store = inject(Store);
  
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

  private readonly fieldTypes: FieldTypeConfig[] = [
    { field: 'collapsedHeader', headerName: 'Collapsed Header Field Order' },
    { field: 'samplePane', headerName: 'Sample Pane Field Order' }
  ];

  private async getAvailableOrders(data: any, field: string): Promise<number[]> {
    return firstValueFrom(this.fieldConfigService.getAvailableOrder(field as FieldType));
  }

  readonly context: FieldConfigContext = {
    getAvailableOrders: this.getAvailableOrders.bind(this)
  };

  readonly fieldConfigs$ = this.store.select(selectFieldConfigs);
  readonly saving$ = this.store.select(selectSaving);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.columnDefs = this.createColumnDefs();
    
    // Load initial data
    this.store.dispatch(FieldConfigActions.loadFieldConfigs());
  }

  private createColumnDefs(): ColDef[] {
    if (!this.isBrowser) return [];

    return [
      { 
        field: 'fieldName', 
        headerName: 'Field Name',
        flex: 1
      },
      ...this.fieldTypes.map(({ field, headerName }) => this.createOrderColumn(field, headerName))
    ];
  }

  private dispatchAction(actionType: 'visibility' | 'order', params: { data: any, field: string, [key: string]: any }): void {
    const action = actionType === 'visibility' 
      ? FieldConfigActions.updateFieldVisibility({
          id: params.data.id,
          fieldType: params.field as FieldType,
          visible: params['visible']
        })
      : FieldConfigActions.updateFieldOrder({
          id: params.data.id,
          fieldType: params.field as FieldType,
          order: params['order']
        });
    
    this.store.dispatch(action);
  }

  private createOrderColumn(field: string, headerName: string): ColDef {
    return {
      field,
      headerName,
      flex: 1.5,
      cellRenderer: CheckboxDropdownCellComponent,
      cellRendererParams: {
        onChange: (params: { data: any, field: string, visible: boolean }) => 
          this.dispatchAction('visibility', params),
        onOrderChange: (params: { data: any, field: string, order: number }) => 
          this.dispatchAction('order', params)
      }
    };
  }

  saveConfiguration(): void {
    this.store.dispatch(FieldConfigActions.saveConfiguration());
  }
}
