import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { FieldConfigEffects } from './field-config.effects';
import { FieldConfigService } from '../../services/field-config.service';
import { FieldConfigActions } from './field-config.actions';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from '../index';

describe('FieldConfigEffects', () => {
  let effects: FieldConfigEffects;
  let actions$: Observable<Action>;
  let testScheduler: TestScheduler;
  let store: MockStore<AppState>;
  let fieldConfigService: jest.Mocked<Partial<FieldConfigService>>;

  const mockFieldConfigs = [
    {
      id: 1,
      fieldName: 'Field 1',
      collapsedHeaderFieldVisible: true,
      collapsedHeaderFieldOrder: 1,
      samplePaneVisible: false,
      samplePaneOrder: null
    }
  ];

  const initialState: AppState = {
    fieldConfig: {
      configs: [],
      loading: false,
      saving: false,
      error: null
    }
  };

  beforeEach(() => {
    fieldConfigService = {
      getFieldConfigs: jest.fn(),
      updateHeaderVisibility: jest.fn(),
      updateHeaderOrder: jest.fn(),
      updatePaneVisibility: jest.fn(),
      updatePaneOrder: jest.fn()
    };

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    TestBed.configureTestingModule({
      providers: [
        FieldConfigEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        {
          provide: FieldConfigService,
          useValue: fieldConfigService
        }
      ]
    });

    effects = TestBed.inject(FieldConfigEffects);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadFieldConfigs$', () => {
    it('should handle successful config load', (done) => {
      const action = FieldConfigActions.loadFieldConfigs();
      actions$ = of(action);

      (fieldConfigService.getFieldConfigs as jest.Mock).mockReturnValue(of(mockFieldConfigs));

      effects.loadFieldConfigs$.subscribe(result => {
        expect(result).toEqual(
          FieldConfigActions.loadFieldConfigsSuccess({ configs: mockFieldConfigs })
        );
        done();
      });
    });

    it('should handle failed config load', (done) => {
      const action = FieldConfigActions.loadFieldConfigs();
      const error = new Error('Failed to load');
      actions$ = of(action);

      (fieldConfigService.getFieldConfigs as jest.Mock).mockReturnValue(
        new Observable(subscriber => subscriber.error(error))
      );

      effects.loadFieldConfigs$.subscribe(result => {
        expect(result).toEqual(
          FieldConfigActions.loadFieldConfigsFailure({ error: error.message })
        );
        done();
      });
    });
  });

  describe('updateFieldVisibility$', () => {
    it('should call correct service method for header visibility', (done) => {
      const action = FieldConfigActions.updateFieldVisibility({
        id: 1,
        fieldType: 'collapsedHeader',
        visible: true
      });

      actions$ = of(action);

      effects.updateFieldVisibility$.subscribe(result => {
        expect(fieldConfigService.updateHeaderVisibility).toHaveBeenCalledWith(1, true);
        expect(result).toEqual({ type: '[Field Config] Update Visibility Success' });
        done();
      });
    });

    it('should call correct service method for pane visibility', (done) => {
      const action = FieldConfigActions.updateFieldVisibility({
        id: 1,
        fieldType: 'samplePane',
        visible: true
      });

      actions$ = of(action);

      effects.updateFieldVisibility$.subscribe(result => {
        expect(fieldConfigService.updatePaneVisibility).toHaveBeenCalledWith(1, true);
        expect(result).toEqual({ type: '[Field Config] Update Visibility Success' });
        done();
      });
    });
  });

  describe('saveConfiguration$', () => {
    it('should emit success action', (done) => {
      const action = FieldConfigActions.saveConfiguration();
      actions$ = of(action);

      effects.saveConfiguration$.subscribe(result => {
        expect(result).toEqual(FieldConfigActions.saveConfigurationSuccess());
        done();
      });
    });
  });
});
