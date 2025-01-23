import { FieldConfig } from '../../services/field-config.service';

export interface FieldConfigState {
  fieldConfigs: FieldConfig[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  uiState: {
    checkedFields: Record<string, boolean>;
    selectedOrders: Record<string, number>;
  };
}

export const initialState: FieldConfigState = {
  fieldConfigs: [],
  loading: false,
  saving: false,
  error: null,
  uiState: {
    checkedFields: {},
    selectedOrders: {}
  }
};
