import {
  selectFieldConfigs,
  selectLoading,
  selectSaving,
  selectError,
  selectCheckedCount,
  selectAvailableOrders
} from './field-config.selectors';
import { AppState } from '../index';

describe('FieldConfig Selectors', () => {
  const mockFieldConfigs = [
    {
      id: 1,
      fieldName: 'Field 1',
      collapsedHeaderFieldVisible: true,
      collapsedHeaderFieldOrder: 1,
      samplePaneVisible: false,
      samplePaneOrder: null
    },
    {
      id: 2,
      fieldName: 'Field 2',
      collapsedHeaderFieldVisible: false,
      collapsedHeaderFieldOrder: null,
      samplePaneVisible: true,
      samplePaneOrder: 1
    }
  ];

  const initialState: AppState = {
    fieldConfig: {
      configs: mockFieldConfigs,
      loading: false,
      saving: false,
      error: null
    }
  };

  describe('selectFieldConfigs', () => {
    it('should return transformed field configs', () => {
      const result = selectFieldConfigs(initialState);
      expect(result).toEqual(mockFieldConfigs.map(config => ({
        ...config,
        collapsedHeader: {
          visible: config.collapsedHeaderFieldVisible,
          order: config.collapsedHeaderFieldOrder
        },
        samplePane: {
          visible: config.samplePaneVisible,
          order: config.samplePaneOrder
        }
      })));
    });
  });

  describe('selectLoading', () => {
    it('should return loading state', () => {
      const result = selectLoading(initialState);
      expect(result).toBe(false);
    });
  });

  describe('selectSaving', () => {
    it('should return saving state', () => {
      const result = selectSaving(initialState);
      expect(result).toBe(false);
    });
  });

  describe('selectError', () => {
    it('should return error state', () => {
      const result = selectError(initialState);
      expect(result).toBeNull();
    });
  });

  describe('selectCheckedCount', () => {
    it('should return correct count for collapsedHeader', () => {
      const result = selectCheckedCount('collapsedHeader')(initialState);
      expect(result).toBe(1); // Only one config has collapsedHeaderFieldVisible true
    });

    it('should return correct count for samplePane', () => {
      const result = selectCheckedCount('samplePane')(initialState);
      expect(result).toBe(1); // Only one config has samplePaneVisible true
    });
  });

  describe('selectAvailableOrders', () => {
    it('should return correct available orders for collapsedHeader', () => {
      const result = selectAvailableOrders('collapsedHeader')(initialState);
      expect(result).toEqual([1]); // Only one visible field, so only order 1 is available
    });

    it('should return correct available orders for samplePane', () => {
      const result = selectAvailableOrders('samplePane')(initialState);
      expect(result).toEqual([1]); // Only one visible field, so only order 1 is available
    });

    it('should return empty array when no fields are visible', () => {
      const stateWithNoVisible = {
        fieldConfig: {
          ...initialState.fieldConfig,
          configs: [
            {
              id: 1,
              fieldName: 'Field 1',
              collapsedHeaderFieldVisible: false,
              collapsedHeaderFieldOrder: null,
              samplePaneVisible: false,
              samplePaneOrder: null
            }
          ]
        }
      };
      const result = selectAvailableOrders('collapsedHeader')(stateWithNoVisible);
      expect(result).toEqual([]); // No visible fields, so no orders available
    });

    it('should return sequential numbers up to visible count', () => {
      const stateWithMultipleVisible = {
        fieldConfig: {
          ...initialState.fieldConfig,
          configs: [
            {
              id: 1,
              fieldName: 'Field 1',
              collapsedHeaderFieldVisible: true,
              collapsedHeaderFieldOrder: 1,
              samplePaneVisible: false,
              samplePaneOrder: null
            },
            {
              id: 2,
              fieldName: 'Field 2',
              collapsedHeaderFieldVisible: true,
              collapsedHeaderFieldOrder: 2,
              samplePaneVisible: false,
              samplePaneOrder: null
            },
            {
              id: 3,
              fieldName: 'Field 3',
              collapsedHeaderFieldVisible: true,
              collapsedHeaderFieldOrder: 3,
              samplePaneVisible: false,
              samplePaneOrder: null
            }
          ]
        }
      };
      const result = selectAvailableOrders('collapsedHeader')(stateWithMultipleVisible);
      expect(result).toEqual([1, 2, 3]); // Three visible fields, so orders 1-3 are available
    });
  });
});
