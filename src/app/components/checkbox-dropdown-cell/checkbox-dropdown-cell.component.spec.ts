import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxDropdownCellComponent } from './checkbox-dropdown-cell.component';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { ICellRendererParams } from 'ag-grid-community';
import { FieldType } from '../../services/field-config.service';
import { selectAvailableOrders } from '../../store/field-config/field-config.selectors';

describe('CheckboxDropdownCellComponent', () => {
  let component: CheckboxDropdownCellComponent;
  let fixture: ComponentFixture<CheckboxDropdownCellComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  const mockFieldType: FieldType = 'collapsedHeader';
  const mockAvailableOrders = [1, 2, 3];

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['select']);
    mockStore.select.and.returnValue(of(mockAvailableOrders));

    await TestBed.configureTestingModule({
      imports: [CheckboxDropdownCellComponent],
      providers: [
        { provide: Store, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxDropdownCellComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('agInit', () => {
    const mockParams: Partial<ICellRendererParams> = {
      data: { 
        id: '1',
        collapsedHeader: { visible: true, order: 2 }
      },
      colDef: { field: 'collapsedHeader' }
    };

    beforeEach(() => {
      component.agInit(mockParams as ICellRendererParams);
      fixture.detectChanges();
    });

    it('should initialize component state correctly', () => {
      expect(component.fieldName).toBe('collapsedHeader');
      expect(component.fieldType).toBe('collapsedHeader');
      expect(component.rowId).toBe('1');
      expect(component.isChecked).toBe(true);
      expect(component.selectedOrder).toBe(2);
    });

    it('should select available orders for the correct field type', () => {
      expect(mockStore.select).toHaveBeenCalledWith(selectAvailableOrders(mockFieldType));
    });
  });

  describe('onCheckboxChange', () => {
    const mockEvent = { target: { checked: true } };
    const mockOnChange = jasmine.createSpy('onChange');

    beforeEach(() => {
      component.params = {
        data: { id: '1' },
        onChange: mockOnChange
      } as any;
      component.fieldName = 'collapsedHeader';
    });

    it('should update checked state and call onChange callback', () => {
      component.onCheckboxChange(mockEvent);
      expect(component.isChecked).toBe(true);
      expect(mockOnChange).toHaveBeenCalledWith({
        data: { id: '1' },
        field: 'collapsedHeader',
        visible: true
      });
    });

    it('should reset selectedOrder when unchecked', () => {
      component.selectedOrder = 2;
      component.onCheckboxChange({ target: { checked: false } });
      expect(component.selectedOrder).toBeNull();
    });
  });

  describe('onOrderChange', () => {
    const mockOrder = 2;
    const mockOnOrderChange = jasmine.createSpy('onOrderChange');

    beforeEach(() => {
      component.params = {
        data: { id: '1' },
        onOrderChange: mockOnOrderChange
      } as any;
      component.fieldName = 'collapsedHeader';
    });

    it('should update selected order and call onOrderChange callback', () => {
      component.onOrderChange(mockOrder);
      expect(component.selectedOrder).toBe(mockOrder);
      expect(mockOnOrderChange).toHaveBeenCalledWith({
        data: { id: '1' },
        field: 'collapsedHeader',
        order: mockOrder
      });
    });
  });
});
