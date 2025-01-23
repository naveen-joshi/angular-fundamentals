import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FieldType } from '../../services/field-config.service';
import { selectAvailableOrders } from '../../store/field-config/field-config.selectors';

interface CheckboxDropdownParams extends ICellRendererParams {
  onChange?: (params: { data: any; field: string; visible: boolean }) => void;
  onOrderChange?: (params: { data: any; field: string; order: number }) => void;
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
        [checked]="isChecked"
        (change)="onCheckboxChange($event)"
        class="form-checkbox h-5 w-5 text-blue-600"
      >
      @if (isChecked) {
        <select 
          [(ngModel)]="selectedOrder"
          (ngModelChange)="onOrderChange($event)"
          class="px-2 py-1 border rounded flex-grow"
        >
          <option [ngValue]="null">Select order...</option>
          @for (order of availableOrders$ | async; track order) {
            <option [ngValue]="order">{{ order }}</option>
          }
        </select>
      }
    </div>
  `
})
export class CheckboxDropdownCellComponent implements ICellRendererAngularComp {
  private readonly store = inject(Store);
  
  params!: CheckboxDropdownParams;
  fieldName: string = '';
  rowId: string = '';
  fieldType: FieldType = 'collapsedHeader';
  
  isChecked = false;
  selectedOrder: number | null = null;
  availableOrders$ = this.store.select(selectAvailableOrders(this.fieldType));

  private getFieldData(): FieldData {
    const fieldData = this.params.data[this.fieldName];
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
    if (params.colDef?.field) {
      this.fieldName = params.colDef.field;
      this.fieldType = this.fieldName as FieldType;
      this.rowId = params.data.id;
      this.availableOrders$ = this.store.select(selectAvailableOrders(this.fieldType));
      this.initializeFieldState();
    }
  }

  refresh(params: CheckboxDropdownParams): boolean {
    return false;
  }

  onCheckboxChange(event: any): void {
    const checked = event.target.checked;
    this.isChecked = checked;
    
    if (this.params.onChange) {
      this.params.onChange({
        data: this.params.data,
        field: this.fieldName,
        visible: checked
      });
    }

    if (!checked) {
      this.selectedOrder = null;
    }
  }

  onOrderChange(order: number): void {
    this.selectedOrder = order;
    
    if (this.params.onOrderChange) {
      this.params.onOrderChange({
        data: this.params.data,
        field: this.fieldName,
        order
      });
    }
  }
}
