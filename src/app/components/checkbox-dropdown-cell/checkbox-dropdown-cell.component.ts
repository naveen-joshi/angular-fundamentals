import { Component, inject } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridStore } from '../../store/grid.store';

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
          @for (order of availableOrders()(fieldName); track order) {
            <option [ngValue]="order">{{ order }}</option>
          }
        </select>
      }
    </div>
  `
})
export class CheckboxDropdownCellComponent implements ICellRendererAngularComp {
  private readonly gridStore = inject(GridStore);
  
  params!: CheckboxDropdownParams;
  fieldName: string = '';
  rowId: string = '';
  
  private getFieldData(): FieldData | undefined {
    return this.params.data?.[this.fieldName];
  }

  get isChecked(): boolean {
    return this.getFieldData()?.visible ?? false;
  }

  get selectedOrder(): number | null {
    const fieldData = this.getFieldData();
    if (!fieldData?.visible) return null;
    
    if (fieldData.order !== null && fieldData.order > 0) {
      return fieldData.order;
    }
    
    const order = this.gridStore.getFieldOrder(this.rowId, this.fieldName);
    return order > 0 ? order : null;
  }

  set selectedOrder(value: number | null) {
    if (value !== null) {
      this.onOrderChange(value);
    }
  }

  readonly availableOrders = this.gridStore.availableOrders;

  private initializeFieldState(fieldData: FieldData): void {
    this.gridStore.setFieldChecked(this.rowId, this.fieldName, fieldData.visible);
    if (fieldData.order !== null) {
      this.gridStore.setFieldOrder(this.rowId, this.fieldName, fieldData.order);
    }
  }

  agInit(params: CheckboxDropdownParams): void {
    this.params = params;
    if (params.colDef?.field) {
      this.fieldName = params.colDef.field;
      this.rowId = params.data.id;
      
      const fieldData = this.getFieldData();
      if (fieldData) {
        this.initializeFieldState(fieldData);
      }
    }
  }

  refresh(params: CheckboxDropdownParams): boolean {
    if (params.colDef?.field) {
      this.params = params;
      this.fieldName = params.colDef.field;
      this.rowId = params.data.id;
    }
    return true;
  }

  async updateAvailableOrders(): Promise<void> {
    if (!this.params.colDef?.field) return;

    const orders = await this.params.context.getAvailableOrders(
      this.params.data, 
      this.params.colDef.field
    );

    if (orders?.length > 0) {
      this.gridStore.setFieldOrder(this.rowId, this.fieldName, orders[0]);
    }
  }

  onCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    this.gridStore.setFieldChecked(this.rowId, this.fieldName, checked);
    
    if (this.params.onChange) {
      this.params.onChange({
        data: this.params.data,
        field: this.fieldName,
        visible: checked
      });

      if (checked && this.params.onOrderChange) {
        const order = this.gridStore.getFieldOrder(this.rowId, this.fieldName);
        if (order > 0) {
          this.params.onOrderChange({
            data: this.params.data,
            field: this.fieldName,
            order
          });
        }
      }
    }
  }

  onOrderChange(order: number | null): void {
    if (order !== null && order > 0) {
      this.gridStore.setFieldOrder(this.rowId, this.fieldName, order);
      
      if (this.params.onOrderChange) {
        this.params.onOrderChange({
          data: this.params.data,
          field: this.fieldName,
          order
        });
      }
    }
  }
}
