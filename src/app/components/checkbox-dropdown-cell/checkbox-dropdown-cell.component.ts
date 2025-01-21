import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
          [value]="params.value?.order || ''"
          (change)="onOrderChange($event)"
          class="px-2 py-1 border rounded flex-grow"
        >
          <option value="">Select Order</option>
          @for (order of availableOrders; track order) {
            <option [value]="order">{{ order }}</option>
          }
        </select>
      }
    </div>
  `
})
export class CheckboxDropdownCellComponent implements ICellRendererAngularComp {
  params!: any;
  isChecked: boolean = false;
  availableOrders: number[] = [];

  agInit(params: ICellRendererParams): void {
    this.params = params;
    if (params.colDef?.field) {
      this.isChecked = params.data[params.colDef.field + 'Visible'];
      this.availableOrders = this.params.context.getAvailableOrders(params.data, params.colDef.field === 'collapsedHeader');
    }
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onCheckboxChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (this.params.onVisibilityChange) {
      this.params.onVisibilityChange(this.params.data, checked);
    }
  }

  onOrderChange(event: Event): void {
    const order = parseInt((event.target as HTMLSelectElement).value);
    if (this.params.onOrderChange) {
      this.params.onOrderChange(this.params.data, order);
    }
  }
}
