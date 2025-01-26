import { TestBed } from '@angular/core/testing';
import { FieldConfigStore } from './field-config.store';
import { FieldConfigService, FieldConfig, FieldType } from '../../services/field-config.service';
import { of, throwError } from 'rxjs';

jest.mock('../../services/field-config.service');

describe('FieldConfigStore', () => {
  let store: FieldConfigStore;
  let mockFieldConfigService: jest.Mocked<FieldConfigService>;

  const mockFieldConfigs: FieldConfig[] = [
    { id: 1, fieldName: 'Field 1', collapsedHeaderFieldVisible: true, collapsedHeaderFieldOrder: 1, samplePaneVisible: false, samplePaneOrder: null },
    { id: 2, fieldName: 'Field 2', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: true, samplePaneOrder: 1 },
    { id: 3, fieldName: 'Field 3', collapsedHeaderFieldVisible: true, collapsedHeaderFieldOrder: 2, samplePaneVisible: true, samplePaneOrder: 2 }
  ];

  beforeEach(() => {
    mockFieldConfigService = {
      getFieldConfigs: jest.fn(),
      saveFieldConfigs: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        FieldConfigStore,
        { provide: FieldConfigService, useValue: mockFieldConfigService }
      ]
    });

    store = TestBed.inject(FieldConfigStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('loadFieldConfigs', () => {
    it('should load field configs successfully', async () => {
      mockFieldConfigService.getFieldConfigs.mockReturnValue(of(mockFieldConfigs));

      store.loadFieldConfigs();

      // Wait for the async operation to complete
      await new Promise(process.nextTick);

      expect(store.fieldConfigs()).toEqual(mockFieldConfigs);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should handle error when loading field configs fails', async () => {
      const errorMessage = 'Failed to load';
      mockFieldConfigService.getFieldConfigs.mockReturnValue(throwError(() => new Error(errorMessage)));

      store.loadFieldConfigs();

      // Wait for the async operation to complete
      await new Promise(process.nextTick);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe(errorMessage);
    });
  });

  describe('saveConfiguration', () => {
    beforeEach(async () => {
      mockFieldConfigService.getFieldConfigs.mockReturnValue(of(mockFieldConfigs));
      store.loadFieldConfigs();
      await new Promise(process.nextTick);
    });

    it('should save configuration successfully', async () => {
      mockFieldConfigService.saveFieldConfigs.mockReturnValue(of(void 0));

      store.saveConfiguration();

      // Wait for the async operation to complete
      await new Promise(process.nextTick);

      expect(store.saving()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should handle error when saving configuration fails', async () => {
      const errorMessage = 'Failed to save';
      mockFieldConfigService.saveFieldConfigs.mockReturnValue(throwError(() => new Error(errorMessage)));

      store.saveConfiguration();

      // Wait for the async operation to complete
      await new Promise(process.nextTick);

      expect(store.saving()).toBe(false);
      expect(store.error()).toBe(errorMessage);
    });
  });

  describe('updateFieldVisibility', () => {
    beforeEach(async () => {
      mockFieldConfigService.getFieldConfigs.mockReturnValue(of(mockFieldConfigs));
      store.loadFieldConfigs();
      await new Promise(process.nextTick);
    });

    it('should update collapsed header visibility', () => {
      store.updateFieldVisibility(1, 'collapsedHeader', false);
      
      const updatedConfig = store.fieldConfigs().find(config => config.id === 1);
      expect(updatedConfig?.collapsedHeaderFieldVisible).toBe(false);
      expect(updatedConfig?.collapsedHeaderFieldOrder).toBeNull();
    });

    it('should update sample pane visibility', () => {
      store.updateFieldVisibility(2, 'samplePane', false);
      
      const updatedConfig = store.fieldConfigs().find(config => config.id === 2);
      expect(updatedConfig?.samplePaneVisible).toBe(false);
      expect(updatedConfig?.samplePaneOrder).toBeNull();
    });
  });

  describe('updateFieldOrder', () => {
    beforeEach(async () => {
      mockFieldConfigService.getFieldConfigs.mockReturnValue(of(mockFieldConfigs));
      store.loadFieldConfigs();
      await new Promise(process.nextTick);
    });

    it('should update collapsed header order', () => {
      const newOrder = 3;
      store.updateFieldOrder(1, 'collapsedHeader', newOrder);
      
      const updatedConfig = store.fieldConfigs().find(config => config.id === 1);
      expect(updatedConfig?.collapsedHeaderFieldOrder).toBe(newOrder);
    });

    it('should update sample pane order', () => {
      const newOrder = 3;
      store.updateFieldOrder(2, 'samplePane', newOrder);
      
      const updatedConfig = store.fieldConfigs().find(config => config.id === 2);
      expect(updatedConfig?.samplePaneOrder).toBe(newOrder);
    });
  });

  describe('computed selectors', () => {
    beforeEach(async () => {
      mockFieldConfigService.getFieldConfigs.mockReturnValue(of(mockFieldConfigs));
      store.loadFieldConfigs();
      await new Promise(process.nextTick);
    });

    describe('transformedConfigs', () => {
      it('should transform configs into the correct format', () => {
        const transformed = store.transformedConfigs();
        expect(transformed[0]).toEqual({
          ...mockFieldConfigs[0],
          collapsedHeader: {
            visible: mockFieldConfigs[0].collapsedHeaderFieldVisible,
            order: mockFieldConfigs[0].collapsedHeaderFieldOrder
          },
          samplePane: {
            visible: mockFieldConfigs[0].samplePaneVisible,
            order: mockFieldConfigs[0].samplePaneOrder
          }
        });
      });
    });

    describe('checkedCount', () => {
      it('should return correct count for collapsed header fields', () => {
        const count = store.checkedCount()('collapsedHeader');
        expect(count).toBe(2); // Based on mockFieldConfigs
      });

      it('should return correct count for sample pane fields', () => {
        const count = store.checkedCount()('samplePane');
        expect(count).toBe(2); // Based on mockFieldConfigs
      });
    });

    describe('availableOrders', () => {
      it('should return correct available orders for collapsed header', () => {
        const orders = store.availableOrders()('collapsedHeader');
        expect(orders).toEqual([1, 2]); // Based on visible collapsed header fields
      });

      it('should return correct available orders for sample pane', () => {
        const orders = store.availableOrders()('samplePane');
        expect(orders).toEqual([1, 2]); // Based on visible sample pane fields
      });
    });
  });
});
