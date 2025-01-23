import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators';
import { FieldConfigService, FieldType } from '../../services/field-config.service';
import { FieldConfigActions } from './field-config.actions';
import { selectFieldConfigState } from './field-config.selectors';
import { AppState } from '../index';

interface ServiceMethods {
  updateVisibility: (id: number, visible: boolean) => void;
  updateOrder: (id: number, order: number | null) => void;
}

@Injectable()
export class FieldConfigEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store<AppState>);
  private readonly fieldConfigService = inject(FieldConfigService);

  private readonly fieldTypeServiceMethods: Record<FieldType, ServiceMethods> = {
    collapsedHeader: {
      updateVisibility: this.fieldConfigService.updateHeaderVisibility.bind(this.fieldConfigService),
      updateOrder: this.fieldConfigService.updateHeaderOrder.bind(this.fieldConfigService)
    },
    samplePane: {
      updateVisibility: this.fieldConfigService.updatePaneVisibility.bind(this.fieldConfigService),
      updateOrder: this.fieldConfigService.updatePaneOrder.bind(this.fieldConfigService)
    }
  };

  loadFieldConfigs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FieldConfigActions.loadFieldConfigs),
      switchMap(() =>
        this.fieldConfigService.getFieldConfigs().pipe(
          map(configs => FieldConfigActions.loadFieldConfigsSuccess({ configs })),
          catchError(error => of(FieldConfigActions.loadFieldConfigsFailure({ error: error.message })))
        )
      )
    )
  );

  updateFieldVisibility$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FieldConfigActions.updateFieldVisibility),
      switchMap(({ id, fieldType, visible }) => {
        this.fieldTypeServiceMethods[fieldType].updateVisibility(id, visible);
        return of({ type: '[Field Config] Update Visibility Success' });
      })
    )
  );

  updateFieldOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FieldConfigActions.updateFieldOrder),
      switchMap(({ id, fieldType, order }) => {
        this.fieldTypeServiceMethods[fieldType].updateOrder(id, order);
        return of({ type: '[Field Config] Update Order Success' });
      })
    )
  );

  saveConfiguration$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FieldConfigActions.saveConfiguration),
      withLatestFrom(this.store.select(selectFieldConfigState)),
      switchMap(([, state]) => of(FieldConfigActions.saveConfigurationSuccess()))
    )
  );

  constructor() {}
}
