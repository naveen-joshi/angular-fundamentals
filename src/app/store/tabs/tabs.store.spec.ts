import { TestBed } from '@angular/core/testing';
import { TabsStore } from './tabs.store';
import { Tab } from './tabs.model';
import { EntityId } from '@ngrx/signals/entities';

describe('TabsStore', () => {
  let store: {
    // State
    selectedTabId: () => string | null;
    isLastTabDeleteAttempt: () => boolean;
    entities: () => Tab[];
    entityMap: () => Record<string, Tab>;
    ids: () => EntityId[];
    // Methods
    addTab: (label: string, queriesTriggered: string) => void;
    deleteTab: (screenId: string) => void;
    deleteAll: () => void;
    updateTabName: (newLabel: string) => void;
    setLastTabDeleteAttempt: (value: boolean) => void;
    selectTab: (screenId: string) => void;
    // Computed
    selectedTab: () => Tab | undefined;
    lastTabDeleteAttempt: () => boolean;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TabsStore]
    });
    store = TestBed.inject(TabsStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should initialize with empty state', () => {
    expect(store.entities()).toEqual([]);
    expect(store.selectedTabId()).toBeNull();
    expect(store.isLastTabDeleteAttempt()).toBeFalsy();
  });

  describe('addTab', () => {
    it('should add a new tab', () => {
      store.addTab('Search 1', '1');
      
      const tabs = store.entities();
      expect(tabs.length).toBe(1);
      expect(tabs[0]).toEqual({
        id: 'Search 1',
        screenId: '1',
        label: 'Search 1',
        icon: 'sample',
        active: true
      });
    });

    it('should deactivate existing tabs when adding a new one', () => {
      store.addTab('Search 1', '1');
      store.addTab('Search 2', '2');

      const tabs = store.entities();
      expect(tabs.length).toBe(2);
      expect(tabs[0].active).toBeFalsy();
      expect(tabs[1].active).toBeTruthy();
    });

    it('should set selectedTabId to the new tab', () => {
      store.addTab('Search 1', '1');
      expect(store.selectedTabId()).toBe('1');
    });
  });

  describe('deleteTab', () => {
    beforeEach(() => {
      store.addTab('Search 1', '1');
      store.addTab('Search 2', '2');
      store.addTab('Search 3', '3');
    });

    it('should remove the specified tab', () => {
      const initialLength = store.entities().length;
      store.deleteTab('2');
      expect(store.entities().length).toBe(initialLength - 1);
      expect(store.entities().find(tab => tab.screenId === '2')).toBeUndefined();
    });

    it('should activate previous tab when deleting active tab', () => {
      store.deleteTab('3'); // Deleting the active tab
      const tabs = store.entities();
      const lastTab = tabs[tabs.length - 1];
      expect(lastTab.active).toBeTruthy();
      expect(lastTab.screenId).toBe('2');
    });

    it('should activate first tab when deleting first active tab', () => {
      store.selectTab('1'); // Select first tab
      store.deleteTab('1'); // Delete first tab
      const tabs = store.entities();
      expect(tabs[0].active).toBeTruthy();
    });
  });

  describe('deleteAll', () => {
    beforeEach(() => {
      store.addTab('Search 1', '1');
      store.addTab('Search 2', '2');
    });

    it('should remove all tabs', () => {
      store.deleteAll();
      expect(store.entities()).toEqual([]);
    });

    it('should reset selectedTabId', () => {
      store.deleteAll();
      expect(store.selectedTabId()).toBeNull();
    });

    it('should reset isLastTabDeleteAttempt', () => {
      store.setLastTabDeleteAttempt(true);
      store.deleteAll();
      expect(store.isLastTabDeleteAttempt()).toBeFalsy();
    });
  });

  describe('updateTabName', () => {
    beforeEach(() => {
      store.addTab('Search 1', '1');
    });

    it('should update active tab label', () => {
      store.updateTabName('Updated Search');
      const activeTab = store.entities().find(tab => tab.active);
      expect(activeTab?.label).toBe('Updated Search');
    });

    it('should not update when no active tab exists', () => {
      store.deleteAll();
      store.updateTabName('Updated Search');
      expect(store.entities()).toEqual([]);
    });
  });

  describe('selectTab', () => {
    beforeEach(() => {
      store.addTab('Search 1', '1');
      store.addTab('Search 2', '2');
    });

    it('should set the selected tab as active', () => {
      store.selectTab('1');
      
      const tabs = store.entities();
      expect(tabs[0].active).toBeTruthy();
      expect(tabs[1].active).toBeFalsy();
    });

    it('should update selectedTabId', () => {
      store.selectTab('1');
      expect(store.selectedTabId()).toBe('1');
    });
  });

  describe('lastTabDeleteAttempt', () => {
    it('should update isLastTabDeleteAttempt state', () => {
      store.setLastTabDeleteAttempt(true);
      expect(store.lastTabDeleteAttempt()).toBeTruthy();
      
      store.setLastTabDeleteAttempt(false);
      expect(store.lastTabDeleteAttempt()).toBeFalsy();
    });
  });

  describe('computed selectors', () => {
    beforeEach(() => {
      store.addTab('Search 1', '1');
      store.addTab('Search 2', '2');
    });

    it('should return correct selectedTab', () => {
      const activeTab = store.entities().find(tab => tab.active);
      expect(store.selectedTab()).toEqual(activeTab);
    });

    it('should return undefined selectedTab when no tab is selected', () => {
      store.deleteAll();
      expect(store.selectedTab()).toBeUndefined();
    });
  });
});
