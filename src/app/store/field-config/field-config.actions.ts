import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store';
import { FieldConfig, FieldType } from '../../services/field-config.service';

export const FieldConfigActions = createActionGroup({
  source: 'Field Config',
  events: {
    'Load Field Configs': emptyProps(),
    'Load Field Configs Success': props<{ configs: FieldConfig[] }>(),
    'Load Field Configs Failure': props<{ error: string }>(),
    
    'Update Field Visibility': props<{ 
      id: number;
      fieldType: FieldType;
      visible: boolean;
    }>(),
    'Update Field Order': props<{
      id: number;
      fieldType: FieldType;
      order: number | null;
    }>(),
    
    'Save Configuration': emptyProps(),
    'Save Configuration Success': emptyProps(),
    'Save Configuration Failure': props<{ error: string }>(),
  }
});

export const setFieldChecked = createAction(
  '[Field Config] Set Field Checked',
  props<{ rowId: string; fieldName: string; checked: boolean }>()
);

export const setFieldOrder = createAction(
  '[Field Config] Set Field Order',
  props<{ rowId: string; fieldName: string; order: number }>()
);

export const clearFieldOrder = createAction(
  '[Field Config] Clear Field Order',
  props<{ rowId: string; fieldName: string }>()
);

export const resetUiState = createAction(
  '[Field Config] Reset UI State'
);
