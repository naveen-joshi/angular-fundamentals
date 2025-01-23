import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldType } from '../../services/field-config.service';
import { FieldConfigStore } from '../../store/field-config/field-config.store';

interface CheckboxDropdownParams extends ICellRendererParams {
  onVisibilityChange?: (id: number, visible: boolean) => void;
  onOrderChange?: (id: number, order: number | null) => void;
  fieldType: FieldType;
  getAvailableOrders: () => number[];
  getCheckedCount: () => number;
}

interface FieldData {
  visible: boolean;
  order: number | null;
}

@Component({
  selector: 'app-checkbox-dropdown-cell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center gap-2">
      <input 
        type="checkbox"
        [(ngModel)]="isChecked"
        (ngModelChange)="onCheckboxChange($event)"
        class="form-checkbox h-5 w-5 text-blue-600"
      >
      @if (isChecked) {
        <select 
          [(ngModel)]="selectedOrder"
          (ngModelChange)="onOrderChange($event)"
          class="px-2 py-1 border rounded flex-grow"
        >
          @for (order of params.getAvailableOrders(); track order) {
            <option [ngValue]="order">{{ order }}</option>
          }
        </select>
      }
    </div>
  `
})
export class CheckboxDropdownCellComponent implements ICellRendererAngularComp {
  protected readonly store = inject(FieldConfigStore);
  
  params!: CheckboxDropdownParams;
  fieldName: string = '';
  rowId: string = '';
  fieldType: FieldType = 'collapsedHeader';
  
  isChecked = false;
  selectedOrder: number | null = null;

  private getFieldData(): FieldData {
    const data = this.params.data;
    const fieldData = data[this.fieldType];
    return {
      visible: fieldData?.visible ?? false,
      order: fieldData?.order ?? null
    };
  }

  private initializeFieldState(): void {
    const fieldData = this.getFieldData();
    this.isChecked = fieldData.visible;
    this.selectedOrder = fieldData.order;
  }

  agInit(params: CheckboxDropdownParams): void {
    this.params = params;
    this.fieldName = params.colDef?.field ?? '';
    this.fieldType = this.fieldName as FieldType;
    this.rowId = params.data.id;
    this.initializeFieldState();
  }

  refresh(): boolean {
    return false;
  }

  onCheckboxChange(checked: boolean): void {
    if (checked) {
      // When checkbox is checked, get the current checked count directly from the signal
      this.selectedOrder = this.params.getCheckedCount();
      if (this.params.onOrderChange) {
        this.params.onOrderChange(this.params.data.id, this.selectedOrder);
      }
    }

    if (this.params.onVisibilityChange) {
      this.params.onVisibilityChange(this.params.data.id, checked);
    }

    if (!checked) {
      this.selectedOrder = null;
      if (this.params.onOrderChange) {
        this.params.onOrderChange(this.params.data.id, null);
      }
    }
  }

  onOrderChange(value: number | null): void {
    if (value === undefined) return;
    
    this.selectedOrder = value;
    
    if (this.params.onOrderChange && value !== null) {
      this.params.onOrderChange(this.params.data.id, value);
    }
  }
}
