import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FieldType } from '../../services/field-config.service';
import { AppState, FieldConfigState } from '../index';

export const selectFieldConfigState = createFeatureSelector<AppState, FieldConfigState>('fieldConfig');

export const selectFieldConfigs = createSelector(
  selectFieldConfigState,
  state => state.configs.map(config => ({
    ...config,
    collapsedHeader: {
      visible: config.collapsedHeaderFieldVisible,
      order: config.collapsedHeaderFieldOrder
    },
    samplePane: {
      visible: config.samplePaneVisible,
      order: config.samplePaneOrder
    }
  }))
);

export const selectLoading = createSelector(
  selectFieldConfigState,
  state => state.loading
);

export const selectSaving = createSelector(
  selectFieldConfigState,
  state => state.saving
);

export const selectError = createSelector(
  selectFieldConfigState,
  state => state.error
);

export const selectCheckedCount = (fieldType: FieldType) => createSelector(
  selectFieldConfigState,
  state => state.configs.filter(config => 
    fieldType === 'collapsedHeader' ? config.collapsedHeaderFieldVisible : config.samplePaneVisible
  ).length
);
