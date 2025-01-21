import { Routes } from '@angular/router';
import { ParentComponent } from './components/parent/parent.component';
import { SignalsComponent } from './components/signals/signals.component';
import { ReactiveFormComponent } from './components/reactive-form/reactive-form.component';
import { TemplateFormComponent } from './components/template-form/template-form.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'communication', 
    pathMatch: 'full' 
  },
  {
    path: 'communication',
    component: ParentComponent,
    title: 'Component Communication'
  },
  {
    path: 'signals',
    component: SignalsComponent,
    title: 'Signals Demo'
  },
  {
    path: 'reactive-form',
    component: ReactiveFormComponent,
    title: 'Reactive Form'
  },
  {
    path: 'template-form',
    component: TemplateFormComponent,
    title: 'Template Form'
  },
  {
    path: 'lifecycle-rxjs',
    loadComponent: () => import('./components/lifecycle-rxjs/lifecycle-rxjs.component')
      .then(m => m.LifecycleRxjsComponent)
  },
  {
    path: 'ssr-features',
    loadComponent: () => import('./components/ssr-features/ssr-features.component')
      .then(m => m.SsrFeaturesComponent)
  },
  {
    path: 'field-config',
    loadComponent: () => import('./components/field-config-table/field-config-table.component')
      .then(m => m.FieldConfigTableComponent)
  }
];
