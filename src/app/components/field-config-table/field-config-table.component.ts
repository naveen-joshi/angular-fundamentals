import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, Inject, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { AllCommunityModule, ClientSideRowModelModule, ColDef, Module } from 'ag-grid-community';
import { CheckboxDropdownCellComponent } from '../checkbox-dropdown-cell/checkbox-dropdown-cell.component';
import { FieldType } from '../../services/field-config.service';
import { FieldConfigStore } from '../../store/field-config/field-config.store';

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
            [rowData]="store.transformedConfigs()"
            [columnDefs]="columnDefs"
            [modules]="modules"
            [theme]="'legacy'"
            [defaultColDef]="defaultColDef"
            (gridReady)="onGridReady()"
          />
        }
      </div>

      <div class="mt-4 flex justify-end gap-4">
        @if (store.saving()) {
          <span class="text-blue-600">Saving changes...</span>
        }
        @if (store.error()) {
          <span class="text-red-600">{{ store.error() }}</span>
        }
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          [disabled]="store.saving()"
          (click)="saveChanges()"
        >
          Save Changes
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldConfigTableComponent {
  protected readonly store = inject(FieldConfigStore);
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly modules: Module[] = [
    ClientSideRowModelModule,
    AllCommunityModule
  ];

  protected readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true
  };

  protected readonly columnDefs: ColDef[] = [
    { field: 'fieldName', headerName: 'Field Name', width: 150 },
    {
      field: 'collapsedHeader',
      headerName: 'Collapsed Header',
      cellRenderer: CheckboxDropdownCellComponent,
      cellRendererParams: {
        fieldType: 'collapsedHeader' as FieldType,
        onVisibilityChange: (id: number, visible: boolean) => {
          this.store.updateFieldVisibility(id, 'collapsedHeader', visible);
        },
        onOrderChange: (id: number, order: number | null) => {
          this.store.updateFieldOrder(id, 'collapsedHeader', order);
        },
        getAvailableOrders: () => this.store.availableOrders()('collapsedHeader'),
        getCheckedCount: () => this.store.checkedCount()('collapsedHeader')
      }
    },
    {
      field: 'samplePane',
      headerName: 'Sample Pane',
      cellRenderer: CheckboxDropdownCellComponent,
      cellRendererParams: {
        fieldType: 'samplePane' as FieldType,
        onVisibilityChange: (id: number, visible: boolean) => {
          this.store.updateFieldVisibility(id, 'samplePane', visible);
        },
        onOrderChange: (id: number, order: number | null) => {
          this.store.updateFieldOrder(id, 'samplePane', order);
        },
        getAvailableOrders: () => this.store.availableOrders()('samplePane'),
        getCheckedCount: () => this.store.checkedCount()('samplePane')
      }
    }
  ];

  constructor() {
    effect(() => {
      if (this.store.error()) {
        console.error('Error:', this.store.error());
      }
    });
  }

  protected onGridReady(): void {
    this.store.loadFieldConfigs();
  }

  protected saveChanges(): void {
    this.store.saveConfiguration();
  }
}
