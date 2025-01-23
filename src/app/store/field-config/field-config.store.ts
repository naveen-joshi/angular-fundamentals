import { computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { FieldConfig, FieldType } from '../../services/field-config.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, catchError, of, tap, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { FieldConfigService } from '../../services/field-config.service';

export interface FieldConfigState {
  fieldConfigs: FieldConfig[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: FieldConfigState = {
  fieldConfigs: [],
  loading: false,
  saving: false,
  error: null
};

export const FieldConfigStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, service = inject(FieldConfigService)) => ({
    loadFieldConfigs: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true, error: null });
        }),
        switchMap(() => 
          service.getFieldConfigs().pipe(
            tap(fieldConfigs => {
              patchState(store, {
                fieldConfigs,
                loading: false,
                error: null
              });
            }),
            catchError(error => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to load field configs'
              });
              return of(null);
            })
          )
        )
      )
    ),

    saveConfiguration: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { saving: true, error: null });
        }),
        switchMap(() => 
          service.saveFieldConfigs(store.fieldConfigs()).pipe(
            tap(() => {
              patchState(store, {
                saving: false,
                error: null
              });
            }),
            catchError(error => {
              patchState(store, {
                saving: false,
                error: error.message || 'Failed to save configuration'
              });
              return of(null);
            })
          )
        )
      )
    ),

    updateFieldVisibility(id: number, fieldType: FieldType, visible: boolean) {
      const visibleField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldVisible' : 'samplePaneVisible';
      const orderField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldOrder' : 'samplePaneOrder';

      patchState(store, {
        fieldConfigs: store.fieldConfigs().map(config =>
          config.id === id
            ? {
                ...config,
                [visibleField]: visible,
                [orderField]: visible ? config[orderField] : null
              }
            : config
        )
      });
    },

    updateFieldOrder(id: number, fieldType: FieldType, order: number | null) {
      const orderField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldOrder' : 'samplePaneOrder';

      patchState(store, {
        fieldConfigs: store.fieldConfigs().map(config =>
          config.id === id
            ? { ...config, [orderField]: order }
            : config
        )
      });
    }
  })),
  withComputed((store) => ({
    transformedConfigs: computed(() => 
      store.fieldConfigs().map(config => ({
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
    ),

    availableOrders: computed(() => (fieldType: FieldType) => {
      const visibleField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldVisible' : 'samplePaneVisible';
      const orderField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldOrder' : 'samplePaneOrder';
      const visibleCount = store.fieldConfigs()
        .filter(config => config[visibleField]).length;
      
      // Get currently used order numbers
      const usedOrders = new Set(
        store.fieldConfigs()
          .filter(config => config[visibleField] && config[orderField] !== null)
          .map(config => config[orderField])
      );
      
      // Generate available numbers from 1 to visibleCount
      const allPossibleOrders = Array.from({ length: visibleCount }, (_, i) => i + 1);
      
      // Return all possible orders that are either unused or match the current field's order
      return allPossibleOrders;
    }),

    checkedCount: computed(() => (fieldType: FieldType) => {
      const visibleField = fieldType === 'collapsedHeader' ? 'collapsedHeaderFieldVisible' : 'samplePaneVisible';
      return store.fieldConfigs().filter(config => config[visibleField]).length;
    })
  }))
);
