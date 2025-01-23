import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FieldType } from '../../services/field-config.service';
import { AppState, FieldConfigState } from '../index';

export const selectFieldConfigState = createFeatureSelector<AppState, FieldConfigState>('fieldConfig');

export const selectFieldConfigs = createSelector(
  selectFieldConfigState,
  state => state.fieldConfigs.map(config => ({
    ...config,
    id: config.id,
    fieldName: config.fieldName,
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
  state => state.fieldConfigs.filter(config => 
    fieldType === 'collapsedHeader' ? config.collapsedHeaderFieldVisible : config.samplePaneVisible
  ).length
);

const getFieldKey = (rowId: string, fieldName: string): string => `${rowId}_${fieldName}`;

export const selectCheckedField = ({ rowId, fieldName }: { rowId: string; fieldName: string }) =>
  createSelector(
    selectFieldConfigState,
    (state) => state.uiState.checkedFields[getFieldKey(rowId, fieldName)]
  );

export const selectFieldOrder = ({ rowId, fieldName }: { rowId: string; fieldName: string }) =>
  createSelector(
    selectFieldConfigState,
    (state) => state.uiState.selectedOrders[getFieldKey(rowId, fieldName)]
  );

export const selectAvailableOrders = (fieldType: FieldType) => createSelector(
  selectFieldConfigState,
  (state) => {
    const visibleField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldVisible' : 'samplePaneVisible';
    const orderField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldOrder' : 'samplePaneOrder';
    
    const configs = state.fieldConfigs;
    const visibleCount = configs.filter(config => config[visibleField]).length;
    return Array.from({ length: visibleCount }, (_, i) => i + 1);
  }
);
