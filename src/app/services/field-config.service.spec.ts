import { TestBed } from '@angular/core/testing';
import { FieldConfigService } from './field-config.service';
import { firstValueFrom } from 'rxjs';

describe('FieldConfigService', () => {
  let service: FieldConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FieldConfigService]
    });
    service = TestBed.inject(FieldConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFieldConfigs', () => {
    it('should return initial field configs', async () => {
      const configs = await firstValueFrom(service.getFieldConfigs());
      expect(configs.length).toBeGreaterThan(0);
      expect(configs[0]).toEqual(
        jasmine.objectContaining({
          id: jasmine.any(Number),
          fieldName: jasmine.any(String),
          collapsedHeaderFieldVisible: jasmine.any(Boolean),
          collapsedHeaderFieldOrder: jasmine.any(Number),
          samplePaneVisible: jasmine.any(Boolean),
          samplePaneOrder: jasmine.any(Number)
        })
      );
    });
  });

  describe('saveFieldConfigs', () => {
    it('should save and persist field configs', async () => {
      const initialConfigs = await firstValueFrom(service.getFieldConfigs());
      const modifiedConfigs = initialConfigs.map(config => ({
        ...config,
        collapsedHeaderFieldVisible: true
      }));

      await firstValueFrom(service.saveFieldConfigs(modifiedConfigs));
      const savedConfigs = await firstValueFrom(service.getFieldConfigs());
      
      expect(savedConfigs).toEqual(modifiedConfigs);
    });

    it('should handle empty configs array', async () => {
      await firstValueFrom(service.saveFieldConfigs([]));
      const configs = await firstValueFrom(service.getFieldConfigs());
      expect(configs).toEqual([]);
    });
  });

  describe('visibility updates', () => {
    it('should update header visibility', async () => {
      service.updateHeaderVisibility(1, true);
      const configs = await firstValueFrom(service.getFieldConfigs());
      const updatedConfig = configs.find(c => c.id === 1);
      expect(updatedConfig?.collapsedHeaderFieldVisible).toBe(true);
    });

    it('should update pane visibility', async () => {
      service.updatePaneVisibility(1, true);
      const configs = await firstValueFrom(service.getFieldConfigs());
      const updatedConfig = configs.find(c => c.id === 1);
      expect(updatedConfig?.samplePaneVisible).toBe(true);
    });

    it('should clear order when visibility is set to false', async () => {
      // First set visibility and order
      service.updateHeaderVisibility(1, true);
      service.updateHeaderOrder(1, 1);
      
      // Then set visibility to false
      service.updateHeaderVisibility(1, false);
      
      const configs = await firstValueFrom(service.getFieldConfigs());
      const updatedConfig = configs.find(c => c.id === 1);
      expect(updatedConfig?.collapsedHeaderFieldOrder).toBeNull();
    });

    it('should maintain existing order when updating visibility to true', async () => {
      // First set visibility and order
      service.updateHeaderVisibility(1, true);
      service.updateHeaderOrder(1, 3);
      
      // Then set visibility to false and back to true
      service.updateHeaderVisibility(1, false);
      service.updateHeaderVisibility(1, true);
      
      const configs = await firstValueFrom(service.getFieldConfigs());
      const updatedConfig = configs.find(c => c.id === 1);
      expect(updatedConfig?.collapsedHeaderFieldOrder).toBe(3);
    });
  });

  describe('order updates', () => {
    it('should update header order', async () => {
      service.updateHeaderVisibility(1, true);
      service.updateHeaderOrder(1, 2);
      const configs = await firstValueFrom(service.getFieldConfigs());
      const updatedConfig = configs.find(c => c.id === 1);
      expect(updatedConfig?.collapsedHeaderFieldOrder).toBe(2);
    });

    it('should update pane order', async () => {
      service.updatePaneVisibility(1, true);
      service.updatePaneOrder(1, 2);
      const configs = await firstValueFrom(service.getFieldConfigs());
      const updatedConfig = configs.find(c => c.id === 1);
      expect(updatedConfig?.samplePaneOrder).toBe(2);
    });

    it('should not update order if field is not visible', async () => {
      service.updateHeaderVisibility(1, false);
      service.updateHeaderOrder(1, 2);
      
      const configs = await firstValueFrom(service.getFieldConfigs());
      const updatedConfig = configs.find(c => c.id === 1);
      expect(updatedConfig?.collapsedHeaderFieldOrder).toBeNull();
    });
  });

  describe('getAvailableOrder', () => {
    it('should return available orders for header fields', async () => {
      // Set up some visible header fields
      service.updateHeaderVisibility(1, true);
      service.updateHeaderVisibility(2, true);
      
      const orders = await firstValueFrom(service.getAvailableOrder('collapsedHeader'));
      expect(orders).toEqual([1, 2]);
    });

    it('should return available orders for pane fields', async () => {
      // Set up some visible pane fields
      service.updatePaneVisibility(1, true);
      service.updatePaneVisibility(2, true);
      service.updatePaneVisibility(3, true);
      
      const orders = await firstValueFrom(service.getAvailableOrder('samplePane'));
      expect(orders).toEqual([1, 2, 3]);
    });

    it('should return empty array when no fields are visible', async () => {
      // Make sure no fields are visible
      const configs = await firstValueFrom(service.getFieldConfigs());
      for (const config of configs) {
        service.updateHeaderVisibility(config.id, false);
      }
      
      const orders = await firstValueFrom(service.getAvailableOrder('collapsedHeader'));
      expect(orders).toEqual([]);
    });
  });

  describe('getCheckedCount', () => {
    it('should return correct count for header fields', async () => {
      service.updateHeaderVisibility(1, true);
      service.updateHeaderVisibility(2, true);
      
      const count = await firstValueFrom(service.getCheckedCount('collapsedHeader'));
      expect(count).toBe(2);
    });

    it('should return correct count for pane fields', async () => {
      service.updatePaneVisibility(1, true);
      
      const count = await firstValueFrom(service.getCheckedCount('samplePane'));
      expect(count).toBe(1);
    });
  });
});
