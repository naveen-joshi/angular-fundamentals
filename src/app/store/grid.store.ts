import { Injectable, computed, signal } from '@angular/core';

interface GridState {
  checkedFields: Record<string, boolean>;
  selectedOrders: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class GridStore {
  private state = signal<GridState>({
    checkedFields: {},
    selectedOrders: {}
  });

  private getFieldKey(rowId: string, fieldName: string): string {
    return `${rowId}_${fieldName}`;
  }

  setFieldChecked(rowId: string, fieldName: string, checked: boolean) {
    const fieldKey = this.getFieldKey(rowId, fieldName);
    const currentState = this.state();
    const wasChecked = currentState.checkedFields[fieldKey];
    
    // Update the checked state
    this.state.update(state => ({
      ...state,
      checkedFields: {
        ...state.checkedFields,
        [fieldKey]: checked
      }
    }));

    // Handle order changes based on checkbox state
    if (!checked && wasChecked) {
      this.setFieldOrder(rowId, fieldName, 0); // Clear order when unchecking
    } else if (checked && !wasChecked) {
      const nextOrder = this.getNextAvailableOrder(fieldName);
      this.setFieldOrder(rowId, fieldName, nextOrder);
    }
  }

  setFieldOrder(rowId: string, fieldName: string, order: number) {
    const fieldKey = this.getFieldKey(rowId, fieldName);
    
    if (order === 0) {
      // Remove the order when clearing
      const { [fieldKey]: _, ...remainingOrders } = this.state().selectedOrders;
      this.state.update(state => ({
        ...state,
        selectedOrders: remainingOrders
      }));
    } else {
      // Set new order
      this.state.update(state => ({
        ...state,
        selectedOrders: {
          ...state.selectedOrders,
          [fieldKey]: order
        }
      }));
    }
  }

  getFieldOrder(rowId: string, fieldName: string): number {
    const fieldKey = this.getFieldKey(rowId, fieldName);
    return this.state().selectedOrders[fieldKey] || 0;
  }

  isFieldChecked(rowId: string, fieldName: string): boolean {
    const fieldKey = this.getFieldKey(rowId, fieldName);
    return this.state().checkedFields[fieldKey] || false;
  }

  getNextAvailableOrder(fieldType: string): number {
    const orders = Object.entries(this.state().selectedOrders)
      .filter(([key]) => key.endsWith(fieldType))
      .map(([, order]) => order)
      .filter(order => order > 0);
    
    if (orders.length === 0) return 1;
    
    // Find the first missing number in the sequence
    const sortedOrders = orders.sort((a, b) => a - b);
    for (let i = 1; i <= sortedOrders.length + 1; i++) {
      if (!sortedOrders.includes(i)) {
        return i;
      }
    }
    return sortedOrders.length + 1;
  }

  getCheckedCount(fieldType: string): number {
    return Object.entries(this.state().checkedFields)
      .filter(([key, checked]) => checked && key.endsWith(fieldType))
      .length;
  }

  getAvailableOrders(fieldType: string): number[] {
    const count = this.getCheckedCount(fieldType);
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  readonly availableOrders = computed(() => {
    return (fieldType: string) => this.getAvailableOrders(fieldType);
  });
}
