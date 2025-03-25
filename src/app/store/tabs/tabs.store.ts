import { signalStore, withState, withMethods, withComputed } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { Tab } from './tabs.model';
import { 
    withEntities, 
    setAllEntities, 
    addEntity, 
    removeEntity, 
    updateEntity, 
    EntityState,
    SelectEntityId
} from '@ngrx/signals/entities';

// Define the state interface
export interface TabState extends EntityState<Tab> {
    selectedTabId: string | null;
    isLastTabDeleteAttempt: boolean;
}

const initialState: TabState = {
    selectedTabId: null,
    isLastTabDeleteAttempt: false,
    entityMap: {},
    ids: []
};

const selectId: SelectEntityId<Tab> = (entity: Tab) => entity.screenId;

// Create the signal store
export const TabsStore = signalStore(
    { providedIn: 'root' },
    withEntities<Tab>(),
    withState<TabState>(initialState),
    withMethods((store) => ({
        addTab(label: string,queriesTriggered: string) {
            const newTab: Tab = {
                id: label,
                screenId: queriesTriggered,
                label: label,
                icon: 'sample',
                active: true
            };

            // First, update all existing tabs to inactive
            store.entities().forEach((entity: Tab) => {
                patchState(
                    store,
                    updateEntity({ 
                        id: entity.id,
                        changes: { active: false }
                    })
                );
            });
            
            patchState(store, addEntity(newTab));
            patchState(store, { selectedTabId: newTab.screenId });
        },

        deleteTab(screenId: string) {
            const entities = store.entities();
            const deletedTabIndex = entities.findIndex((tab: Tab) => tab.screenId === screenId);

            const isActive = entities[deletedTabIndex]?.active;
            const targetTab = entities[deletedTabIndex];
            if (!targetTab) return;
            
            patchState(store, removeEntity(targetTab.screenId));

            if (isActive && entities.length > 1) {
                const newActiveIndex = deletedTabIndex === 0 ? 0 : deletedTabIndex - 1;
                const newActiveTab = entities[newActiveIndex];
                
                if (newActiveTab) {
                    patchState(
                        store,
                        updateEntity({ 
                            id: newActiveTab.id,
                            changes: { active: true }
                        })
                    );
                }
            }
        },

        deleteAll() {
            const entities = store.entities();
            if (entities.length === 0) return;

            patchState(
                store,
                setAllEntities<Tab>([])
            );
            patchState(store, { selectedTabId: null, ids: []});
        },

        updateTabName(newLabel: string) {
            const entity = store.entities().find((tab: Tab) => tab.active);
            if (!entity) return;

            patchState(
                store,
                updateEntity({ 
                    id: entity.id,
                    changes: { label: newLabel}
                })
            );
        },

        selectTab(screenId: string) {
            const entities = store.entities();
            const selectedTab = entities.find((tab: Tab) => tab.screenId === screenId);
            if (!selectedTab) return;

            // First, deactivate all tabs
            entities.forEach((entity: Tab) => {
                patchState(
                    store,
                    updateEntity({ 
                        id: entity.id,
                        changes: { active: false }
                    })
                );
            });

            patchState(
                store,
                updateEntity({ 
                    id: selectedTab.id,
                    changes: { active: true }
                })
            );

            patchState(store, { selectedTabId: selectedTab.screenId });
        },

        resetState() {
            patchState(store, setAllEntities<Tab>([]));
            patchState(store, { 
                selectedTabId: null,
                ids: [],
                isLastTabDeleteAttempt: false
            });
        },

        setLastTabDeleteAttempt(value: boolean) {
            patchState(store, { isLastTabDeleteAttempt: value });
        }
    })),
    withComputed((store) => ({
        allTabs: computed(() => store.entities()),
        total: computed(() => store.entities().length),
        selectedTabId: computed(() => store.selectedTabId()),
        selectedTab: computed(() => 
            store.entities().find((tab: Tab) => tab.screenId === store.selectedTabId())
        ),
        lastTabDeleteAttempt: computed(() => store.isLastTabDeleteAttempt())
    }))
);
