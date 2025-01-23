import { createActionGroup, emptyProps, props } from '@ngrx/store';
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
