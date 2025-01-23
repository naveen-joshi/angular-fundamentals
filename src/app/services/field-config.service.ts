import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';

export interface FieldConfig {
  id: number;
  fieldName: string;
  collapsedHeaderFieldVisible: boolean;
  collapsedHeaderFieldOrder: number | null;
  samplePaneVisible: boolean;
  samplePaneOrder: number | null;
}

export type FieldType = 'collapsedHeader' | 'samplePane';

type FieldProperties = { 
  visibleField: keyof FieldConfig; 
  orderField: keyof FieldConfig;
};

@Injectable({
  providedIn: 'root'
})
export class FieldConfigService {
  private readonly mockData: FieldConfig[] = [
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
  ];

  private readonly fieldTypeProperties: Record<FieldType, FieldProperties> = {
    collapsedHeader: { 
      visibleField: 'collapsedHeaderFieldVisible', 
      orderField: 'collapsedHeaderFieldOrder' 
    },
    samplePane: { 
      visibleField: 'samplePaneVisible', 
      orderField: 'samplePaneOrder' 
    }
  };

  getFieldConfigs(): Observable<FieldConfig[]> {
    // Simulating API call with delay
    return of(this.mockData).pipe(delay(500));
  }

  saveFieldConfigs(configs: FieldConfig[]): Observable<void> {
    // Simulating API call with delay
    this.mockData.splice(0, this.mockData.length, ...configs);
    return of(void 0).pipe(delay(500));
  }

  private getFieldProperties(fieldType: FieldType): FieldProperties {
    return this.fieldTypeProperties[fieldType];
  }

  private updateConfig(id: number, updates: Partial<FieldConfig>): void {
    const updatedConfigs = this.mockData.map(config => 
      config.id === id ? { ...config, ...updates } : config
    );
    this.mockData.splice(0, this.mockData.length, ...updatedConfigs);
  }

  updateField(id: number, fieldType: FieldType, update: { visible?: boolean; order?: number | null }): void {
    const { visibleField, orderField } = this.getFieldProperties(fieldType);
    
    if (update.visible !== undefined) {
      this.updateConfig(id, {
        [visibleField]: update.visible,
        [orderField]: update.visible ? this.mockData.find(c => c.id === id)?.[orderField] : null
      });
    }
    
    if (update.order !== undefined) {
      this.updateConfig(id, { [orderField]: update.order });
    }
  }

  // Public convenience methods
  updateHeaderVisibility(id: number, visible: boolean): void {
    this.updateField(id, 'collapsedHeader', { visible });
  }

  updateHeaderOrder(id: number, order: number | null): void {
    this.updateField(id, 'collapsedHeader', { order });
  }

  updatePaneVisibility(id: number, visible: boolean): void {
    this.updateField(id, 'samplePane', { visible });
  }

  updatePaneOrder(id: number, order: number | null): void {
    this.updateField(id, 'samplePane', { order });
  }

  getAvailableOrder(fieldType: FieldType): Observable<number[]> {
    const { visibleField } = this.getFieldProperties(fieldType);
    
    return of(this.mockData).pipe(
      delay(500),
      map((configs: FieldConfig[]) => {
        const visibleCount = configs.filter(config => config[visibleField]).length;
        return Array.from({ length: visibleCount }, (_, i) => i + 1);
      })
    );
  }

  getCheckedCount(fieldType: FieldType): Observable<number> {
    const { visibleField } = this.getFieldProperties(fieldType);
    
    return of(this.mockData).pipe(
      delay(500),
      map(configs => configs.filter(config => config[visibleField]).length)
    );
  }
}
