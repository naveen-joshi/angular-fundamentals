import { createReducer, on } from '@ngrx/store';
import { FieldConfigActions } from './field-config.actions';
import { FieldConfig } from '../../services/field-config.service';
import { FieldConfigState, initialFieldConfigState } from '../index';

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
    configs,
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
      configs: state.configs.map(config => 
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
      configs: state.configs.map(config =>
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
  }))
);
