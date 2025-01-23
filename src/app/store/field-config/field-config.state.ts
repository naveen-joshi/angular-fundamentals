import { FieldConfig } from '../../services/field-config.service';

export interface FieldConfigState {
  configs: FieldConfig[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialState: FieldConfigState = {
  configs: [],
  loading: false,
  saving: false,
  error: null,
};
