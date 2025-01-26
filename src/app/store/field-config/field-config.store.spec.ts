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

  describe('revertToLastSaved', () => {
    beforeEach(async () => {
      mockFieldConfigService.getFieldConfigs.mockReturnValue(of(mockFieldConfigs));
      store.loadFieldConfigs();
      await new Promise(process.nextTick);
    });

    it('should revert all changes to last saved state', () => {
      // Make some changes
      store.updateFieldVisibility(1, 'collapsedHeader', false);
      store.updateFieldOrder(2, 'samplePane', 999);

      // Revert changes
      store.revertToLastSaved();

      // Verify original state is restored
      expect(store.fieldConfigs()).toEqual(store.lastSavedConfigs());
      expect(store.fieldConfigs()[0].collapsedHeaderFieldVisible).toBe(true);
      expect(store.fieldConfigs()[1].samplePaneOrder).toBe(1);
    });

    it('should not affect state if no changes were made', () => {
      const beforeRevert = store.fieldConfigs();
      store.revertToLastSaved();
      expect(store.fieldConfigs()).toEqual(beforeRevert);
    });
  });

  describe('error handling', () => {
    it('should clear error when new operation starts', async () => {
      // Set initial error state
      mockFieldConfigService.getFieldConfigs.mockReturnValue(throwError(() => new Error('Initial error')));
      store.loadFieldConfigs();
      await new Promise(process.nextTick);
      expect(store.error()).toBeTruthy();

      // Start new operation
      mockFieldConfigService.getFieldConfigs.mockReturnValue(of(mockFieldConfigs));
      store.loadFieldConfigs();
      expect(store.error()).toBeNull();
    });

    it('should maintain last saved state even when save fails', async () => {
      mockFieldConfigService.getFieldConfigs.mockReturnValue(of(mockFieldConfigs));
      store.loadFieldConfigs();
      await new Promise(process.nextTick);

      const originalState = store.lastSavedConfigs();
      
      // Make changes and fail save
      store.updateFieldVisibility(1, 'collapsedHeader', false);
      mockFieldConfigService.saveFieldConfigs.mockReturnValue(throwError(() => new Error('Save failed')));
      
      store.saveConfiguration();
      await new Promise(process.nextTick);

      expect(store.lastSavedConfigs()).toEqual(originalState);
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
