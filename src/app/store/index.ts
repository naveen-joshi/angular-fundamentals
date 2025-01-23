import { FieldConfigState } from './field-config/field-config.state';

export interface AppState {
  fieldConfig: FieldConfigState;
}

export type { FieldConfigState } from './field-config/field-config.state';
export { initialState as initialFieldConfigState } from './field-config/field-config.state';
