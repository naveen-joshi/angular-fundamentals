import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

export interface FieldConfig {
  id: number;
  fieldName: string;
  collapsedHeaderFieldVisible: boolean;
  collapsedHeaderFieldOrder: number | null;
  samplePaneVisible: boolean;
  samplePaneOrder: number | null;
}

export type FieldType = 'collapsedHeader' | 'samplePane';

@Injectable({
  providedIn: 'root'
})
export class FieldConfigService {
  private fieldConfigs = new BehaviorSubject<FieldConfig[]>([
    { id: 1, fieldName: 'Field 1', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
    { id: 2, fieldName: 'Field 2', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
    { id: 3, fieldName: 'Field 3', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
    { id: 4, fieldName: 'Field 4', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
    { id: 5, fieldName: 'Field 5', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
    { id: 6, fieldName: 'Field 6', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
    { id: 7, fieldName: 'Field 7', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
    { id: 8, fieldName: 'Field 8', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
    { id: 9, fieldName: 'Field 9', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
    { id: 10, fieldName: 'Field 10', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null }
  ]);

  getFieldConfigs(): Observable<FieldConfig[]> {
    return this.fieldConfigs.asObservable();
  }

  private getFieldProperties(fieldType: FieldType): { visibleField: keyof FieldConfig; orderField: keyof FieldConfig } {
    return fieldType === 'collapsedHeader'
      ? { visibleField: 'collapsedHeaderFieldVisible', orderField: 'collapsedHeaderFieldOrder' }
      : { visibleField: 'samplePaneVisible', orderField: 'samplePaneOrder' };
  }

  private updateConfig(id: number, updates: Partial<FieldConfig>): void {
    const currentConfigs = this.fieldConfigs.value;
    const updatedConfigs = currentConfigs.map(config => 
      config.id === id ? { ...config, ...updates } : config
    );
    this.fieldConfigs.next(updatedConfigs);
  }

  updateVisibility(id: number, fieldType: FieldType, visible: boolean): void {
    const { visibleField, orderField } = this.getFieldProperties(fieldType);
    this.updateConfig(id, {
      [visibleField]: visible,
      [orderField]: visible ? this.fieldConfigs.value.find(c => c.id === id)?.[orderField] : null
    });
  }

  updateOrder(id: number, fieldType: FieldType, order: number | null): void {
    const { orderField } = this.getFieldProperties(fieldType);
    this.updateConfig(id, { [orderField]: order });
  }

  // Public convenience methods
  updateHeaderVisibility(id: number, visible: boolean): void {
    this.updateVisibility(id, 'collapsedHeader', visible);
  }

  updateHeaderOrder(id: number, order: number | null): void {
    this.updateOrder(id, 'collapsedHeader', order);
  }

  updatePaneVisibility(id: number, visible: boolean): void {
    this.updateVisibility(id, 'samplePane', visible);
  }

  updatePaneOrder(id: number, order: number | null): void {
    this.updateOrder(id, 'samplePane', order);
  }

  private reorderItems(configs: FieldConfig[], fieldType: FieldType): FieldConfig[] {
    const { visibleField, orderField } = this.getFieldProperties(fieldType);

    // Get all checked items sorted by their current order
    const checkedItems = configs
      .filter(config => config[visibleField])
      .sort((a, b) => {
        const aOrder = a[orderField] as number | null;
        const bOrder = b[orderField] as number | null;
        return (aOrder ?? 0) - (bOrder ?? 0);
      });

    // Reassign orders sequentially starting from 1
    const reorderedConfigs = configs.map(config => {
      if (!config[visibleField]) {
        return { ...config, [orderField]: null };
      }
      const newOrder = checkedItems.findIndex(item => item.id === config.id) + 1;
      return { ...config, [orderField]: newOrder };
    });

    return reorderedConfigs;
  }

  updateFieldConfig(updatedConfig: FieldConfig, fieldType: FieldType): void {
    const currentConfigs = this.fieldConfigs.getValue();
    let updatedConfigs = [...currentConfigs];
    const { visibleField, orderField } = this.getFieldProperties(fieldType);
    
    // If unchecking a field
    if (!updatedConfig[visibleField]) {
      // First update the specific config
      updatedConfigs = updatedConfigs.map(config => 
        config.id === updatedConfig.id ? 
        { ...updatedConfig, [orderField]: null } : config
      );
      // Then reorder all remaining checked items
      updatedConfigs = this.reorderItems(updatedConfigs, fieldType);
    }
    // If changing order
    else if (updatedConfig[orderField] !== null) {
      const oldOrder = currentConfigs.find(c => c.id === updatedConfig.id)?.[orderField];
      const newOrder = updatedConfig[orderField]!;
      
      if (oldOrder !== newOrder) {
        // First update the specific config
        updatedConfigs = updatedConfigs.map(config => 
          config.id === updatedConfig.id ? updatedConfig : config
        );
        // Then reorder all items to ensure sequential ordering
        updatedConfigs = this.reorderItems(updatedConfigs, fieldType);
      }
    }
    // If checking a field (no order yet)
    else if (updatedConfig[visibleField] && updatedConfig[orderField] === null) {
      // First update the specific config
      const checkedCount = currentConfigs.filter(config => 
        config[visibleField] && config.id !== updatedConfig.id
      ).length;
      updatedConfigs = updatedConfigs.map(config => 
        config.id === updatedConfig.id ? 
        { ...updatedConfig, [orderField]: checkedCount + 1 } : config
      );
    }

    this.fieldConfigs.next(updatedConfigs);
  }

  getAvailableOrder(fieldType: FieldType): Observable<number[]> {
    return this.fieldConfigs.pipe(
      map(configs => {
        const checkedCount = configs.filter(config => 
          config[this.getFieldProperties(fieldType).visibleField]
        ).length;
        
        // Return all possible positions from 1 to checkedCount
        return Array.from({ length: checkedCount }, (_, i) => i + 1);
      })
    );
  }

  getCheckedCount(fieldType: FieldType): Observable<number> {
    return this.fieldConfigs.pipe(
      map(configs => configs.filter(config => 
        config[this.getFieldProperties(fieldType).visibleField]
      ).length)
    );
  }
}
