import { fieldConfigReducer } from './field-config.reducer';
import { FieldConfigActions } from './field-config.actions';
import { FieldConfigState, initialFieldConfigState } from '../index';
import { FieldConfig } from '../../services/field-config.service';

describe('FieldConfig Reducer', () => {
  const mockFieldConfigs: FieldConfig[] = [
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

  it('should return the default state', () => {
    const action = { type: 'NOOP' } as any;
    const state = fieldConfigReducer(undefined, action);

    expect(state).toBe(initialFieldConfigState);
  });

  describe('loadFieldConfigs', () => {
    it('should set loading to true', () => {
      const action = FieldConfigActions.loadFieldConfigs();
      const state = fieldConfigReducer(initialFieldConfigState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle loadFieldConfigsSuccess', () => {
      const action = FieldConfigActions.loadFieldConfigsSuccess({ configs: mockFieldConfigs });
      const state = fieldConfigReducer(initialFieldConfigState, action);

      expect(state.loading).toBe(false);
      expect(state.configs).toEqual(mockFieldConfigs);
      expect(state.error).toBeNull();
    });

    it('should handle loadFieldConfigsFailure', () => {
      const error = 'Error loading configs';
      const action = FieldConfigActions.loadFieldConfigsFailure({ error });
      const state = fieldConfigReducer(initialFieldConfigState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('updateFieldVisibility', () => {
    it('should update field visibility and clear order when unchecked', () => {
      const initialState: FieldConfigState = {
        ...initialFieldConfigState,
        configs: mockFieldConfigs
      };

      const action = FieldConfigActions.updateFieldVisibility({
        id: 1,
        fieldType: 'collapsedHeader',
        visible: false
      });

      const state = fieldConfigReducer(initialState, action);
      const updatedConfig = state.configs.find(c => c.id === 1);

      expect(updatedConfig?.collapsedHeaderFieldVisible).toBe(false);
      expect(updatedConfig?.collapsedHeaderFieldOrder).toBeNull();
    });
  });

  describe('updateFieldOrder', () => {
    it('should update field order', () => {
      const initialState: FieldConfigState = {
        ...initialFieldConfigState,
        configs: mockFieldConfigs
      };

      const action = FieldConfigActions.updateFieldOrder({
        id: 2,
        fieldType: 'samplePane',
        order: 2
      });

      const state = fieldConfigReducer(initialState, action);
      const updatedConfig = state.configs.find(c => c.id === 2);

      expect(updatedConfig?.samplePaneOrder).toBe(2);
    });
  });

  describe('saveConfiguration', () => {
    it('should set saving to true when saving starts', () => {
      const action = FieldConfigActions.saveConfiguration();
      const state = fieldConfigReducer(initialFieldConfigState, action);

      expect(state.saving).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle saveConfigurationSuccess', () => {
      const initialState: FieldConfigState = {
        ...initialFieldConfigState,
        saving: true
      };

      const action = FieldConfigActions.saveConfigurationSuccess();
      const state = fieldConfigReducer(initialState, action);

      expect(state.saving).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle saveConfigurationFailure', () => {
      const error = 'Error saving config';
      const initialState: FieldConfigState = {
        ...initialFieldConfigState,
        saving: true
      };

      const action = FieldConfigActions.saveConfigurationFailure({ error });
      const state = fieldConfigReducer(initialState, action);

      expect(state.saving).toBe(false);
      expect(state.error).toBe(error);
    });
  });
});
