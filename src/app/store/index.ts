import { FieldConfig } from '../services/field-config.service';

export interface AppState {
  fieldConfig: FieldConfigState;
}

export interface FieldConfigState {
  configs: FieldConfig[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialFieldConfigState: FieldConfigState = {
  configs: [],
  loading: false,
  saving: false,
  error: null,
};
