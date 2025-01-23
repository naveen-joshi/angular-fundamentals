import {
  selectFieldConfigs,
  selectLoading,
  selectSaving,
  selectError,
  selectCheckedCount
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
});
