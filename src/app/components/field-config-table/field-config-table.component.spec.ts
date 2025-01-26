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
      fieldConfigs: [
        { id: 1, fieldName: 'Field 1', collapsedHeaderFieldVisible: false, collapsedHeaderFieldOrder: null, samplePaneVisible: false, samplePaneOrder: null },
        { id: 2, fieldName: 'Field 2', collapsedHeaderFieldVisible: true, collapsedHeaderFieldOrder: 1, samplePaneVisible: false, samplePaneOrder: null }
      ],
      loading: false,
      saving: false,
      error: null,
      uiState: {
        checkedFields: {},
        selectedOrders: {}
      }
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
    component.saveChanges();
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

  it('should show error message when there is an error', () => {
    const errorMessage = 'Test error message';
    store.setState({
      ...initialState,
      fieldConfig: {
        ...initialState.fieldConfig,
        error: errorMessage
      }
    });

    fixture = TestBed.createComponent(FieldConfigTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('.text-red-600');
    expect(errorElement.textContent).toContain(errorMessage);
  });

  it('should show saving indicator when saving', () => {
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

    const savingElement = fixture.nativeElement.querySelector('.text-blue-600');
    expect(savingElement.textContent).toContain('Saving changes...');
  });

  describe('grid interactions', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(FieldConfigTableComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should have correct column definitions', () => {
      expect(component.columnDefs.length).toBeGreaterThan(0);
      expect(component.columnDefs[0].field).toBe('fieldName');
      
      const headerCol = component.columnDefs.find(col => col.field === 'collapsedHeader');
      expect(headerCol).toBeTruthy();
      expect(headerCol?.cellRenderer).toBe('checkboxDropdownCell');
      
      const sampleCol = component.columnDefs.find(col => col.field === 'samplePane');
      expect(sampleCol).toBeTruthy();
      expect(sampleCol?.cellRenderer).toBe('checkboxDropdownCell');
    });

    it('should handle grid ready event', () => {
      const gridApi = {
        sizeColumnsToFit: jest.fn()
      };
      
      component.onGridReady({ api: gridApi } as any);
      expect(gridApi.sizeColumnsToFit).toHaveBeenCalled();
    });

    it('should handle revert action', () => {
      const revertSpy = jest.spyOn(store, 'revertToLastSaved');
      
      component.cancelChanges();
      
      expect(revertSpy).toHaveBeenCalled();
    });

    it('should disable revert button when no changes', () => {
      fixture.detectChanges();
      
      const revertButton = fixture.nativeElement.querySelectorAll('button')[0];
      expect(revertButton.disabled).toBe(true);
    });
  });
});
