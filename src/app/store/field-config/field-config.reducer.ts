import { createReducer, on } from '@ngrx/store';
import { FieldConfigActions, clearFieldOrder, resetUiState, setFieldChecked, setFieldOrder } from './field-config.actions';
import { FieldConfig } from '../../services/field-config.service';
import { FieldConfigState, initialState as initialFieldConfigState } from './field-config.state';

const getFieldKey = (rowId: string, fieldName: string): string => `${rowId}_${fieldName}`;

export const fieldConfigReducer = createReducer(
  initialFieldConfigState,
  
  // Load configs
  on(FieldConfigActions.loadFieldConfigs, (state: FieldConfigState): FieldConfigState => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(FieldConfigActions.loadFieldConfigsSuccess, (state: FieldConfigState, { configs }): FieldConfigState => ({
    ...state,
    fieldConfigs: configs,
    loading: false,
    error: null
  })),
  
  on(FieldConfigActions.loadFieldConfigsFailure, (state: FieldConfigState, { error }): FieldConfigState => ({
    ...state,
    loading: false,
    error
  })),
  
  // Update visibility
  on(FieldConfigActions.updateFieldVisibility, (state: FieldConfigState, { id, fieldType, visible }): FieldConfigState => {
    const visibleField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldVisible' : 'samplePaneVisible';
    const orderField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldOrder' : 'samplePaneOrder';
    
    return {
      ...state,
      fieldConfigs: state.fieldConfigs.map(config => 
        config.id === id
          ? { 
              ...config, 
              [visibleField]: visible,
              [orderField]: visible ? config[orderField] : null 
            }
          : config
      )
    };
  }),
  
  // Update order
  on(FieldConfigActions.updateFieldOrder, (state: FieldConfigState, { id, fieldType, order }): FieldConfigState => {
    const orderField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldOrder' : 'samplePaneOrder';
    
    return {
      ...state,
      fieldConfigs: state.fieldConfigs.map(config =>
        config.id === id
          ? { ...config, [orderField]: order }
          : config
      )
    };
  }),
  
  // Save configuration
  on(FieldConfigActions.saveConfiguration, (state: FieldConfigState): FieldConfigState => ({
    ...state,
    saving: true,
    error: null
  })),
  
  on(FieldConfigActions.saveConfigurationSuccess, (state: FieldConfigState): FieldConfigState => ({
    ...state,
    saving: false,
    error: null
  })),
  
  on(FieldConfigActions.saveConfigurationFailure, (state: FieldConfigState, { error }): FieldConfigState => ({
    ...state,
    saving: false,
    error
  })),
  
  // UI State Actions
  on(setFieldChecked, (state, { rowId, fieldName, checked }): FieldConfigState => {
    const fieldKey = getFieldKey(rowId, fieldName);
    return {
      ...state,
      uiState: {
        ...state.uiState,
        checkedFields: {
          ...state.uiState.checkedFields,
          [fieldKey]: checked
        }
      }
    };
  }),

  on(setFieldOrder, (state, { rowId, fieldName, order }): FieldConfigState => {
    const fieldKey = getFieldKey(rowId, fieldName);
    return {
      ...state,
      uiState: {
        ...state.uiState,
        selectedOrders: {
          ...state.uiState.selectedOrders,
          [fieldKey]: order
        }
      }
    };
  }),

  on(clearFieldOrder, (state, { rowId, fieldName }): FieldConfigState => {
    const fieldKey = getFieldKey(rowId, fieldName);
    const { [fieldKey]: _, ...remainingOrders } = state.uiState.selectedOrders;
    return {
      ...state,
      uiState: {
        ...state.uiState,
        selectedOrders: remainingOrders
      }
    };
  }),

  on(resetUiState, (state): FieldConfigState => ({
    ...state,
    uiState: initialFieldConfigState.uiState
  }))
);
