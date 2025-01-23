import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldConfigTableComponent } from './field-config-table.component';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from '../../store';
import { FieldConfigActions } from '../../store/field-config/field-config.actions';
import { selectFieldConfigs, selectSaving } from '../../store/field-config/field-config.selectors';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { CheckboxDropdownCellComponent } from '../checkbox-dropdown-cell/checkbox-dropdown-cell.component';
import { PLATFORM_ID } from '@angular/core';

describe('FieldConfigTableComponent', () => {
  let component: FieldConfigTableComponent;
  let fixture: ComponentFixture<FieldConfigTableComponent>;
  let store: MockStore<AppState>;

  const initialState = {
    fieldConfig: {
      configs: [
        { id: 1, fieldName: 'Field 1', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
        { id: 2, fieldName: 'Field 2', collapsedHeaderFieldVisible: true, collapsedHeaderFieldOrder: 1, samplePaneVisible: false, samplePaneOrder: null }
      ],
      loading: false,
      saving: false,
      error: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        AgGridModule,
        CheckboxDropdownCellComponent
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as MockStore<AppState>;
  });

  afterEach(() => {
    store.resetSelectors();
  });

  it('should create', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(FieldConfigTableComponent);
    component = fixture.componentInstance;
    
    expect(component).toBeTruthy();
    expect(dispatchSpy).toHaveBeenCalledWith(FieldConfigActions.loadFieldConfigs());
  });

  it('should show loading state when loading', () => {
    store.setState({
      ...initialState,
      fieldConfig: {
        ...initialState.fieldConfig,
        loading: true
      }
    });

    fixture = TestBed.createComponent(FieldConfigTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const gridElement = fixture.nativeElement.querySelector('.ag-theme-alpine');
    expect(gridElement).toBeTruthy(); // Grid container should exist
    const gridAngular = fixture.nativeElement.querySelector('ag-grid-angular');
    expect(gridAngular).toBeFalsy(); // Grid should not be rendered while loading
  });

  it('should display field configs in grid', () => {
    fixture = TestBed.createComponent(FieldConfigTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const gridElement = fixture.nativeElement.querySelector('ag-grid-angular');
    expect(gridElement).toBeTruthy();
  });

  it('should update header visibility when checkbox is changed', () => {
    fixture = TestBed.createComponent(FieldConfigTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const dispatchSpy = jest.spyOn(store, 'dispatch');
    
    // Get the cell renderer params from the column definitions
    const columnDef = component.columnDefs.find(col => col.field === 'collapsedHeader');
    const cellRendererParams = columnDef?.cellRendererParams as any;
    
    // Call the onChange function from cellRendererParams
    cellRendererParams.onChange({ data: { id: 1 }, field: 'collapsedHeader', visible: true });
    
    expect(dispatchSpy).toHaveBeenCalledWith(
      FieldConfigActions.updateFieldVisibility({
        id: 1,
        fieldType: 'collapsedHeader',
        visible: true
      })
    );
  });

  it('should update header order when order is changed', () => {
    fixture = TestBed.createComponent(FieldConfigTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const dispatchSpy = jest.spyOn(store, 'dispatch');
    // Get the column definition for collapsedHeader
    const collapsedHeaderCol = component.columnDefs.find(col => col.field === 'collapsedHeader');
    const onOrderChange = collapsedHeaderCol?.cellRendererParams?.onOrderChange;
    
    // Call onOrderChange through the column definition
    onOrderChange?.({ data: { id: 1 }, field: 'collapsedHeader', order: 2 });
    
    expect(dispatchSpy).toHaveBeenCalledWith(
      FieldConfigActions.updateFieldOrder({
        id: 1,
        fieldType: 'collapsedHeader',
        order: 2
      })
    );
  });

  it('should dispatch save action when save is called', () => {
    fixture = TestBed.createComponent(FieldConfigTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.saveConfiguration();
    expect(dispatchSpy).toHaveBeenCalledWith(FieldConfigActions.saveConfiguration());
  });

  it('should disable save button while saving', () => {
    store.setState({
      ...initialState,
      fieldConfig: {
        ...initialState.fieldConfig,
        saving: true
      }
    });

    fixture = TestBed.createComponent(FieldConfigTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const saveButton = fixture.nativeElement.querySelector('button');
    expect(saveButton.disabled).toBe(true);
  });
});
