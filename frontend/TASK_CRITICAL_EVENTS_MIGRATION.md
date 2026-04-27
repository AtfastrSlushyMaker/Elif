CRITICAL EVENTS MIGRATION OUTPUT

REFERENCE BLOCKS

[REF-A] Export CSV/Excel button (from destinations-list.component.html)
<button type="button" class="detail-secondary-button" (click)="exportFilteredDestinationsExcel()" [disabled]="loading || exportingExcel">
  <i class="fas fa-file-excel"></i>
  {{ exportingExcel ? 'Generating Excel...' : 'Export Excel' }}
</button>
CSS class (from destinations-list.component.scss):
.detail-secondary-button { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

[REF-B] Export PDF button (from destinations-list.component.html)
<button type="button" class="detail-secondary-button" (click)="exportFilteredDestinationsPdf()" [disabled]="loading || exportingPdf">
  <i class="fas fa-file-pdf"></i>
  {{ exportingPdf ? 'Generating PDF...' : 'Export PDF' }}
</button>
CSS class: same detail-secondary-button as REF-A

[REF-C] Edit row button (from destinations-list.component.html)
<button type="button" class="action-button action-button--outline" (click)="editDestination(destination)" [disabled]="!destination.id">
  <i class="fas fa-pen-to-square"></i>
  Edit
</button>
CSS (from destinations-list.component.scss): .action-button + .action-button--outline

[REF-D] Delete row button (from destinations-list.component.html)
<button type="button" class="action-button action-button--danger" [disabled]="!destination.id || isDestinationBusy(destination.id) || !canDeleteDestination(destination)" [class.btn-disabled]="!canDeleteDestination(destination)" (click)="canDeleteDestination(destination) ? deleteDestination(destination) : null" [matTooltip]="getDestinationDeleteTooltip(destination)" [matTooltipDisabled]="canDeleteDestination(destination)" matTooltipPosition="above">
  <i class="fas fa-trash-can"></i>
  Delete
</button>
CSS (from destinations-list.component.scss): .action-button--danger and hover rule

[REF-E] View/Detail row button (from destinations-list.component.html)
<button type="button" class="action-button action-button--outline" (click)="viewDetails(destination)" [disabled]="!destination.id">
  <i class="fas fa-up-right-and-down-left-from-center"></i>
  Details
</button>
CSS: .action-button.action-button--outline

[REF-F] Search input bar (from destinations-list.component.html)
<div class="relative">
  <i class="fas fa-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
  <input id="destinationSearch" type="search" [formControl]="searchControl" placeholder="Search by title, country, or region" class="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-inner focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"/>
</div>

[REF-G] Filter dropdown/select block (from destinations-list.component.html/.scss)
<section *ngIf="showFilters" class="filters-panel card-brand" aria-label="Destination filters"> ... </section>
Key CSS: .filters-panel, .date-field, .date-field input, .date-field select and focus states

[REF-H] Confirmation dialog (Transit component)
<div class="dialog-backdrop" role="presentation" (click)="onBackdropClick($event)"><section class="dialog-panel" role="dialog" aria-modal="true"><div class="dialog-icon" [ngClass]="'dialog-icon--' + dialog.tone"><i class="fas" [ngClass]="dialog.iconClass"></i></div><div class="dialog-copy"><h3>{{ dialog.title }}</h3><p>{{ dialog.message }}</p></div><footer class="dialog-actions"><button type="button" class="btn btn--ghost">{{ dialog.cancelLabel }}</button><button type="button" class="btn btn--confirm" [ngClass]="'btn--' + dialog.tone">{{ dialog.confirmLabel }}</button></footer></section></div>
Key CSS copied: .dialog-backdrop, .dialog-panel, .dialog-copy h3/p, .dialog-actions, .btn--ghost, .btn--danger gradient

[REF-I] Toast notification (Transit component)
<section class="toast-stack" aria-live="polite" aria-atomic="false"><article class="toast" *ngFor="let toast of toasts$ | async" [ngClass]="toneClass(toast.type)"><div class="toast__icon"><mat-icon>{{ iconName(toast.type) }}</mat-icon></div><div class="toast__content"><h4>{{ toast.title }}</h4><p>{{ toast.message }}</p></div><button type="button" (click)="dismiss(toast.id)" class="toast__dismiss" aria-label="Dismiss toast"><mat-icon>close</mat-icon></button></article></section>
Key CSS: .toast-stack, .toast, .toast--success, .toast--error, .toast--info, icon sizes and shadow

[REF-J] Button/action icon classes used in Transit references
fa-plus, fa-search, fa-filter, fa-file-pdf, fa-file-excel, fa-rotate-left, fa-rotate-right, fa-spinner, fa-triangle-exclamation, fa-map-location-dot, fa-location-dot, fa-up-right-and-down-left-from-center, fa-pen-to-square, fa-box-open, fa-box-archive, fa-trash-can, fa-circle-check, fa-xmark, fa-circle-info


FILE: src/app/back-office/events/pages/categories/admin-categories.component.css
FULL UPDATED SCSS/CSS
:host {
  display: block;
}

/* ============================================================
   PAGE HEADER & KPI CARDS
   ============================================================ */
.bo-categories-page {
  position: relative;
}

.bo-kpi-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1rem;
}

.bo-kpi-card-accent {
  background: linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%);
}

.bo-kpi-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.bo-kpi-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
}

.bo-kpi-copy {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

/* ============================================================
   BOUTONS
   ============================================================ */
.detail-primary-button,
.detail-secondary-button,
.bo-action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  text-decoration: none;
  border: 1px solid transparent;
}

.detail-primary-button {
  background: linear-gradient(135deg, #3a9282, #2f7a6e);
  color: white;
  box-shadow: 0 12px 24px -18px rgba(58, 146, 130, 0.9);
}

.detail-primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px -18px rgba(58, 146, 130, 0.96);
  filter: saturate(108%);
}

.detail-secondary-button {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.bo-action-button-back {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.bo-action-button-back:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.bo-action-button-edit {
  background: #ecfeff;
  border: 1px solid #a5d8d0;
  color: #0d9488;
}

.bo-action-button-edit:hover {
  background: #d1fdf9;
  border-color: #7eccc4;
}

.bo-action-button-delete {
  background: #fff1f2;
  border: 1px solid rgba(214, 73, 86, 0.28);
  color: #b4233b;
}

.bo-action-button-delete:hover {
  background: #ffe4e8;
  border-color: rgba(214, 73, 86, 0.34);
  color: #a71d33;
}

/* ============================================================
   TABLEAU
   ============================================================ */
.bo-section-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.25rem;
}

.bo-categories-table-wrap {
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  overflow-x: auto;
}

.bo-categories-table {
  width: 100%;
  border-collapse: collapse;
}

.bo-categories-table th {
  padding: 0.75rem;
  background: #f8fafc;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.bo-categories-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.bo-categories-table tr:hover {
  background: #f8fafc;
}

.bo-categories-main-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bo-categories-icon-tile {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.bo-categories-title {
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.bo-categories-inline-pill {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #f1f5f9;
  border-radius: 1rem;
  font-size: 0.7rem;
  color: #64748b;
}

.bo-categories-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.bo-categories-status-pill-success {
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.bo-categories-status-pill-warning {
  background: rgba(248, 154, 63, 0.1);
  color: #b45309;
  border: 1px solid rgba(248, 154, 63, 0.2);
}

.bo-categories-description {
  font-size: 0.8rem;
  color: #475569;
  max-width: 300px;
}

.bo-categories-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.34rem;
  min-height: 40px;
  padding: 0.5rem 0.7rem;
  border-radius: 50px;
  border: 1px solid #d9e5ee;
  background: #fff;
  color: #334155;
  font-size: 0.76rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  border-color: #3a9282;
  color: #2f7a6e;
  background: #f7fcfb;
}

.action-button--outline {
  border-color: #d9e5ee;
  background: #fff;
  color: #334155;
}

.action-button--danger {
  border-color: rgba(214, 73, 86, 0.28);
  color: #b4233b;
  background: #fff1f2;
}

.action-button--danger:hover:not(:disabled) {
  border-color: rgba(214, 73, 86, 0.34);
  background: #ffe4e8;
  color: #a71d33;
}

/* ============================================================
   MODALE - VERSION SIMPLIFIÉE
   ============================================================ */
.bo-categories-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.46);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.bo-categories-modal {
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.78));
  border-radius: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.66);
  width: 100%;
  max-width: 31rem;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px -38px rgba(15, 23, 42, 0.7);
  padding: 0;
}

/* Header modale */
.bo-categories-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.bo-categories-modal-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #64748b;
  margin-bottom: 0.4rem;
}

.bo-categories-modal-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.bo-categories-modal-subtitle {
  font-size: 0.88rem;
  color: #475569;
  margin: 0.38rem 0 0;
  line-height: 1.5;
}

.bo-categories-close {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.66);
  background: #f1f5f9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.bo-categories-close:hover {
  border-color: #e2e8f0;
  background: #e2e8f0;
  color: #0f172a;
}

/* Body modale */
.bo-categories-modal-body {
  padding: 1.25rem;
  overflow-y: auto;
}

.bo-categories-form-grid {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 1.25rem;
}

/* Formulaire */
.bo-form-field {
  margin-bottom: 1rem;
}

.bo-form-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.bo-form-input,
.bo-form-textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  box-sizing: border-box;
}

.bo-form-input:focus,
.bo-form-textarea:focus {
  outline: none;
  border-color: #3a9282;
  box-shadow: 0 0 0 3px rgba(58, 146, 130, 0.12);
}

.bo-form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Toggle */
.bo-toggle-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
}

.bo-toggle-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: #0f172a;
}

.bo-toggle-desc {
  font-size: 0.7rem;
  color: #64748b;
}

.bo-toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.bo-toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.bo-toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #cbd5e1;
  border-radius: 34px;
  cursor: pointer;
  transition: 0.2s;
}

.bo-toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}

input:checked + .bo-toggle-slider {
  background: #3a9282;
}

input:checked + .bo-toggle-slider:before {
  transform: translateX(20px);
}

/* Aperçu */
.bo-preview-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
}

.bo-preview-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.bo-icon-preview {
  width: 56px;
  height: 56px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 0.5rem;
}

.bo-icon-input {
  width: 70px;
  margin: 0 auto;
  text-align: center;
  padding: 0.3rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
}

.bo-icon-hint {
  font-size: 0.65rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}

.bo-preview-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 2rem;
  margin-top: 0.75rem;
  font-size: 0.75rem;
}

.bo-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.bo-status-approval {
  background: #fef3c7;
  color: #b45309;
}

.bo-status-free {
  background: #d1fae5;
  color: #065f46;
}

/* Footer modale */
.bo-categories-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.bo-btn-primary,
.bo-btn-secondary {
  padding: 0.52rem 0.72rem;
  border-radius: 0.72rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.bo-btn-primary {
  background: linear-gradient(145deg, #3a9282, #2f7a6e);
  color: white;
  box-shadow: 0 12px 22px -16px rgba(13, 148, 136, 0.82);
}

.bo-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px -16px rgba(13, 148, 136, 0.9);
}

.bo-btn-secondary {
  background: #fff;
  color: #334155;
  border-color: #d6deea;
}

.bo-btn-secondary:hover {
  transform: translateY(-1px);
  background: #f8fafc;
}

/* États vides et erreurs */
.bo-categories-state,
.bo-categories-error {
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
}

.bo-categories-state {
  background: #f8fafc;
  color: #64748b;
}

.bo-categories-error {
  background: #fef2f2;
  color: #b91c1c;
}

.bo-form-error {
  padding: 0.5rem 0.75rem;
  background: #fef2f2;
  border-radius: 0.5rem;
  color: #b91c1c;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .bo-categories-form-grid {
    grid-template-columns: 1fr;
  }
  
  .bo-categories-table th,
  .bo-categories-table td {
    display: block;
  }
  
  .bo-categories-table thead {
    display: none;
  }
  
  .bo-categories-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.5rem;
  }
  
  .bo-categories-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: none;
    padding: 0.3rem 0;
  }
  
  .bo-categories-table td::before {
    content: attr(data-label);
    font-weight: 600;
    font-size: 0.7rem;
    color: #64748b;
  }
  
  .bo-categories-actions {
    justify-content: flex-start;
  }
}

FILE: src/app/back-office/events/pages/categories/admin-categories.component.html
FULL UPDATED HTML
<section class="bo-community-page bo-categories-page relative mx-auto max-w-[1600px] px-4 pb-10 pt-6 sm:px-6 lg:px-10">
  <div class="space-y-6">
    <header class="bo-community-hero">
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <div>
          <p class="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">Back Office</p>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Event Categories</h1>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Manage the category system used across the events module with the same compact data presentation as the list pages.
          </p>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" class="bo-action-button bo-action-button-back" (click)="goBack()">
              <i class="fas fa-arrow-left"></i>
              <span>Back</span>
            </button>

            <button type="button" class="detail-primary-button" (click)="openCreateForm()">
              <i class="fas fa-plus"></i>
              New Category
            </button>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <article class="bo-kpi-card">
            <p class="bo-kpi-label">Total Categories</p>
            <p class="bo-kpi-value">{{ categories.length }}</p>
            <p class="bo-kpi-copy">Categories currently available for event assignment.</p>
          </article>
          <article class="bo-kpi-card bo-kpi-card-accent">
            <p class="bo-kpi-label">Competition Mode</p>
            <p class="bo-kpi-value">{{ competitionCount }}</p>
            <p class="bo-kpi-copy">Categories with eligibility rules enabled.</p>
          </article>
        </div>
      </div>
    </header>

    <div *ngIf="loading" class="bo-categories-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Loading categories...</span>
    </div>

    <div *ngIf="error && !loading" class="bo-categories-error">
      <i class="fas fa-triangle-exclamation"></i>
      <span>{{ error }}</span>
    </div>

    <section *ngIf="!loading && !error" class="bo-section-card">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-black text-slate-900">All Categories</h2>
          <p class="mt-1 text-sm text-slate-500">{{ categories.length }} category{{ categories.length > 1 ? 'ies' : 'y' }} available</p>
        </div>

        <button type="button" class="detail-primary-button" (click)="openCreateForm()">
          <i class="fas fa-plus"></i>
          Create Category
        </button>
      </div>

      <div *ngIf="categories.length === 0" class="bo-categories-state mt-6">
        <i class="fas fa-tag"></i>
        <span>No categories yet. Create your first one.</span>
      </div>

      <div *ngIf="categories.length > 0" class="bo-categories-table-wrap mt-6 overflow-x-auto">
        <table class="bo-categories-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Registration Mode</th>
              <th>Competition</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cat of categories">
              <td data-label="Category">
                <div class="bo-categories-main-cell">
                  <div class="bo-categories-icon-tile">{{ getIconEmoji(cat.icon) }}</div>
                  <div>
                    <p class="bo-categories-title">{{ cat.name }}</p>
                  </div>
                </div>
               </td>
              <td data-label="Description">
                <p class="bo-categories-description">
                  {{ cat.description || 'No description provided for this category.' }}
                </p>
               </td>
              <td data-label="Registration Mode">
                <span class="bo-categories-status-pill"
                      [ngClass]="cat.requiresApproval ? 'bo-categories-status-pill-warning' : 'bo-categories-status-pill-success'">
                  <i class="fas" [ngClass]="cat.requiresApproval ? 'fa-shield-halved' : 'fa-circle-check'"></i>
                  {{ cat.requiresApproval ? 'Approval required' : 'Free registration' }}
                </span>
                </td>
              <td data-label="Competition">
                <span class="bo-categories-competition-badge" *ngIf="cat.competitionMode">
                  <i class="fas fa-trophy"></i> Competition
                </span>
                <span class="bo-categories-competition-badge bo-categories-competition-badge--inactive" *ngIf="!cat.competitionMode">
                  <i class="fas fa-circle-dot"></i> Standard
                </span>
                </td>
              <td data-label="Actions">
                <div class="bo-categories-actions">
                  <button type="button" class="action-button action-button--outline" (click)="openEditForm(cat)" title="Edit">
                    <i class="fas fa-pen-to-square"></i>
                    <span>Edit</span>
                  </button>
                  <button type="button" class="action-button action-button--danger" (click)="deleteCategory(cat)" title="Delete">
                    <i class="fas fa-trash-can"></i>
                    <span>Delete</span>
                  </button>
                </div>
                </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- MODALE -->
    <div *ngIf="showForm" class="bo-categories-overlay" (click)="closeForm()">
      <div class="bo-categories-modal" (click)="$event.stopPropagation()">
        
        <!-- HEADER -->
        <div class="bo-categories-modal-header">
          <div>
            <div class="bo-categories-modal-eyebrow">CATEGORY MANAGEMENT</div>
            <h3 class="bo-categories-modal-title">
              {{ isEditing ? 'Edit Category' : 'Create Category' }}
            </h3>
            <p class="bo-categories-modal-subtitle">
              Configure how this category appears across the events module.
            </p>
          </div>
          <button type="button" class="bo-categories-close" (click)="closeForm()">
            <i class="fas fa-xmark"></i>
          </button>
        </div>

        <!-- BODY -->
        <div class="bo-categories-modal-body">
          <div class="bo-categories-form-grid">
            
            <!-- COLONNE GAUCHE -->
            <div class="bo-categories-form-main">
              <div class="bo-form-field">
                <label class="bo-form-label">NAME</label>
                <input type="text" [(ngModel)]="form.name" class="bo-form-input" placeholder="Ex: Sports, Workshops, Competitions">
              </div>

              <div class="bo-form-field">
                <label class="bo-form-label">DESCRIPTION</label>
                <textarea [(ngModel)]="form.description" class="bo-form-textarea" rows="4" placeholder="Write a short description to explain when this category should be used."></textarea>
              </div>

              <div class="bo-form-field">
                <label class="bo-form-label">REGISTRATION FLOW</label>
                <div class="bo-toggle-card">
                  <div class="bo-toggle-info">
                    <span class="bo-toggle-title">
                      {{ form.requiresApproval ? 'Approval required' : 'Free registration' }}
                    </span>
                    <span class="bo-toggle-desc">
                      {{ form.requiresApproval 
                        ? 'Participants must be reviewed by an admin before confirmation.'
                        : 'Participants can register without manual approval.' }}
                    </span>
                  </div>
                  <label class="bo-toggle-switch">
                    <input type="checkbox" [(ngModel)]="form.requiresApproval">
                    <span class="bo-toggle-slider"></span>
                  </label>
                </div>
              </div>

              <!-- ✅ NOUVEAU : COMPETITION MODE -->
              <div class="bo-form-field">
                <label class="bo-form-label">COMPETITION MODE</label>
                <div class="bo-toggle-card">
                  <div class="bo-toggle-info">
                    <span class="bo-toggle-title">
                      {{ form.competitionMode ? 'Competition enabled' : 'Standard mode' }}
                    </span>
                    <span class="bo-toggle-desc">
                      {{ form.competitionMode 
                        ? 'Eligibility rules will be applied to participants automatically.'
                        : 'No eligibility rules — free participation for everyone.' }}
                    </span>
                  </div>
                  <label class="bo-toggle-switch">
                    <input type="checkbox" [(ngModel)]="form.competitionMode">
                    <span class="bo-toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div *ngIf="formError" class="bo-form-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ formError }}</span>
              </div>
            </div>

            <!-- COLONNE DROITE -->
            <div class="bo-categories-form-side">
              <div class="bo-preview-card">
                <div class="bo-preview-title">VISUAL IDENTITY</div>
                
                <div class="bo-icon-field">
                  <div class="bo-icon-preview">{{ form.icon || 'event' }}</div>
                  <input type="text" [(ngModel)]="form.icon" class="bo-icon-input" maxlength="24" placeholder="event">
                  <div class="bo-icon-hint">Examples: trophy, theater, pets, book</div>
                </div>

                <div class="bo-preview-sample">
                  <div class="bo-preview-label">CATEGORY PREVIEW</div>
                  <div class="bo-preview-badge">
                    <span class="bo-preview-name">{{ form.name || 'Category name' }}</span>
                    <span class="bo-preview-competition" *ngIf="form.competitionMode"><i class="fas fa-trophy"></i></span>
                  </div>
                  <div class="bo-preview-status">
                    <span class="bo-status-badge" [class.bo-status-approval]="form.requiresApproval" [class.bo-status-free]="!form.requiresApproval">
                      <i class="fas" [class.fa-shield-halved]="form.requiresApproval" [class.fa-circle-check]="!form.requiresApproval"></i>
                      {{ form.requiresApproval ? 'Approval required' : 'Free registration' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="bo-categories-modal-footer">
          <button type="button" class="bo-btn-secondary" (click)="closeForm()">Cancel</button>
          <button type="button" class="bo-btn-primary" (click)="saveCategory()">
            <i class="fas" [class.fa-floppy-disk]="isEditing" [class.fa-plus]="!isEditing"></i>
            {{ isEditing ? 'Update Category' : 'Create Category' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

DIFF TABLE
| Element | Old (Events) | New (Transit-matched) |
| --- | --- | --- |
| Row Edit button | bo-action-button bo-action-button-edit + fa-pen-to-square | action-button action-button--outline + fa-pen-to-square |
| Row Delete button | bo-action-button bo-action-button-delete + fa-trash-can | action-button action-button--danger + fa-trash-can |

FILE: src/app/back-office/events/pages/dashboard/admin-dashboard.component.css
FULL UPDATED SCSS/CSS
:host {
  --green-primary:  #3a9282;
  --green-light:    #2f7a6e;
  --green-bg:       rgba(58, 146, 130, 0.08);
  --green-border:   rgba(58, 146, 130, 0.2);

  --blue:           #1d4ed8;
  --amber:          #d97706;
  --purple:         #7c3aed;
  --red:            #dc2626;

  --bg-page:        #f8fafc;
  --bg-card:        #ffffff;
  --bg-header:      #f8fafc;

  --border:         #e2e8f0;
  --border-light:   #f1f5f9;

  --text-primary:   #0f172a;
  --text-secondary: #475569;
  --text-muted:     #64748b;

  --shadow-sm:      0 4px 20px rgba(15, 23, 42, 0.06);
  --shadow-md:      0 12px 28px rgba(15, 23, 42, 0.1);
  --radius:         1rem;
  --radius-sm:      0.75rem;
}

/* ── Layout ── */
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;
  background: transparent;
}

/* ── Loading ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px;
  color: var(--text-secondary);
  font-size: 14px;
}

.dark-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--green-primary);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════
   KPI GRID
══════════════════════════════════════════════ */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.kpi-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: var(--radius) var(--radius) 0 0;
}

.kpi-card--green::before  { background: linear-gradient(90deg, var(--green-primary), var(--green-light)); }
.kpi-card--blue::before   { background: linear-gradient(90deg, #1d4ed8, var(--blue)); }
.kpi-card--amber::before  { background: linear-gradient(90deg, #b45309, var(--amber)); }
.kpi-card--purple::before { background: linear-gradient(90deg, #5b21b6, var(--purple)); }

.kpi-icon {
  font-size: 26px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-card--green  .kpi-icon { background: rgba(58, 146, 130, 0.12); }
.kpi-card--blue   .kpi-icon { background: rgba(29, 122, 79, 0.12); }
.kpi-card--amber  .kpi-icon { background: rgba(217, 119, 6, 0.12); }
.kpi-card--purple .kpi-icon { background: rgba(124, 58, 237, 0.12); }

.kpi-body { flex: 1; }

.kpi-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  margin-bottom: 4px;
}

.kpi-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 3px;
}

.kpi-sub {
  font-size: 11px;
  color: var(--text-muted);
}

.kpi-trend {
  font-size: 18px;
}

.kpi-gauge {
  width: 24px;
  height: 44px;
  background: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column-reverse;
  flex-shrink: 0;
}

.kpi-gauge-fill {
  background: linear-gradient(0deg, var(--amber), #fbbf24);
  border-radius: 4px;
  transition: height 0.8s ease;
}

/* ══════════════════════════════════════════════
   CHARTS ROW
══════════════════════════════════════════════ */
.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.panel-badge {
  font-size: 11px;
  color: var(--green-primary);
  background: var(--green-bg);
  border: 1px solid var(--green-border);
  padding: 3px 8px;
  border-radius: 50px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.panel-link {
  font-size: 12px;
  color: var(--green-primary);
  text-decoration: none;
  font-weight: 600;
}

.panel-link:hover { text-decoration: underline; }

.detail-secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  text-decoration: none;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  color: #475569;
}

.detail-secondary-button:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

/* ── Trend bars ── */
.trend-chart {
  height: 150px;
  display: flex;
  align-items: flex-end;
}

.trend-bars {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  width: 100%;
  height: 100%;
}

.trend-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
}

.trend-bar-value {
  font-size: 10px;
  color: var(--text-muted);
}

.trend-bar {
  width: 100%;
  min-height: 4px;
  background: rgba(58, 146, 130, 0.1);
  border-radius: 4px 4px 0 0;
  transition: height 0.6s ease;
}

.trend-bar--current {
  background: linear-gradient(0deg, var(--green-primary), var(--green-light));
}

.trend-bar-label {
  font-size: 9px;
  color: var(--text-muted);
  white-space: nowrap;
}

/* ── Status / Category bars ── */
.status-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 85px;
  flex-shrink: 0;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot--planned   { background: var(--green-light); }
.dot--ongoing   { background: var(--amber); }
.dot--completed { background: var(--blue); }
.dot--cancelled { background: var(--red); }
.dot--full      { background: var(--purple); }

.status-name {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-bar-track {
  flex: 1;
  height: 6px;
  background: var(--border-light);
  border-radius: 3px;
  overflow: hidden;
}

.status-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.fill--planned   { background: var(--green-light); }
.fill--ongoing   { background: var(--amber); }
.fill--completed { background: var(--blue); }
.fill--cancelled { background: var(--red); }
.fill--full      { background: var(--purple); }
.fill--category  { background: linear-gradient(90deg, var(--green-primary), var(--green-light)); }

.status-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  width: 24px;
  text-align: right;
}

/* ══════════════════════════════════════════════
   TOP TABLE PANEL
══════════════════════════════════════════════ */
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.top-table-wrap { overflow-x: auto; }

.top-table {
  width: 100%;
  border-collapse: collapse;
}

.top-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  background: var(--bg-header);
}

.top-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
  font-size: 13px;
  color: var(--text-primary);
}

.top-table tr:last-child td { border-bottom: none; }
.top-table tr:hover td { background: var(--bg-header); }

/* Rank badge */
.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.rank-1 { background: #fef3c7; color: #92400e; }
.rank-2 { background: #f3f4f6; color: #374151; }
.rank-3 { background: #fef3c7; color: #b45309; }
.rank-4, .rank-5 { background: var(--border-light); color: var(--text-muted); }

.event-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-img-placeholder {
  font-size: 16px;
  width: 28px;
  text-align: center;
}

.event-title-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.cat-pill {
  background: var(--green-bg);
  color: var(--green-primary);
  border: 1px solid var(--green-border);
  padding: 3px 8px;
  border-radius: 50px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.loc-cell {
  font-size: 12px;
  color: var(--text-secondary);
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fill-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fill-bar {
  width: 56px;
  height: 5px;
  background: var(--border-light);
  border-radius: 3px;
  overflow: hidden;
}

.fill-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, var(--green-primary), var(--green-light));
  border-radius: 3px;
}

.fill-cell span {
  font-size: 11px;
  color: var(--text-muted);
  width: 30px;
}

/* Status pills */
.status-pill {
  padding: 3px 10px;
  border-radius: 50px;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sp--planned   { background: rgba(16, 185, 129, 0.1); color: #065f46; }
.sp--ongoing   { background: rgba(248, 154, 63, 0.1); color: #b45309; }
.sp--completed { background: rgba(59, 130, 246, 0.1); color: #1d4ed8; }
.sp--cancelled { background: rgba(220, 38, 38, 0.1); color: #991b1b; }
.sp--full      { background: rgba(124, 58, 237, 0.1); color: #5b21b6; }

.row-actions { display: flex; gap: 4px; }

.row-action-link {
  min-height: 30px;
  padding: 0.32rem 0.62rem;
  font-size: 0.72rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.34rem;
  min-height: 40px;
  padding: 0.5rem 0.7rem;
  border-radius: 50px;
  border: 1px solid #d9e5ee;
  background: #fff;
  color: #334155;
  font-size: 0.76rem;
  font-weight: 700;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-button:hover:not(:disabled) {
  border-color: #3a9282;
  color: #2f7a6e;
  background: #f7fcfb;
}

.action-button--outline {
  border-color: #d9e5ee;
  background: #fff;
  color: #334155;
}

.row-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--bg-header);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.15s ease;
}

.row-btn:hover {
  background: var(--green-bg);
  border-color: var(--green-border);
}

/* ══════════════════════════════════════════════
   QUICK ACTIONS
══════════════════════════════════════════════ */
.quick-actions h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.action-card:hover {
  border-color: var(--green-primary);
  color: var(--green-primary);
  background: var(--green-bg);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-card--primary {
  border-color: var(--green-border);
  color: var(--green-primary);
  background: var(--green-bg);
  border: 1px solid var(--green-border);
}

.action-card--primary:hover {
  background: rgba(58, 146, 130, 0.12);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.ac-icon { font-size: 22px; }

/* ══════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════ */
@media (max-width: 1200px) {
  .kpi-grid      { grid-template-columns: repeat(2, 1fr); }
  .charts-row    { grid-template-columns: 1fr; }
  .action-cards  { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .kpi-grid     { grid-template-columns: 1fr; }
  .action-cards { grid-template-columns: 1fr; }
}

FILE: src/app/back-office/events/pages/dashboard/admin-dashboard.component.html
FULL UPDATED HTML
<div class="dashboard" *ngIf="stats; else loadingState">
<div class="dashboard-header">
  <button class="btn-back" (click)="goBack()">
    <i class="fas fa-arrow-left"></i>
    Back to Events
  </button>
  <h2 class="dashboard-title">Dashboard</h2>
  <div class="header-spacer"></div>
</div>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card kpi-card--green">
      <div class="kpi-icon"><i class="fas fa-calendar-days"></i></div>
      <div class="kpi-body">
        <div class="kpi-value">{{ stats.totalEvents }}</div>
        <div class="kpi-label">Total Events</div>
        <div class="kpi-sub">+{{ stats.eventsThisWeek }} this week</div>
      </div>
      <div class="kpi-trend kpi-trend--up">↑</div>
    </div>

    <div class="kpi-card kpi-card--blue">
      <div class="kpi-icon"><i class="fas fa-users"></i></div>
      <div class="kpi-body">
        <div class="kpi-value">{{ stats.totalParticipants | number }}</div>
        <div class="kpi-label">Confirmed Participants</div>
        <div class="kpi-sub">All editions</div>
      </div>
    </div>

    <div class="kpi-card kpi-card--amber">
      <div class="kpi-icon"><i class="fas fa-bullseye"></i></div>
      <div class="kpi-body">
        <div class="kpi-value">{{ stats.averageFillRate | number:'1.0-1' }}%</div>
        <div class="kpi-label">Avg Fill Rate</div>
        <div class="kpi-sub">Active events</div>
      </div>
      <div class="kpi-gauge">
        <div class="kpi-gauge-fill" [style.height.%]="stats.averageFillRate"></div>
      </div>
    </div>

    <div class="kpi-card kpi-card--purple">
      <div class="kpi-icon"><i class="fas fa-chart-line"></i></div>
      <div class="kpi-body">
        <div class="kpi-value">{{ stats.eventsThisMonth }}</div>
        <div class="kpi-label">Created this month</div>
        <div class="kpi-sub">vs {{ stats.eventsThisWeek }} this week</div>
      </div>
    </div>
  </div>

  <!-- Row 2: Trend + Status Distribution -->
  <div class="charts-row">
    <!-- Monthly Trend -->
    <div class="chart-panel chart-panel--wide">
      <div class="panel-header">
        <h3>Monthly Trend (12 months)</h3>
        <span class="panel-badge">Event creations</span>
      </div>
      <div class="trend-chart">
        <div class="trend-bars">
          <div *ngFor="let entry of trendEntries" class="trend-bar-wrap" [title]="entry.label + ' : ' + entry.count">
            <div class="trend-bar-value" *ngIf="entry.count > 0">{{ entry.count }}</div>
            <div class="trend-bar" [style.height.%]="trendBarHeight(entry.count)" [class.trend-bar--current]="entry.isCurrent"></div>
            <div class="trend-bar-label">{{ entry.shortLabel }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Distribution -->
    <div class="chart-panel">
      <div class="panel-header">
        <h3>By Status</h3>
      </div>
      <div class="status-bars">
        <div *ngFor="let s of statusEntries" class="status-row">
          <div class="status-info">
            <span class="status-dot" [class]="'dot--' + s.key.toLowerCase()"></span>
            <span class="status-name">{{ statusLabels[s.key] || s.key }}</span>
          </div>
          <div class="status-bar-track">
            <div class="status-bar-fill" [class]="'fill--' + s.key.toLowerCase()" [style.width.%]="barPct(s.value, maxStatus)"></div>
          </div>
          <span class="status-count">{{ s.value }}</span>
        </div>
      </div>

      <div class="panel-header" style="margin-top: 24px;">
        <h3>By Category</h3>
      </div>
      <div class="status-bars">
        <div *ngFor="let c of categoryEntries" class="status-row">
          <span class="status-name">{{ c.key }}</span>
          <div class="status-bar-track">
            <div class="status-bar-fill fill--category" [style.width.%]="barPct(c.value, maxCategory)"></div>
          </div>
          <span class="status-count">{{ c.value }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Row 3: Top Events -->
  <div class="panel">
    <div class="panel-header">
      <h3>Top 5 Events (Highest Fill Rate)</h3>
      <a routerLink="/back-office/events" class="panel-link"><i class="fas fa-up-right-and-down-left-from-center"></i> View all</a>
    </div>
    <div class="top-table-wrap">
      <table class="top-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Event</th>
            <th>Category</th>
            <th>Location</th>
            <th>Date</th>
            <th>Fill Rate</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of stats.topEvents; let i = index">
            <td><span class="rank-badge" [class]="'rank-' + (i+1)">{{ i+1 }}</span></td>
            <td>
              <div class="event-name-cell">
                <span class="event-img-placeholder"><i class="fas fa-calendar-days"></i></span>
                <span class="event-title-text">{{ e.title }}</span>
              </div>
             </td>
            <td><span class="cat-pill">{{ e.category?.name || '—' }}</span></td>
            <td class="loc-cell">{{ e.location }}</td>
            <td>{{ e.startDate | date:'dd/MM/yy' }}</td>
            <td>
              <div class="fill-cell">
                <div class="fill-bar">
                  <div class="fill-bar-inner" [style.width.%]="fillPct(e)"></div>
                </div>
                <span>{{ fillPct(e) }}%</span>
              </div>
              </td>
            <td>
              <span class="status-pill" [class]="'sp--' + e.status.toLowerCase()">
                {{ statusLabels[e.status] || e.status }}
              </span>
              </td>
            <td>
              <div class="row-actions">
                <a [routerLink]="['/back-office/events', e.id]" class="action-button action-button--outline row-action-link" title="View details">
                  <i class="fas fa-up-right-and-down-left-from-center"></i>
                  Details
                </a>
              </div>
              </td>
            </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="quick-actions">
    <h3>Quick Actions</h3>
    <div class="action-cards">
      <a routerLink="/admin/events/create" class="action-card action-card--primary">
        <span class="ac-icon"><i class="fas fa-plus"></i></span>
        <span>Create Event</span>
      </a>
      
<!-- Manage Categories - CORRECT -->
<a routerLink="/admin/events/categories" class="action-card">
  <span class="ac-icon"><i class="fas fa-tags"></i></span>
  <span>Manage Categories</span>
</a>
      <a routerLink="/back-office/events" class="action-card">
        <span class="ac-icon"><i class="fas fa-clock"></i></span>
        <span>Pending Approvals</span>
      </a>
      <button type="button" class="detail-secondary-button" (click)="exportAll()">
        <i class="fas fa-file-excel"></i>
        Export Excel
      </button>
    </div>
  </div>
</div>

<ng-template #loadingState>
  <div class="loading-state">
    <div class="dark-spinner"></div>
    <span>Loading dashboard...</span>
  </div>
</ng-template>

DIFF TABLE
| Element | Old (Events) | New (Transit-matched) |
| --- | --- | --- |
| Row View button | row-btn + fa-eye | action-button action-button--outline + fa-up-right-and-down-left-from-center |
| Export button | action-card export tile | detail-secondary-button + fa-file-excel |

FILE: src/app/back-office/events/pages/detail/event-detail.component.css
FULL UPDATED SCSS/CSS
:host {
  display: block;
}

.bo-event-detail-page {
  position: relative;
}

.bo-event-detail-status-pill,
.bo-event-detail-inline-pill,
.bo-event-detail-tab-badge,
.bo-event-detail-table-pill,
.bo-event-detail-index-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  white-space: nowrap;
}

.bo-event-detail-status-pill {
  padding: 0.36rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #fff;
}

.bo-event-detail-inline-pill,
.bo-event-detail-table-pill {
  border: 1px solid #dbe5ef;
  background: #f8fafc;
  padding: 0.28rem 0.68rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
}

.bo-event-detail-table-pill-success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

.bo-event-detail-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.92);
  padding-bottom: 1rem;
}


/* ── TOKENS ─────────────────────────────────────────────────── */
:root,
.event-detail {
  --bg:         #f8fafc;
  --surface:    #ffffff;
  --surface2:   #f8fafc;

  /* Teal principal */
  --teal:       #3a9282;
  --teal-h:     #2f7a6e;
  --teal-lt:    #e6f4f1;
  --teal-md:    #b8dfdb;

  /* Texte */
  --text:       #1a1a1a;
  --text2:      #374151;
  --muted:      #6b7280;
  --muted2:     #9ca3af;

  /* Bordures */
  --border:     #dde7ef;
  --border2:    #d9e5ee;

  /* États sémantiques */
  --orange:     #d97706;
  --orange-lt:  #fffbeb;
  --orange-bd:  #fde68a;
  --red:        #dc2626;
  --red-lt:     #fef2f2;
  --red-md:     #fee2e2;
  --red-bd:     #fca5a5;
  --green:      #16a34a;
  --green-lt:   #f0fdf4;
  --green-md:   #bbf7d0;
  --amber:      #b45309;
  --amber-lt:   #fef3c7;
  --purple:     #7c3aed;
  --purple-lt:  #ede9fe;
  --blue:       #1d4ed8;
  --blue-lt:    #eff6ff;

  /* Ombres */
  --shadow:     0 4px 20px rgba(15, 23, 42, 0.06);
  --shadow-h:   0 12px 28px rgba(15, 23, 42, 0.1);
  --shadow-lg:  0 24px 60px -38px rgba(15, 23, 42, 0.7);

  /* Rayons */
  --r:          12px;
  --r-sm:       8px;
  --r-pill:     999px;

  font-family: inherit;
  color: var(--text);
}

/* ================================================================
   PAGE SHELL
   ================================================================ */
.event-detail {
  background: var(--bg);
  min-height: 100vh;
}

/* ================================================================
   HEADER — sticky barre de navigation de détail
   ================================================================ */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 32px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 12px;
  flex-wrap: wrap;
  box-shadow: var(--shadow);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg);
  border: 1.5px solid var(--border2);
  border-radius: var(--r-sm);
  padding: 7px 14px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
}
.btn-back:hover {
  background: var(--surface);
  color: var(--teal);
  border-color: var(--teal-md);
  transform: translateX(-2px);
}

.header-right {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

/* ================================================================
   BOUTONS — système complet
   ================================================================ */
.btn {
  padding: 9px 18px;
  border-radius: var(--r-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  border: none;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.btn:disabled { opacity: .4; cursor: not-allowed; }

/* Primaire — teal */
.btn-primary {
  background: var(--teal);
  color: #fff;
  border: none;
}
.btn-primary:hover:not(:disabled) {
  background: var(--teal-h);
  transform: translateY(-1px);
}

/* Outline — bordure teal */
.btn-outline {
  background: var(--surface);
  border: 1.5px solid var(--border2);
  color: var(--text2);
}
.btn-outline:hover:not(:disabled) {
  border-color: var(--teal-md);
  color: var(--teal);
  background: var(--teal-lt);
}

/* Ghost — fond gris */
.btn-ghost {
  background: var(--bg);
  border: 1.5px solid var(--border);
  color: var(--muted);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--border);
  color: var(--text);
}

/* Danger — rouge */
.btn-danger {
  background: var(--red-lt);
  border: 1.5px solid var(--red-md);
  color: var(--red);
}
.btn-danger:hover:not(:disabled) {
  background: var(--red);
  color: #fff;
  border-color: var(--red);
}

/* Warning — orange */
.btn-warn {
  background: var(--orange-lt);
  border: 1.5px solid var(--orange-bd);
  color: var(--orange);
}
.btn-warn:hover:not(:disabled) {
  background: var(--orange);
  color: #fff;
  border-color: var(--orange);
}

/* Success — vert */
.btn-success {
  background: var(--green-lt);
  border: 1.5px solid var(--green-md);
  color: var(--green);
}
.btn-success:hover:not(:disabled) {
  background: var(--green);
  color: #fff;
  border-color: var(--green);
}

/* Tailles */
.btn-sm { padding: 7px 14px; font-size: 12.5px; }
.btn-xs { padding: 4px 10px; font-size: 11.5px; border-radius: 6px; }

/* Bouton delete inline (tables) */
.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--red-lt);
  border: 1.5px solid var(--red-md);
  border-radius: 6px;
  padding: 4px 10px;
  color: var(--red);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: all .15s;
}
.btn-delete:hover {
  background: var(--red);
  color: #fff;
  border-color: var(--red);
}

.detail-secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  text-decoration: none;
  border: 1px solid #e2e8f0;
  background: #f1f5f9;
  color: #475569;
}

.detail-secondary-button:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.34rem;
  min-height: 40px;
  padding: 0.5rem 0.7rem;
  border-radius: 50px;
  border: 1px solid #d9e5ee;
  background: #fff;
  color: #334155;
  font-size: 0.76rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  border-color: #3a9282;
  color: #2f7a6e;
  background: #f7fcfb;
}

.action-button--danger {
  border-color: rgba(214, 73, 86, 0.28);
  color: #b4233b;
  background: #fff1f2;
}

.action-button--danger:hover:not(:disabled) {
  border-color: rgba(214, 73, 86, 0.34);
  background: #ffe4e8;
  color: #a71d33;
}

/* ================================================================
   COVER — bannière de l'événement
   ================================================================ */
.event-cover {
  height: 260px;
  background-size: cover;
  background-position: center;
  background-color: var(--teal-lt);
  position: relative;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 20, 18, 0.82) 0%,
    rgba(10, 20, 18, 0.45) 60%,
    rgba(10, 20, 18, 0.2) 100%
  );
  display: flex;
  align-items: flex-end;
  padding: 36px 48px;
}

.cover-content { width: 100%; }

.event-status-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: var(--r-pill);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: 12px;
  color: #fff;
  border: 1px solid rgba(255,255,255,.2);
}

.event-title {
  font-size: 30px;
  font-weight: 800;
  margin: 0 0 12px;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -.3px;
}

.event-meta {
  display: flex;
  gap: 20px;
  color: rgba(255,255,255,.85);
  font-size: 13px;
  flex-wrap: wrap;
}
.event-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ================================================================
   TABS
   ================================================================ */
.tabs {
  display: flex;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 32px;
  overflow-x: auto;
  gap: 0;
}

.tab {
  padding: 13px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--muted);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  font-family: inherit;
  margin-bottom: -1px;
}
.tab:hover { color: var(--text); background: var(--bg); }
.tab.active {
  color: var(--teal);
  border-bottom-color: var(--teal);
  background: var(--surface);
}

.tab .badge {
  background: var(--red);
  color: #fff;
  padding: 1px 7px;
  border-radius: var(--r-pill);
  font-size: 10.5px;
  font-weight: 700;
}

/* ================================================================
   TAB CONTENT
   ================================================================ */
.tab-content {
  padding: 32px;
  max-width: 1300px;
  margin: 0 auto;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
  flex-wrap: wrap;
}
.tab-header h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: var(--text);
}

.inline-loading {
  font-size: 13.5px;
  color: var(--muted);
  padding: 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ================================================================
   INFO TAB
   ================================================================ */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 22px 24px;
  box-shadow: var(--shadow);
}
.info-card h3 {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
}
.info-card p {
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text2);
  margin: 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}
.detail-row:last-child { border-bottom: none; }
.detail-row span {
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 600;
  flex-shrink: 0;
}
.detail-row strong {
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  text-align: right;
}

/* Capacité */
.capacity-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.capacity-stats .stat {
  flex: 1;
  min-width: 70px;
  background: var(--surface2);
  padding: 12px;
  border-radius: var(--r-sm);
  border: 1.5px solid var(--border);
  text-align: center;
}
.capacity-stats .stat span {
  display: block;
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.capacity-stats .stat strong {
  font-size: 22px;
  font-weight: 800;
  color: var(--teal);
}

.capacity-bar {
  height: 6px;
  background: var(--border);
  border-radius: var(--r-pill);
  overflow: hidden;
  margin-bottom: 14px;
}
.capacity-fill {
  height: 100%;
  background: var(--teal);
  border-radius: var(--r-pill);
  transition: width .5s ease;
}
.capacity-fill.fill-warn { background: var(--orange); }
.capacity-fill.fill-full { background: var(--red); }

.capacity-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
}

.capacity-actions { margin-top: 12px; }

.text-amber { color: var(--amber); font-weight: 700; }
.text-red   { color: var(--red);   font-weight: 700; }
.text-green { color: var(--green); font-weight: 700; }

/* ================================================================
   PARTICIPANTS TAB
   ================================================================ */
.participants-section { margin-bottom: 36px; }
.participants-section h4 {
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .06em;
}

/* ── Data Table ─────────────────────────────────────────────── */
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
  box-shadow: var(--shadow);
}
.data-table th {
  text-align: left;
  padding: 11px 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--muted);
  background: var(--surface2);
  border-bottom: 1.5px solid var(--border);
}
.data-table td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text2);
  font-size: 13.5px;
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: var(--teal-lt); }

.participant-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--text);
}

/* Avatar */
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--teal-lt);
  border: 2px solid var(--teal-md);
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--teal);
  flex-shrink: 0;
  text-transform: uppercase;
}
.avatar.pending {
  background: var(--orange-lt);
  border-color: var(--orange-bd);
  color: var(--orange);
}

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--r-pill);
  font-size: 11.5px;
  font-weight: 700;
}
.status-badge.confirmed {
  background: var(--green-lt);
  color: var(--green);
  border: 1px solid var(--green-md);
}

.inline-actions { display: flex; gap: 6px; }

/* ================================================================
   WAITLIST TAB
   ================================================================ */
.position {
  display: inline-flex;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--teal-lt);
  border: 1.5px solid var(--teal-md);
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--teal);
}

.badge-sm {
  display: inline-block;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  font-size: 11px;
  font-weight: 700;
  background: var(--surface2);
  border: 1px solid var(--border2);
  color: var(--muted);
}
.badge-sm.badge-ok {
  background: var(--green-lt);
  border-color: var(--green-md);
  color: var(--green);
}

/* ================================================================
   REVIEWS TAB
   ================================================================ */
.reviews-tab h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 20px;
  color: var(--text);
}

.reviews-list { display: flex; flex-direction: column; gap: 12px; }

.review-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 18px 20px;
  box-shadow: var(--shadow);
  transition: border-color .15s, box-shadow .15s;
}
.review-card:hover {
  border-color: var(--teal-md);
  box-shadow: var(--shadow-h);
}

.review-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 12px;
  flex-wrap: wrap;
}

.reviewer { display: flex; align-items: center; gap: 10px; }
.reviewer .name {
  font-weight: 700;
  font-size: 14px;
  color: var(--text);
}
.reviewer .date {
  font-size: 11px;
  color: var(--muted2);
  margin-top: 2px;
}

.rating { display: flex; align-items: center; gap: 3px; }
.rating span {
  color: var(--border2);
  font-size: 16px;
  line-height: 1;
}
.rating .star-filled { color: #f4c542; }
.rating-value {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--muted);
  margin-left: 4px;
}

.review-comment {
  font-size: 13.5px;
  color: var(--text2);
  line-height: 1.6;
  margin: 8px 0 0;
}

/* ================================================================
   WEATHER TAB
   ================================================================ */
.weather-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 36px;
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: var(--shadow);
}

.weather-header { margin-bottom: 24px; }
.weather-icon { font-size: 64px; display: block; margin-bottom: 10px; }
.weather-temp {
  font-size: 48px;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}
.weather-city {
  font-size: 15px;
  color: var(--muted);
  margin: 8px 0 4px;
}
.weather-desc {
  font-size: 13.5px;
  color: var(--teal);
  font-weight: 600;
}

.weather-details {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 22px;
  gap: 8px;
  flex-wrap: wrap;
}
.weather-details .detail { text-align: center; }
.weather-details .detail span {
  display: block;
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 5px;
  font-weight: 600;
}
.weather-details .detail strong {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
}

.recommendation {
  padding: 16px;
  border-radius: var(--r-sm);
}
.recommendation.outdoor {
  background: var(--green-lt);
  border: 1.5px solid var(--green-md);
}
.recommendation.indoor {
  background: var(--blue-lt);
  border: 1.5px solid #bfdbfe;
}
.rec-badge {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .05em;
  margin-bottom: 8px;
  color: var(--text);
}
.recommendation.outdoor .rec-badge { color: var(--green); }
.recommendation.indoor  .rec-badge { color: var(--blue); }
.recommendation p {
  font-size: 13px;
  margin: 0;
  color: var(--text2);
  line-height: 1.55;
}

/* ================================================================
   REMINDERS TAB
   ================================================================ */
.reminders-desc {
  font-size: 13.5px;
  color: var(--muted);
  margin-bottom: 24px;
  line-height: 1.55;
}

.reminders-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.reminder-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--r);
  padding: 16px 20px;
  box-shadow: var(--shadow);
  transition: border-color .15s;
}
.reminder-card:hover { border-color: var(--teal-md); }

.reminder-icon { font-size: 22px; flex-shrink: 0; }
.reminder-body { flex: 1; }
.reminder-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}
.reminder-desc {
  font-size: 11.5px;
  color: var(--muted);
  margin-top: 3px;
}

.warning-box {
  background: var(--orange-lt);
  border: 1.5px solid var(--orange-bd);
  border-radius: var(--r-sm);
  padding: 14px 18px;
  font-size: 13px;
  color: var(--orange);
  line-height: 1.5;
  font-weight: 500;
}

/* ================================================================
   EMPTY STATE
   ================================================================ */
.empty {
  text-align: center;
  padding: 48px 32px;
  color: var(--muted);
  font-size: 14px;
  background: var(--surface);
  border-radius: var(--r);
  border: 1.5px dashed var(--border2);
}

/* ================================================================
   LOADING & ERROR
   ================================================================ */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 18px;
  background: var(--bg);
  color: var(--muted);
  font-size: 14px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--teal);
  border-radius: 50%;
  animation: spin .75s linear infinite;
}

/* ================================================================
   TOAST
   ================================================================ */
.detail-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  border-radius: var(--r);
  font-size: 13.5px;
  font-weight: 600;
  z-index: 9999;
  box-shadow: var(--shadow-lg);
  border: 1.5px solid;
  animation: toastIn .3s cubic-bezier(.34,1.56,.64,1);
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(16px) scale(.96); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
.detail-toast--success {
  background: var(--green-lt);
  border-color: var(--green-md);
  color: var(--green);
}
.detail-toast--error {
  background: var(--red-lt);
  border-color: var(--red-md);
  color: var(--red);
}
.detail-toast--info {
  background: var(--blue-lt);
  border-color: #bfdbfe;
  color: var(--blue);
}
.detail-toast--warning {
  background: var(--orange-lt);
  border-color: var(--orange-bd);
  color: var(--orange);
}

/* ================================================================
   CONFIRM DIALOG
   ================================================================ */
.dialog-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.46);
  backdrop-filter: blur(5px);
  z-index: 1000;
  animation: backdrop-in 180ms ease-out;
}

.dialog-panel {
  width: min(31rem, 100%);
  border-radius: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.66);
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.78));
  box-shadow: 0 24px 60px -38px rgba(15, 23, 42, 0.7);
  padding: 1rem 1rem 0.95rem;
  animation: panel-in 220ms ease-out;
}

.dialog-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.72rem;
  border: 1px solid transparent;
}

.dialog-icon i {
  font-size: 1rem;
}

.dialog-icon--danger {
  background: rgba(239, 68, 68, 0.16);
  color: #b91c1c;
  border-color: rgba(185, 28, 28, 0.2);
}

.dialog-copy h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.05rem;
  line-height: 1.3;
}

.dialog-copy p {
  margin: 0.38rem 0 0;
  color: #475569;
  font-size: 0.88rem;
  line-height: 1.5;
}

.dialog-actions {
  margin-top: 0.92rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn--ghost {
  border-color: #d6deea;
  background: #fff;
  color: #334155;
}

.btn--confirm {
  color: #fff;
}

.btn--danger {
  background: linear-gradient(145deg, #ef4444, #dc2626);
  box-shadow: 0 12px 22px -16px rgba(220, 38, 38, 0.82);
}

@keyframes backdrop-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ================================================================
   RESPONSIVE
   ================================================================ */
@media (max-width: 900px) {
  .info-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;
  }
  .header-right { width: 100%; }
  .cover-overlay { padding: 24px 20px; }
  .event-title { font-size: 22px; }
  .event-meta { flex-direction: column; gap: 6px; }
  .tabs { padding: 0 16px; }
  .tab { padding: 11px 14px; font-size: 13px; }
  .tab-content { padding: 20px 16px; }
  .weather-card { padding: 24px; }
  .weather-temp { font-size: 38px; }
  .weather-details { flex-direction: column; gap: 14px; }
}

FILE: src/app/back-office/events/pages/detail/event-detail.component.html
FULL UPDATED HTML

<div class="event-detail" *ngIf="!loading && event; else loadingState">
  
  <!-- Header -->
  <div class="detail-header">
    <div class="header-left">
      <button class="btn-back" (click)="goBack()">
        <i class="fas fa-arrow-left"></i>
        Back to Events
      </button>
    </div>
    <div class="header-right">
      <button class="btn btn-outline" (click)="goToEdit()" *ngIf="canCancel()">
        <i class="fas fa-pen-to-square"></i>
        Edit Event
      </button>
      <button class="btn btn-danger" (click)="confirmCancel()" *ngIf="canCancel()">
        <i class="fas fa-circle-xmark"></i>
        Cancel Event
      </button>
      <button class="btn btn-danger" (click)="confirmDelete()">
        <i class="fas fa-trash-can"></i>
        Delete
      </button>
    </div>
  </div>

  <!-- Event Cover -->
  <div class="event-cover" [style.background-image]="event.coverImageUrl ? 'url(' + event.coverImageUrl + ')' : ''">
    <div class="cover-overlay">
      <div class="cover-content">
        <span class="event-status" [style.background]="statusColors[event.status]">
          {{ statusLabels[event.status] }}
        </span>
        <h1 class="event-title">{{ event.title }}</h1>
        <div class="event-meta">
          <span><i class="fas fa-calendar-day"></i> {{ formatDate(event.startDate) }} at {{ formatTime(event.startDate) }}</span>
          <span><i class="fas fa-map-location-dot"></i> {{ event.location }}</span>
          <span><i class="fas fa-users"></i> {{ event.maxParticipants }} seats</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="tabs">
    <button class="tab" [class.active]="activeTab === 'info'" (click)="setTab('info')">
      <i class="fas fa-circle-info"></i>
      Information
    </button>
    <button class="tab" [class.active]="activeTab === 'participants'" (click)="setTab('participants')">
      <i class="fas fa-users"></i>
      Participants
      <span class="badge" *ngIf="pendingList.length > 0">{{ pendingList.length }}</span>
    </button>
    <button class="tab" [class.active]="activeTab === 'waitlist'" (click)="setTab('waitlist')">
      <i class="fas fa-clock"></i>
      Waitlist
      <span class="badge" *ngIf="waitlist.length > 0">{{ waitlist.length }}</span>
    </button>
    <button class="tab" [class.active]="activeTab === 'reviews'" (click)="setTab('reviews')">
      <i class="fas fa-star"></i>
      Reviews
      <span class="badge" *ngIf="reviews.length > 0">{{ reviews.length }}</span>
    </button>
    <button class="tab" [class.active]="activeTab === 'weather'" (click)="setTab('weather')">
      <i class="fas fa-cloud-sun"></i>
      Weather
    </button>
     <!-- ✅ AJOUTER CET ONGLET -->
  <button class="tab" [class.active]="activeTab === 'virtual'" (click)="setTab('virtual')">
    <i class="fas fa-video"></i>
    Virtual Session
  </button>
  </div>

  <!-- Tab Content -->
  <div class="tab-content">
    
    <!-- Info Tab -->
    <div *ngIf="activeTab === 'info'" class="info-tab">
      <div class="info-grid">
        <div class="info-card">
          <h3>Description</h3>
          <p>{{ event.description || 'No description provided.' }}</p>
        </div>
        
        <div class="info-card">
          <h3>Details</h3>
          <div class="detail-row"><span>Category:</span><strong>{{ event.category.icon }} {{ event.category.name }}</strong>
</div>
          <div class="detail-row"><span>Location:</span><strong>{{ event.location }}</strong></div>
          <div class="detail-row"><span>Start Date:</span><strong>{{ formatDate(event.startDate) }} at {{ formatTime(event.startDate) }}</strong></div>
          <div class="detail-row"><span>End Date:</span><strong>{{ formatDate(event.endDate) }} at {{ formatTime(event.endDate) }}</strong></div>
          <div class="detail-row"><span>Capacity:</span><strong>{{ event.maxParticipants }} seats</strong></div>
          <div class="detail-row"><span>Created by:</span><strong>{{ event.organizerName }}</strong></div>
          <div class="detail-row"><span>Created at:</span><strong>{{ formatDate(event.createdAt) }}</strong></div>
        </div>
        
        <!-- Capacity Card -->
        <div class="info-card" *ngIf="capacityData || loadingCapacity">
          <h3>Capacity Status</h3>
          <div *ngIf="loadingCapacity">Loading...</div>
          <div *ngIf="!loadingCapacity && capacityData">
            <div class="capacity-stats">
              <div class="stat"><span>Confirmed:</span><strong>{{ capacityData.confirmedParticipants }}</strong></div>
              <div class="stat"><span>Remaining:</span><strong>{{ capacityData.remainingSlots }}</strong></div>
              <div class="stat"><span>Waitlist:</span><strong>{{ capacityData.waitlistCount }}</strong></div>
            </div>
            <div class="capacity-bar">
              <div class="capacity-fill" [style.width.%]="getFillRate()" 
                   [class.fill-warn]="getFillRate() >= 75"
                   [class.fill-full]="capacityData.isFull"></div>
            </div>
            <div class="capacity-actions">
              <button class="btn btn-sm btn-outline" (click)="recalculateCapacity()"><i class="fas fa-rotate-right"></i> Recalculate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Participants Tab -->
    <div *ngIf="activeTab === 'participants'" class="participants-tab">
      <div class="tab-header">
        <h3>Participants</h3>
        <button type="button" class="detail-secondary-button" (click)="exportParticipants()" [disabled]="exporting">
          <i class="fas fa-file-excel"></i>
          Export CSV
        </button>
      </div>
      
      <div *ngIf="loadingParticipants">Loading...</div>
      
      <!-- Confirmed Participants -->
      <div class="participants-section">
        <h4>Confirmed ({{ participants.length }})</h4>
        <div *ngIf="participants.length === 0" class="empty">No confirmed participants.</div>
        <table class="data-table" *ngIf="participants.length > 0">
          <thead>
            <tr><th>Participant</th><th>Seats</th><th>Registered on</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of participants">
              <td><div class="participant-cell"><div class="avatar">{{ p.userName.charAt(0) }}</div>{{ p.userName }}</div></td>
              <td>{{ p.numberOfSeats }} seat{{ p.numberOfSeats > 1 ? 's' : '' }}</td>
              <td>{{ formatDate(p.registeredAt) }}</td>
              <td><span class="status-badge confirmed"><i class="fas fa-circle-check"></i> Confirmed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pending Participants -->
      <div class="participants-section">
        <h4>Pending Approval ({{ pendingList.length }})</h4>
        <div *ngIf="pendingList.length === 0" class="empty">No pending registrations.</div>
        <table class="data-table" *ngIf="pendingList.length > 0">
          <thead>
            <tr><th>Participant</th><th>Seats</th><th>Registered on</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of pendingList">
              <td><div class="participant-cell"><div class="avatar pending">{{ p.userName.charAt(0) }}</div>{{ p.userName }}</div></td>
              <td>{{ p.numberOfSeats }} seat{{ p.numberOfSeats > 1 ? 's' : '' }}</td>
              <td>{{ formatDate(p.registeredAt) }}</td>
              <td>
                <button class="btn btn-xs btn-success" (click)="approveParticipant(p)">Approve</button>
                <button class="btn btn-xs btn-danger" (click)="rejectParticipant(p)">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Waitlist Tab -->
    <div *ngIf="activeTab === 'waitlist'" class="waitlist-tab">
      <div class="tab-header">
        <h3>Waitlist ({{ waitlist.length }})</h3>
        <button class="btn btn-sm btn-primary" (click)="promoteNext()" *ngIf="waitlist.length > 0">
          <i class="fas fa-arrow-up"></i>
          Promote Next
        </button>
      </div>
      
      <div *ngIf="loadingWaitlist">Loading...</div>
      <div *ngIf="waitlist.length === 0 && !loadingWaitlist" class="empty">Waitlist is empty.</div>
      
      <table class="data-table" *ngIf="waitlist.length > 0">
        <thead>
          <tr><th>#</th><th>User</th><th>Seats</th><th>People Ahead</th><th>Joined</th><th>Notified</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let w of waitlist">
            <td><span class="position">{{ w.position }}</span></td>
            <td><div class="participant-cell"><div class="avatar">{{ w.userName.charAt(0) }}</div>{{ w.userName }}</div></td>
            <td>{{ w.numberOfSeats }} seat{{ w.numberOfSeats > 1 ? 's' : '' }}</td>
            <td>{{ w.peopleAhead }} person{{ w.peopleAhead > 1 ? 's' : '' }}</td>
            <td>{{ formatDate(w.joinedAt) }}</td>
            <td><span class="badge" [class.success]="w.notified">{{ w.notified ? 'Yes' : '—' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reviews Tab -->
    <div *ngIf="activeTab === 'reviews'" class="reviews-tab">
      <h3>Reviews & Ratings ({{ reviews.length }})</h3>
      
      <div *ngIf="loadingReviews">Loading...</div>
      <div *ngIf="reviews.length === 0 && !loadingReviews" class="empty">No reviews yet.</div>
      
      <div class="reviews-list" *ngIf="reviews.length > 0">
        <div *ngFor="let r of reviews" class="review-card">
          <div class="review-header">
            <div class="reviewer">
              <div class="avatar">{{ r.userName.charAt(0) }}</div>
              <div>
                <div class="name">{{ r.userName }}</div>
                <div class="date">{{ formatDate(r.createdAt) }}</div>
              </div>
            </div>
            <div class="rating">
              <span *ngFor="let s of starsArray(r.rating)" [class.star-filled]="s <= r.rating">★</span>
              <span class="rating-value">{{ r.rating }}/5</span>
            </div>
            <button type="button" class="action-button action-button--danger" (click)="deleteReview(r.id)"><i class="fas fa-trash-can"></i> Delete</button>
          </div>
          <p class="review-comment" *ngIf="r.comment">{{ r.comment }}</p>
        </div>
      </div>
    </div>

    <!-- Weather Tab -->
    <div *ngIf="activeTab === 'weather'" class="weather-tab">
      <div *ngIf="loadingWeather">Loading weather data...</div>
      
      <div *ngIf="!loadingWeather && weather" class="weather-card">
        <div class="weather-header">
          <span class="weather-icon">{{ weatherIcons[weather.condition] }}</span>
          <div class="weather-temp">{{ weather.temperature }}°C</div>
          <div class="weather-city">{{ weather.city }}</div>
          <div class="weather-desc">{{ weather.description | titlecase }}</div>
        </div>
        
        <div class="weather-details">
          <div class="detail"><span><i class="fas fa-droplet"></i> Humidity:</span><strong>{{ weather.humidity }}%</strong></div>
          <div class="detail"><span><i class="fas fa-wind"></i> Wind:</span><strong>{{ weather.windSpeed }} km/h</strong></div>
          <div class="detail"><span><i class="fas fa-bullseye"></i> Condition:</span><strong>{{ weather.condition }}</strong></div>
          <div class="detail"><span><i class="fas fa-calendar-day"></i> Event day:</span><strong [class.text-green]="weather.eventDay">{{ weather.eventDay ? 'Yes' : 'No' }}</strong></div>
        </div>
        
        <div class="recommendation" [class.outdoor]="weather.recommendation === 'OUTDOOR'" [class.indoor]="weather.recommendation === 'INDOOR'">
          <div class="rec-badge">{{ weather.recommendation === 'OUTDOOR' ? 'OUTDOOR' : 'INDOOR' }}</div>
          <p>{{ weather.recommendationMsg }}</p>
        </div>
      </div>
    </div>
<div *ngIf="activeTab === 'virtual'" class="virtual-tab">
  <app-admin-virtual-session 
    [eventId]="event!.id" 
    [adminId]="getAdminId()">   <!-- ✅ utiliser la méthode -->
  </app-admin-virtual-session>
</div>
  </div>

  <!-- Confirm Dialog -->
  <div class="dialog-backdrop" *ngIf="showConfirmDialog" (click)="closeConfirm()">
    <section class="dialog-panel" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
      <div class="dialog-icon dialog-icon--danger">
        <i class="fas fa-triangle-exclamation"></i>
      </div>
      <div class="dialog-copy">
        <h3>{{ confirmAction?.title }}</h3>
        <p>{{ confirmAction?.message }}</p>
      </div>
      <footer class="dialog-actions">
        <button type="button" class="btn btn--ghost" (click)="closeConfirm()">Cancel</button>
        <button type="button" class="btn btn--confirm btn--danger" (click)="confirmAction?.action()">{{ confirmAction?.title === 'Delete Event' ? 'Delete' : 'Cancel Event' }}</button>
      </footer>
    </section>
  </div>

</div>

<ng-template #loadingState>
  <div class="loading-state">
    <div class="spinner"></div>
    <span>Loading event details...</span>
  </div>
</ng-template>

DIFF TABLE
| Element | Old (Events) | New (Transit-matched) |
| --- | --- | --- |
| Export CSV button | btn btn-sm btn-outline + fa-file-excel | detail-secondary-button + fa-file-excel |
| Delete confirmation dialog | confirm-overlay/confirm-dialog custom block | dialog-backdrop/dialog-panel Transit dialog structure |
| Review delete action | btn-delete icon-only | action-button action-button--danger + fa-trash-can label |

FILE: src/app/back-office/events/pages/form/admin-event-form.component.css
FULL UPDATED SCSS/CSS
/* admin-event-form.component.css — VERSION COMPLÈTE */

:host {
  --green-50:  #f0faf4;
  --green-100: #dcf5e7;
  --green-200: #b8eacf;
  --green-400: #4ebe80;
  --green-500: #3a9282;
  --green-600: #2f7a6e;
  --green-700: #265f56;

  --amber-50:  #fffbeb;
  --amber-100: #fef3c7;
  --amber-400: #fbbf24;
  --amber-600: #d97706;

  --red-50:    #fef2f2;
  --red-500:   #ef4444;
  --red-600:   #dc2626;

  --blue-50:   #eff6ff;
  --blue-200:  #bfdbfe;
  --blue-500:  #3b82f6;

  --purple-50: #faf5ff;
  --purple-200:#e9d5ff;
  --purple-600:#9333ea;

  --grey-50:   #f8fafc;
  --grey-100:  #f1f5f9;
  --grey-200:  #e2e8f0;
  --grey-300:  #cbd5e1;
  --grey-400:  #94a3b8;
  --grey-500:  #64748b;
  --grey-700:  #334155;
  --grey-900:  #0f172a;

  --bg:        #f8fafc;
  --surface:   #ffffff;
  --border:    #dde7ef;

  --shadow-sm: 0 4px 20px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 12px 28px rgba(15, 23, 42, 0.1);
  --shadow-lg: 0 24px 60px -38px rgba(15, 23, 42, 0.7);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;

  --font: inherit;
  --mono: inherit;

  display: block;
  background: var(--bg);
  min-height: 100vh;
  font-family: var(--font);
  color: var(--grey-900);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Shell wrapper ─────────────────────────────────────────── */
.aef-shell {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

/* ══════════════════════════════════════════════════════════
   TOPBAR
══════════════════════════════════════════════════════════ */
.aef-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0 14px;
  border-bottom: 1.5px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 50;
}

.aef-topbar__left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.aef-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-family: var(--font);
  font-size: 13px;
  font-weight: 500;
  color: var(--grey-700);
  cursor: pointer;
  text-decoration: none;
  transition: border-color .15s, background .15s;
}

.aef-back-btn:hover { border-color: var(--green-500); background: var(--green-50); }
.aef-topbar__sep { color: var(--grey-300); }
.aef-topbar__title { font-weight: 600; color: var(--grey-900); }

/* ══════════════════════════════════════════════════════════
   STEPPER
══════════════════════════════════════════════════════════ */
.aef-stepper {
  padding: 32px 0 24px;
}

.aef-stepper__track {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.aef-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  position: relative;
}

.aef-step__bubble {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid var(--grey-300);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--grey-400);
  flex-shrink: 0;
  transition: border-color .2s, background .2s, color .2s;
  z-index: 1;
}

.aef-step--active .aef-step__bubble {
  border-color: var(--green-500);
  background: var(--green-500);
  color: #fff;
  box-shadow: 0 0 0 4px var(--green-100);
}

.aef-step--done .aef-step__bubble {
  border-color: var(--green-500);
  background: var(--green-50);
  color: var(--green-600);
}

.aef-step__label { padding-top: 6px; }

.aef-step__name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--grey-400);
  transition: color .2s;
}

.aef-step--active .aef-step__name,
.aef-step--done .aef-step__name { color: var(--grey-900); }

.aef-step__sub {
  display: block;
  font-size: 11px;
  color: var(--grey-400);
  margin-top: 1px;
}

.aef-step__connector {
  flex: 1;
  height: 2px;
  background: var(--grey-200);
  margin-top: 16px;
  margin-left: -8px;
  margin-right: 4px;
  border-radius: 1px;
  transition: background .2s;
}

.aef-step--done + .aef-step .aef-step__connector,
.aef-step--done .aef-step__connector { background: var(--green-400); }

/* ══════════════════════════════════════════════════════════
   ALERTS
══════════════════════════════════════════════════════════ */
.aef-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.aef-alert--error   { background: var(--red-50); color: var(--red-600); border: 1.5px solid #fecaca; }
.aef-alert--success { background: var(--green-50); color: var(--green-700); border: 1.5px solid var(--green-200); }

/* ══════════════════════════════════════════════════════════
   PANEL
══════════════════════════════════════════════════════════ */
.aef-panel {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 20px;
  animation: panelIn .2s ease;
}

@keyframes panelIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.aef-panel__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 28px 18px;
  border-bottom: 1.5px solid var(--border);
  background: var(--grey-50);
}

.aef-panel__icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.aef-panel__icon--blue   { background: var(--blue-50);   border: 1.5px solid var(--blue-200);   color: var(--blue-500); }
.aef-panel__icon--amber  { background: var(--amber-50);  border: 1.5px solid var(--amber-100);  color: var(--amber-600); }
.aef-panel__icon--green  { background: var(--green-50);  border: 1.5px solid var(--green-200);  color: var(--green-600); }
.aef-panel__icon--purple { background: var(--purple-50); border: 1.5px solid var(--purple-200); color: var(--purple-600); }
.aef-panel__icon--grey   { background: var(--grey-100);  border: 1.5px solid var(--grey-200);   color: var(--grey-500); }

.aef-panel__title { font-size: 17px; font-weight: 700; color: var(--grey-900); letter-spacing: -.3px; }
.aef-panel__sub   { font-size: 13px; color: var(--grey-500); margin-top: 2px; }

.aef-form-body { padding: 28px; }

/* ══════════════════════════════════════════════════════════
   FORM GRID & FIELDS
══════════════════════════════════════════════════════════ */
.aef-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.aef-field { display: flex; flex-direction: column; gap: 6px; }
.aef-field--full { grid-column: 1 / -1; }

.aef-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--grey-700);
  display: flex;
  align-items: center;
  gap: 4px;
}

.aef-required { color: var(--red-500); }
.aef-field__hint {
  font-size: 11px;
  font-weight: 400;
  color: var(--grey-400);
  margin-top: 4px;
}

.aef-field__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.aef-input, .aef-select, .aef-textarea {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-family: var(--font);
  font-size: 14px;
  color: var(--grey-900);
  background: var(--grey-50);
  outline: none;
  transition: border-color .15s, background .15s, box-shadow .15s;
}

.aef-input  { height: 40px; padding: 0 12px; }
.aef-textarea { padding: 12px; resize: vertical; min-height: 120px; }
.aef-select { height: 40px; padding: 0 36px 0 12px; appearance: none; cursor: pointer; }

.aef-input:focus,
.aef-textarea:focus,
.aef-select:focus {
  border-color: var(--green-500);
  background: #fff;
  box-shadow: 0 0 0 3px var(--green-100);
}

.aef-input--error, .aef-textarea--error, .aef-select--error {
  border-color: var(--red-500);
}

.aef-error-msg { font-size: 12px; color: var(--red-500); font-weight: 500; }
.aef-char-count { font-size: 11px; color: var(--grey-400); }

/* Select wrapper */
.aef-select-wrap { position: relative; }

.aef-select-icon {
  position: absolute;
  right: 12px; top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--grey-400);
}

/* Input with icon */
.aef-input-with-icon { position: relative; display: flex; align-items: center; }
.aef-input-with-icon svg {
  position: absolute; left: 12px;
  color: var(--grey-400); pointer-events: none;
}
.aef-input--icon { padding-left: 36px; }

/* ── FORMAT TOGGLE (nouveau) ────────────────────────────────────── */
.aef-format-toggle-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
}

.aef-format-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
  cursor: pointer;
  transition: all .2s ease;
  position: relative;
}

.aef-format-card:hover {
  border-color: var(--green-400);
  background: var(--green-50);
}

.aef-format-card--active {
  border-color: var(--green-500);
  background: var(--green-50);
  box-shadow: 0 0 0 3px var(--green-100);
}

.aef-format-card__icon {
  font-size: 28px;
  flex-shrink: 0;
}

.aef-format-card__info {
  flex: 1;
}

.aef-format-card__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--grey-900);
  margin-bottom: 2px;
}

.aef-format-card__desc {
  font-size: 11px;
  color: var(--grey-500);
}

.aef-format-card__radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--grey-300);
  border-radius: 50%;
  background: var(--surface);
  transition: all .2s;
  flex-shrink: 0;
}

.aef-format-card__radio--on {
  border-color: var(--green-500);
  background: var(--green-500);
  box-shadow: inset 0 0 0 3px var(--surface);
}

/* ── Category badge ────────────────────────────────────── */
.aef-cat-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  font-size: 13px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.aef-cat-badge__icon { font-size: 16px; }
.aef-cat-badge__name { font-weight: 600; color: var(--green-700); }

.aef-cat-badge__pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.aef-cat-badge__pill--warn  { background: var(--amber-50); color: var(--amber-600); border: 1px solid var(--amber-100); }
.aef-cat-badge__pill--green { background: var(--green-100); color: var(--green-700); }

.aef-cat-badge__rules {
  font-size: 11px;
  color: var(--green-600);
  background: var(--green-100);
  padding: 2px 8px;
  border-radius: 20px;
  margin-left: auto;
}

/* ── Upload zone ───────────────────────────────────────── */
.aef-upload-zone {
  width: 100%;
  min-height: 160px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: border-color .15s, background .15s;
  background: var(--grey-50);
}

.aef-upload-zone:hover { border-color: var(--green-400); background: var(--green-50); }
.aef-upload-zone--has-image { border-style: solid; border-color: var(--green-200); }

.aef-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--grey-400);
  font-size: 13px;
}

.aef-upload-hint { font-size: 11px; color: var(--grey-300); }

.aef-upload-preview {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.aef-upload-remove {
  position: absolute;
  top: 8px; right: 8px;
  width: 28px; height: 28px;
  background: rgba(0,0,0,.55);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}

.aef-upload-remove:hover { background: rgba(0,0,0,.75); }
.aef-hidden { display: none; }

.aef-upload-btn {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 6px;
  padding: 6px 14px;
  border: 1.5px solid var(--green-500);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font); font-size: 12px; font-weight: 500;
  color: var(--green-600);
  cursor: pointer;
  transition: background .12s;
}

.aef-upload-btn:hover { background: var(--green-50); }

.aef-uploading {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--grey-500);
  margin-top: 6px;
}

/* ── Duration chip ─────────────────────────────────────── */
.aef-info-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--green-700);
  height: 40px;
}

/* ── Weather card ──────────────────────────────────────── */
.aef-weather-card {
  margin-top: 20px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
}

.aef-weather-card__header {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: var(--grey-50);
  border-bottom: 1px solid var(--border);
  font-size: 12px; font-weight: 600; color: var(--grey-700);
}

.aef-weather-card__body { padding: 14px 16px; }

.aef-weather-row {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
}

.aef-weather-icon { font-size: 28px; }
.aef-weather-temp { font-size: 22px; font-weight: 700; color: var(--grey-900); }
.aef-weather-desc { font-size: 14px; color: var(--grey-500); flex: 1; }

.aef-weather-pill {
  font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 20px;
}

.aef-weather-pill--outdoor { background: var(--green-100); color: var(--green-700); }
.aef-weather-pill--indoor  { background: var(--blue-50); color: var(--blue-500); }

/* ══════════════════════════════════════════════════════════
   VIRTUAL SESSION (nouveau)
══════════════════════════════════════════════════════════ */
.aef-online-skip {
  text-align: center;
  padding: 48px 24px;
  color: var(--grey-500);
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  background: var(--grey-50);
}

.aef-online-skip__icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.aef-online-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--blue-50);
  border: 1.5px solid var(--blue-200);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--blue-700);
  margin-bottom: 24px;
}

.aef-slider-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.aef-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--grey-200);
  outline: none;
  -webkit-appearance: none;
}

.aef-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--green-500);
  cursor: pointer;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}

.aef-slider::-webkit-slider-thumb:hover {
  background: var(--green-600);
  transform: scale(1.1);
}

.aef-slider-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--green-700);
  background: var(--green-100);
  padding: 4px 12px;
  border-radius: var(--radius-md);
  min-width: 70px;
  text-align: center;
}

.aef-virtual-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 24px;
  padding: 20px;
  background: var(--grey-50);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
}

.aef-virtual-summary__item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.aef-virtual-summary__icon {
  font-size: 24px;
}

.aef-virtual-summary__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--grey-500);
}

.aef-virtual-summary__val {
  font-size: 14px;
  font-weight: 600;
  color: var(--grey-900);
  margin-top: 2px;
}

.aef-creating-session {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  color: var(--green-700);
  font-size: 13px;
  font-weight: 500;
}

.aef-session-created {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  color: var(--green-700);
  font-size: 13px;
  text-align: center;
}

/* ══════════════════════════════════════════════════════════
   RULES STEP
══════════════════════════════════════════════════════════ */
.aef-rules-banner {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 16px;
  background: var(--green-50);
  border: 1.5px solid var(--green-200);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--green-700);
  line-height: 1.6;
  margin-bottom: 24px;
}

.aef-rules-banner svg { flex-shrink: 0; margin-top: 2px; }

.aef-rules-banner__blocking {
  background: #fee2e2;
  color: var(--red-600);
  padding: 0 5px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.aef-rules-empty-state {
  text-align: center;
  padding: 48px;
  color: var(--grey-400);
  font-size: 14px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}

.aef-rules-section { margin-bottom: 28px; }

.aef-rules-section__hd {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}

.aef-rules-section__title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: var(--grey-900);
  flex-wrap: wrap;
}

.aef-rules-section__scope {
  font-size: 11px; font-weight: 400;
  background: var(--grey-100);
  color: var(--grey-500);
  padding: 2px 8px;
  border-radius: 20px;
}

.aef-rules-count {
  font-size: 11px; font-weight: 700;
  background: var(--green-100); color: var(--green-700);
  padding: 2px 10px; border-radius: 20px;
}

.aef-add-rule-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px;
  border: 1.5px solid var(--green-500);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font); font-size: 12px; font-weight: 600;
  color: var(--green-600);
  cursor: pointer;
  transition: background .12s;
}

.aef-add-rule-btn:hover { background: var(--green-50); }

/* Rule rows */
.aef-rule-list { display: flex; flex-direction: column; gap: 6px; }

.aef-rule-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: var(--grey-50);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color .12s;
}

.aef-rule-row:hover { border-color: var(--green-300); }

.aef-rule-row--inherited {
  background: linear-gradient(90deg, var(--green-50), var(--grey-50));
  border-left: 3px solid var(--green-400);
}

.aef-rule-row__left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }

.aef-rule-criteria {
  font-size: 13px; font-weight: 500; color: var(--grey-800);
  font-family: var(--mono);
}

.aef-rule-value {
  font-size: 12px; color: var(--grey-600);
  flex: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.aef-rule-row__right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.aef-rule-badge {
  font-size: 10px; font-weight: 700;
  padding: 2px 8px; border-radius: 20px;
  text-transform: uppercase; letter-spacing: .5px;
  flex-shrink: 0;
}

.aef-rule-badge--blocking { background: #fee2e2; color: var(--red-600); }
.aef-rule-badge--warning  { background: var(--amber-50); color: var(--amber-600); }

.aef-rule-values { display: flex; flex-wrap: wrap; gap: 4px; }

.aef-rule-chip {
  font-size: 11px; font-weight: 500;
  background: var(--green-100);
  color: var(--green-700);
  padding: 2px 7px;
  border-radius: 20px;
  font-family: var(--mono);
}

.aef-rule-number, .aef-rule-boolean {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--grey-700);
}

.aef-rule-priority {
  font-size: 10px; font-weight: 700;
  background: var(--grey-100); color: var(--grey-500);
  padding: 1px 6px; border-radius: 4px;
  font-family: var(--mono);
}

.aef-rule-inherited-badge {
  font-size: 10px; font-weight: 600;
  background: var(--green-50); color: var(--green-600);
  padding: 2px 7px; border-radius: 20px;
  border: 1px solid var(--green-200);
}

.aef-rule-delete {
  width: 28px; height: 28px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--grey-400);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: border-color .12s, color .12s, background .12s;
}

.aef-rule-delete:hover { border-color: var(--red-500); color: var(--red-500); background: var(--red-50); }

/* Empty rules */
.aef-rules-empty {
  font-size: 13px; color: var(--grey-400);
  padding: 16px 0;
  font-style: italic;
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}

.aef-rules-empty__hint { color: var(--grey-300); }

.aef-rules-empty__link {
  color: var(--green-600); text-decoration: none; font-weight: 600;
}

.aef-rules-empty__link:hover { text-decoration: underline; }

/* Add rule inline form */
.aef-add-rule-form {
  border: 1.5px solid var(--green-300);
  border-radius: var(--radius-lg);
  background: var(--green-50);
  overflow: hidden;
  margin-bottom: 14px;
  animation: panelIn .18s ease;
}

.aef-add-rule-form__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px;
  background: var(--green-100);
  font-size: 13px; font-weight: 600; color: var(--green-700);
  border-bottom: 1px solid var(--green-200);
}

.aef-add-rule-form__close {
  background: none; border: none;
  font-size: 16px; color: var(--green-600);
  cursor: pointer;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm);
}

.aef-add-rule-form__close:hover { background: var(--green-200); }

.aef-rule-form-grid { padding: 18px; display: flex; flex-direction: column; gap: 16px; }

.aef-add-rule-form__footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid var(--green-200);
  background: var(--surface);
}

/* Criteria chips grid */
.aef-criteria-grid {
  display: flex; flex-wrap: wrap; gap: 8px;
}

.aef-criteria-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-family: var(--font); font-size: 12px; font-weight: 500;
  color: var(--grey-700);
  cursor: pointer;
  transition: border-color .12s, background .12s, color .12s;
}

.aef-criteria-chip:hover { border-color: var(--green-400); background: var(--green-50); color: var(--green-700); }

.aef-criteria-chip--active {
  border-color: var(--green-500);
  background: var(--green-100);
  color: var(--green-700);
}

.aef-criteria-chip__icon { font-size: 14px; }

.aef-criteria-chip__type {
  font-size: 10px; font-weight: 700;
  color: var(--grey-400);
  background: var(--grey-100);
  padding: 1px 5px; border-radius: 4px;
  font-family: var(--mono);
}

.aef-criteria-chip--active .aef-criteria-chip__type {
  background: var(--green-200); color: var(--green-700);
}

/* Tag preview */
.aef-tag-preview { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }

/* Number input */
.aef-number-input { display: flex; align-items: center; gap: 10px; }
.aef-number-unit { font-size: 13px; color: var(--grey-500); }

/* Boolean toggle */
.aef-boolean-toggle { padding: 8px 0; }

.aef-toggle-label {
  display: inline-flex; align-items: center; gap: 10px;
  cursor: pointer; font-size: 14px; color: var(--grey-700);
  user-select: none;
}

.aef-toggle-label input { display: none; }

.aef-toggle-track {
  width: 40px; height: 22px;
  background: var(--grey-300);
  border-radius: 11px;
  position: relative;
  transition: background .2s;
  flex-shrink: 0;
}

.aef-toggle-label input:checked + .aef-toggle-track { background: var(--green-500); }

.aef-toggle-knob {
  width: 16px; height: 16px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 3px; left: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
  transition: left .2s;
}

.aef-toggle-label input:checked + .aef-toggle-track .aef-toggle-knob { left: 21px; }

/* Rule type toggle */
.aef-rule-type-row { display: flex; gap: 8px; }

.aef-rule-type-btn {
  flex: 1; height: 38px;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-family: var(--font); font-size: 13px; font-weight: 500;
  color: var(--grey-600);
  cursor: pointer;
  transition: border-color .12s, background .12s, color .12s;
}

.aef-rule-type-btn--blocking {
  border-color: var(--red-500); background: var(--red-50); color: var(--red-600);
}

.aef-rule-type-btn--warning {
  border-color: var(--amber-400); background: var(--amber-50); color: var(--amber-600);
}

/* Rules summary chips */
.aef-rules-summary {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.aef-rules-summary__chip {
  font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 20px;
}

.aef-rules-summary__chip--total    { background: var(--grey-100); color: var(--grey-700); }
.aef-rules-summary__chip--blocking { background: #fee2e2; color: var(--red-600); }
.aef-rules-summary__chip--warning  { background: var(--amber-50); color: var(--amber-600); }

/* ══════════════════════════════════════════════════════════
   RECAP STEP
══════════════════════════════════════════════════════════ */
.aef-recap { display: flex; flex-direction: column; gap: 24px; }

.aef-recap-card {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.aef-recap-card__cover {
  height: 140px;
  background: var(--grey-100);
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex; align-items: flex-end;
}

.aef-recap-card__cover-placeholder {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 6px;
  color: var(--grey-400);
  font-size: 13px;
}

.aef-recap-card__cat {
  position: absolute; top: 12px; left: 14px;
  background: rgba(255,255,255,.9);
  border-radius: var(--radius-sm);
  padding: 3px 10px;
  font-size: 12px; font-weight: 600;
  color: var(--grey-700);
  backdrop-filter: blur(4px);
}

.aef-recap-card__body { padding: 16px 18px; }

.aef-recap-card__title { font-size: 17px; font-weight: 700; color: var(--grey-900); margin-bottom: 6px; }
.aef-recap-card__desc  { font-size: 13px; color: var(--grey-500); line-height: 1.6; }

.aef-recap-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.aef-recap-block {
  background: var(--grey-50);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.aef-recap-block__label {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--grey-400);
  margin-bottom: 5px;
}

.aef-recap-block__val {
  font-size: 14px; font-weight: 600; color: var(--grey-900);
  line-height: 1.4;
}

.aef-recap-rules {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.aef-recap-rules__title {
  padding: 10px 16px;
  background: var(--grey-50);
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--grey-500);
  border-bottom: 1px solid var(--border);
}

.aef-recap-rules .aef-rule-row { margin: 8px 16px; }

.aef-recap-warnings {
  background: var(--amber-50);
  border: 1.5px solid var(--amber-100);
  border-radius: var(--radius-md);
  padding: 14px 16px;
}

.aef-recap-warnings__title {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 700;
  color: var(--amber-600);
  margin-bottom: 8px;
}

.aef-recap-warnings__list {
  list-style: none;
  display: flex; flex-direction: column; gap: 4px;
}

.aef-recap-warnings__list li {
  font-size: 13px; color: #92400e;
  padding-left: 14px;
  position: relative;
}

.aef-recap-warnings__list li::before {
  content: "·";
  position: absolute; left: 0;
  font-weight: 900;
}

/* ══════════════════════════════════════════════════════════
   FOOTER NAVIGATION
══════════════════════════════════════════════════════════ */
.aef-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  position: sticky;
  bottom: 16px;
  backdrop-filter: blur(8px);
  background: rgba(255,255,255,.95);
}

.aef-footer__right { display: flex; align-items: center; gap: 12px; }
.aef-step-indicator { font-size: 12px; color: var(--grey-400); font-weight: 500; }

.aef-btn-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 16px; height: 40px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font); font-size: 14px; font-weight: 500;
  color: var(--grey-500);
  cursor: pointer;
  transition: border-color .15s;
}

.aef-btn-ghost:hover { border-color: var(--grey-400); color: var(--grey-700); }

.aef-btn-next {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 20px; height: 40px;
  border: 1.5px solid var(--green-500);
  border-radius: var(--radius-md);
  background: transparent;
  font-family: var(--font); font-size: 14px; font-weight: 600;
  color: var(--green-600);
  cursor: pointer;
  transition: background .15s;
}

.aef-btn-next:hover { background: var(--green-50); }

.aef-btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 16px; height: 36px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--green-500);
  font-family: var(--font); font-size: 13px; font-weight: 600;
  color: #fff; cursor: pointer;
  transition: background .15s;
}

.aef-btn-primary:hover { background: var(--green-600); }
.aef-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

.aef-btn-submit {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 0 24px; height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--green-500);
  font-family: var(--font); font-size: 14px; font-weight: 700;
  color: #fff; cursor: pointer;
  transition: background .15s, transform .1s;
  box-shadow: 0 2px 8px rgba(29,158,117,.35);
}

.aef-btn-submit:hover:not(:disabled) { background: var(--green-600); }
.aef-btn-submit:active:not(:disabled) { transform: scale(.97); }
.aef-btn-submit:disabled { opacity: .55; cursor: not-allowed; }

/* ── Spinner ───────────────────────────────────────────── */
.aef-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(29,158,117,.3);
  border-top-color: var(--green-500);
  border-radius: 50%;
  animation: spin .7s linear infinite;
  flex-shrink: 0;
}

.aef-spinner--white {
  border-color: rgba(255,255,255,.3);
  border-top-color: #fff;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ══════════════════════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  .aef-shell { padding: 0 14px 80px; }
  .aef-grid { grid-template-columns: 1fr; }
  .aef-format-toggle-group { grid-template-columns: 1fr; }
  .aef-stepper__track { gap: 2px; }
  .aef-step__label { display: none; }
  .aef-step--active .aef-step__label { display: block; }
  .aef-recap-grid { grid-template-columns: 1fr 1fr; }
  .aef-virtual-summary { grid-template-columns: 1fr; }
  .aef-footer { flex-direction: column; gap: 10px; padding: 14px 18px; }
  .aef-footer__right { width: 100%; justify-content: flex-end; }
  .aef-criteria-grid { gap: 6px; }
}

FILE: src/app/back-office/events/pages/form/admin-event-form.component.html
FULL UPDATED HTML

<div class="aef-shell">

  <header class="aef-topbar">
    <div class="aef-topbar__left">
      <button class="aef-back-btn" routerLink="/admin/events">
        <i class="fas fa-arrow-left" aria-hidden="true"></i>
        Events
      </button>
      <span class="aef-topbar__sep">/</span>
      <span class="aef-topbar__title">{{ isEdit ? 'Edit event' : 'New event' }}</span>
    </div>
  </header>

  <!-- STEPPER -->
  <div class="aef-stepper">
    <div class="aef-stepper__track">
      <div *ngFor="let step of steps; let i = index" class="aef-step"
        [class.aef-step--active]="currentStep === i"
        [class.aef-step--done]="currentStep > i"
        (click)="goToStep(i)">
        <div class="aef-step__bubble">
          <i *ngIf="currentStep > i" class="fas fa-circle-check" aria-hidden="true"></i>
          <span *ngIf="currentStep <= i">{{ i + 1 }}</span>
        </div>
        <div class="aef-step__label">
          <span class="aef-step__name">{{ step.label }}</span>
          <span class="aef-step__sub">{{ step.sub }}</span>
        </div>
        <div class="aef-step__connector" *ngIf="i < steps.length - 1"></div>
      </div>
    </div>
  </div>

  <div class="aef-alert aef-alert--error" *ngIf="error">{{ error }}</div>
  <div class="aef-alert aef-alert--success" *ngIf="success">{{ success }}</div>

  <!-- ══ STEP 1 : Informations générales ══════════════════════════ -->
  <div class="aef-panel" *ngIf="currentStep === 0">
    <div class="aef-panel__header">
      <div class="aef-panel__icon aef-panel__icon--blue">
        <i class="fas fa-file-lines" aria-hidden="true"></i>
      </div>
      <div>
        <h2 class="aef-panel__title">General information</h2>
        <p class="aef-panel__sub">Basic details visible to all users</p>
      </div>
    </div>
    <div class="aef-form-body">
      <div class="aef-grid">

        <div class="aef-field aef-field--full">
          <label class="aef-label">Title <span class="aef-required">*</span></label>
          <input type="text" class="aef-input" [(ngModel)]="form.title"
            placeholder="Ex: International Cat Championship 2025" maxlength="150"/>
        </div>

        <div class="aef-field">
          <label class="aef-label">Category <span class="aef-required">*</span></label>
          <div class="aef-select-wrap">
            <select class="aef-select" [(ngModel)]="form.categoryId" (change)="onCategoryChange()">
              <option [ngValue]="null" disabled>Select a category…</option>
              <option *ngFor="let cat of categories" [ngValue]="cat.id">
                {{ cat.icon }} {{ cat.name }}
              </option>
            </select>
            <svg class="aef-select-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <div class="aef-field">
          <label class="aef-label">Cover image</label>
          <div class="aef-upload-zone" [class.aef-upload-zone--has-image]="imagePreview" (click)="fileInput.click()">
            <img *ngIf="imagePreview" [src]="imagePreview" class="aef-upload-preview" alt="cover"/>
            <div class="aef-upload-placeholder" *ngIf="!imagePreview">
              <i class="fas fa-image" aria-hidden="true"></i>
              <span>Click to upload</span>
            </div>
            <button class="aef-upload-remove" *ngIf="imagePreview"
              (click)="$event.stopPropagation(); removeImage()" type="button"><i class="fas fa-xmark"></i></button>
          </div>
          <input #fileInput type="file" accept="image/*" class="aef-hidden" (change)="onFileSelected($event)"/>
          <button class="aef-upload-btn" *ngIf="selectedImage && !uploadingImage"
            (click)="uploadImage()" type="button">Upload image</button>
          <div class="aef-uploading" *ngIf="uploadingImage">
            <div class="aef-spinner"></div> Uploading…
          </div>
        </div>

        <!-- ✅ TOGGLE EN LIGNE — partie clé du fix -->
        <div class="aef-field aef-field--full">
          <label class="aef-label">Event format</label>
          <div class="aef-format-toggle-group">

            <!-- Présentiel -->
            <div class="aef-format-card"
              [class.aef-format-card--active]="!form.isOnline"
              (click)="form.isOnline = false">
                <div class="aef-format-card__icon"><i class="fas fa-map-location-dot" aria-hidden="true"></i></div>
              <div class="aef-format-card__info">
                <div class="aef-format-card__title">In-person</div>
                <div class="aef-format-card__desc">Physical location required</div>
              </div>
              <div class="aef-format-card__radio" [class.aef-format-card__radio--on]="!form.isOnline"></div>
            </div>

            <!-- En ligne -->
            <div class="aef-format-card aef-format-card--online"
              [class.aef-format-card--active]="form.isOnline"
              (click)="form.isOnline = true">
              <div class="aef-format-card__icon"><i class="fas fa-display" aria-hidden="true"></i></div>
              <div class="aef-format-card__info">
                <div class="aef-format-card__title">Online</div>
                <div class="aef-format-card__desc">Virtual room, attendance tracking & certificates</div>
              </div>
              <div class="aef-format-card__radio" [class.aef-format-card__radio--on]="form.isOnline"></div>
            </div>

          </div>
        </div>

        <div class="aef-field aef-field--full">
          <label class="aef-label">Description <span class="aef-required">*</span></label>
          <textarea class="aef-textarea" [(ngModel)]="form.description"
            rows="5" placeholder="Describe the event…" maxlength="2000">
          </textarea>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ STEP 2 : Date & Lieu ══════════════════════════════════════ -->
  <div class="aef-panel" *ngIf="currentStep === 1">
    <div class="aef-panel__header">
      <div class="aef-panel__icon aef-panel__icon--amber">
        <i class="fas fa-calendar-days" aria-hidden="true"></i>
      </div>
      <div>
        <h2 class="aef-panel__title">Date, location & capacity</h2>
        <p class="aef-panel__sub">When and where the event takes place</p>
      </div>
    </div>
    <div class="aef-form-body">
      <div class="aef-grid">

        <div class="aef-field">
          <label class="aef-label">Start date & time <span class="aef-required">*</span></label>
          <input type="datetime-local" class="aef-input" [(ngModel)]="form.startDate"
            [min]="minDate" (change)="onDateChange()"/>
        </div>

        <div class="aef-field">
          <label class="aef-label">End date & time <span class="aef-required">*</span></label>
          <input type="datetime-local" class="aef-input" [(ngModel)]="form.endDate"
            [min]="form.startDate || minDate"/>
        </div>

        <div class="aef-field aef-field--full">
          <label class="aef-label">Location <span class="aef-required">*</span></label>
          <div class="aef-input-with-icon">
            <i class="fas fa-map-location-dot" aria-hidden="true"></i>
            <input type="text" class="aef-input aef-input--icon" [(ngModel)]="form.location"
              placeholder="Ex: Arena Mohamed V, Casablanca" (blur)="onLocationBlur()"/>
          </div>
          <p class="aef-field__hint" *ngIf="form.isOnline">
            <i class="fas fa-circle-info" aria-hidden="true"></i> For online events, enter the organizer's city for weather info.
          </p>
        </div>

        <div class="aef-field">
          <label class="aef-label">Max participants <span class="aef-required">*</span></label>
          <input type="number" class="aef-input" [(ngModel)]="form.maxParticipants" min="1"/>
        </div>

      </div>

      <!-- Météo -->
      <div class="aef-weather-card" *ngIf="weather">
        <div class="aef-weather-card__header"><i class="fas fa-cloud-sun" aria-hidden="true"></i> Weather forecast for {{ form.location?.split(',')[0] }}</div>
        <div class="aef-weather-card__body">
          <div class="aef-weather-row">
            <span class="aef-weather-icon">{{ getWeatherEmoji(weather.condition) }}</span>
            <span class="aef-weather-temp">{{ weather.temperature }}°C</span>
            <span class="aef-weather-desc">{{ weather.description }}</span>
            <span class="aef-weather-pill"
              [class.aef-weather-pill--outdoor]="weather.recommendation === 'OUTDOOR'"
              [class.aef-weather-pill--indoor]="weather.recommendation === 'INDOOR'">
              {{ weather.recommendation === 'OUTDOOR' ? 'Outdoor OK' : 'Indoor recommended' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ STEP 3 : Session virtuelle (seulement si isOnline) ════════ -->
  <div class="aef-panel" *ngIf="currentStep === 2">
    <div class="aef-panel__header">
      <div class="aef-panel__icon" [class.aef-panel__icon--green]="form.isOnline" [class.aef-panel__icon--grey]="!form.isOnline">
        <i class="fas fa-display" aria-hidden="true"></i>
      </div>
      <div>
        <h2 class="aef-panel__title">Virtual session</h2>
        <p class="aef-panel__sub">
          {{ form.isOnline ? 'Configure the online room settings' : 'Not applicable — this is an in-person event' }}
        </p>
      </div>
    </div>
    <div class="aef-form-body">

      <!-- Pas un event online -->
      <div class="aef-online-skip" *ngIf="!form.isOnline">
      <div class="aef-online-skip__icon"><i class="fas fa-map-location-dot"></i></div>
        <p>This event is configured as <strong>in-person</strong>.</p>
        <p>Go back to step 1 to switch to online format if needed.</p>
      </div>

      <!-- Config salle virtuelle -->
      <div *ngIf="form.isOnline">

        <div class="aef-online-badge">
          <i class="fas fa-circle-info"></i>
          A virtual room will be automatically created and opened
          <strong>{{ form.earlyAccessMinutes }} minutes</strong> before the event.
          Participants need to be <strong>CONFIRMED</strong> to access it.
        </div>

        <div class="aef-grid">

          <!-- URL externe optionnel -->
          <div class="aef-field aef-field--full">
            <label class="aef-label">External room URL <span class="aef-field__hint">optional</span></label>
            <input type="url" class="aef-input" [(ngModel)]="form.externalRoomUrl"
              placeholder="https://zoom.us/j/... or leave empty for built-in room"/>
            <span class="aef-field__hint">
              Leave empty to use the built-in virtual room. Paste a Zoom/Meet/Teams link to redirect participants.
            </span>
          </div>

          <!-- Early access -->
          <div class="aef-field">
            <label class="aef-label">
              Early access window
              <span class="aef-field__hint">— room opens before event start</span>
            </label>
            <div class="aef-slider-row">
              <input type="range" min="0" max="60" step="5"
                [(ngModel)]="form.earlyAccessMinutes" class="aef-slider"/>
              <span class="aef-slider-value">{{ form.earlyAccessMinutes }} min</span>
            </div>
          </div>

          <!-- Seuil certificat -->
          <div class="aef-field">
            <label class="aef-label">
              Certificate threshold
              <span class="aef-field__hint">— minimum attendance %</span>
            </label>
            <div class="aef-slider-row">
              <input type="range" min="50" max="100" step="5"
                [(ngModel)]="form.attendanceThreshold" class="aef-slider"/>
              <span class="aef-slider-value">≥ {{ form.attendanceThreshold }}%</span>
            </div>
          </div>

        </div>

        <!-- Récap visuel -->
        <div class="aef-virtual-summary">
          <div class="aef-virtual-summary__item">
            <span class="aef-virtual-summary__icon"><i class="fas fa-clock"></i></span>
            <div>
              <div class="aef-virtual-summary__label">Room opens</div>
              <div class="aef-virtual-summary__val">{{ form.earlyAccessMinutes }} min before start</div>
            </div>
          </div>
          <div class="aef-virtual-summary__item">
            <span class="aef-virtual-summary__icon"><i class="fas fa-trophy"></i></span>
            <div>
              <div class="aef-virtual-summary__label">Certificate at</div>
              <div class="aef-virtual-summary__val">≥ {{ form.attendanceThreshold }}% attendance</div>
            </div>
          </div>
          <div class="aef-virtual-summary__item">
            <span class="aef-virtual-summary__icon"><i class="fas fa-lock"></i></span>
            <div>
              <div class="aef-virtual-summary__label">Access control</div>
              <div class="aef-virtual-summary__val">Confirmed participants only</div>
            </div>
          </div>
          <div class="aef-virtual-summary__item" *ngIf="form.externalRoomUrl">
            <span class="aef-virtual-summary__icon"><i class="fas fa-link"></i></span>
            <div>
              <div class="aef-virtual-summary__label">External room</div>
              <div class="aef-virtual-summary__val">Custom URL configured</div>
            </div>
          </div>
        </div>

        <!-- Loader création session -->
        <div class="aef-creating-session" *ngIf="virtualSessionCreating">
          <div class="aef-spinner"></div>
          <span>Creating virtual session…</span>
        </div>
        <div class="aef-session-created" *ngIf="virtualSessionCreated">
          Virtual session already configured for this event.
        </div>
      </div>
    </div>
  </div>

  <!-- ══ STEP 4 : Eligibilité ══════════════════════════════════════ -->
  <div class="aef-panel" *ngIf="currentStep === 3">
    <!-- ... (ton contenu existant pour l'éligibilité) ... -->
    <div class="aef-panel__header">
      <div class="aef-panel__icon aef-panel__icon--green">
        <i class="fas fa-circle-check" aria-hidden="true"></i>
      </div>
      <div>
        <h2 class="aef-panel__title">Eligibility rules</h2>
        <p class="aef-panel__sub">Define who can participate</p>
      </div>
    </div>
    <div class="aef-form-body">
      <p style="color:var(--grey-500);font-size:14px;">
        Rules are configured from the event detail view after creation.
      </p>
    </div>
  </div>

  <!-- ── NAVIGATION FOOTER ──────────────────────────────────────── -->
  <div class="aef-footer">
    <button type="button" class="aef-btn-ghost" (click)="prevStep()" *ngIf="currentStep > 0">
      <i class="fas fa-chevron-left" aria-hidden="true"></i>
      Back
    </button>
    <div class="aef-footer__right">
      <span class="aef-step-indicator">Step {{ currentStep + 1 }} of {{ steps.length }}</span>
      <button type="button" class="aef-btn-next" (click)="nextStep()"
        *ngIf="currentStep < steps.length - 1">
        Next
        <i class="fas fa-chevron-right" aria-hidden="true"></i>
      </button>
      <button type="button" class="aef-btn-submit" (click)="save()"
        *ngIf="currentStep === steps.length - 1"
        [disabled]="loading || !isValid">
        <div class="aef-spinner aef-spinner--white" *ngIf="loading"></div>
        <i *ngIf="!loading" class="fas fa-circle-check" aria-hidden="true"></i>
        {{ loading ? 'Saving…' : (isEdit ? 'Save changes' : 'Create event') }}
      </button>
    </div>
  </div>

</div>

DIFF TABLE
| Element | Old (Events) | New (Transit-matched) |
| --- | --- | --- |
| Step completed icon | inline svg polyline check | fa-circle-check icon class |
| Hint/recommendation icons | emoji-based markers | transit-style iconized text labels |

FILE: src/app/back-office/events/pages/popularity-dashboard/popularity-dashboard.component.css
FULL UPDATED SCSS/CSS
:host {
  --green-50:#f0faf4;--green-100:#dcf5e7;--green-200:#b8eacf;
  --green-400:#4ebe80;--green-500:#3a9282;--green-600:#2f7a6e;
  --orange-50:#fff7ed;--orange-100:#ffedd5;
  --orange-400:#fb923c;--orange-500:#f97316;--orange-600:#ea580c;
  --amber-50:#fffbeb;--amber-100:#fef3c7;--amber-400:#fbbf24;--amber-600:#d97706;
  --red-50:#fef2f2;--red-500:#ef4444;
  --blue-50:#eff6ff;--blue-500:#3b82f6;
  --violet-500:#8b5cf6;--indigo-500:#6366f1;
  --grey-50:#f8fafc;--grey-100:#f1f5f9;--grey-200:#e2e8f0;--grey-300:#cbd5e1;
  --grey-400:#94a3b8;--grey-500:#64748b;--grey-700:#334155;--grey-900:#0f172a;
  --bg:#f8fafc;--surface:#ffffff;--border:#dde7ef;
  --shadow-sm:0 4px 20px rgba(15, 23, 42, .06);
  --shadow-md:0 12px 28px rgba(15, 23, 42, .1);
  --shadow-lg:0 24px 60px -38px rgba(15, 23, 42, .7);
  --radius-sm:6px;--radius-md:10px;--radius-lg:14px;--radius-xl:20px;
  --font:inherit;--mono:inherit;
  display:block;background:var(--bg);min-height:100vh;
  font-family:var(--font);color:var(--grey-900);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.pd-shell{max-width:1400px;margin:0 auto;padding:0 28px 72px;}

/* TOPBAR */
.pd-topbar{display:flex;align-items:center;justify-content:space-between;padding:18px 0 14px;border-bottom:1.5px solid var(--border);position:sticky;top:0;background:var(--bg);z-index:50;}
.pd-topbar__left{display:flex;align-items:center;gap:8px;font-size:14px;}
.pd-back-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border:1.5px solid var(--border);border-radius:var(--radius-md);background:var(--surface);font-family:var(--font);font-size:13px;font-weight:500;color:var(--grey-700);cursor:pointer;text-decoration:none;transition:border-color .15s,background .15s;}
.pd-back-btn:hover{border-color:var(--green-500);background:var(--green-50);}
.pd-topbar__sep{color:var(--grey-300);}
.pd-topbar__page{font-weight:600;color:var(--grey-900);}
.pd-topbar__right{display:flex;align-items:center;gap:12px;}
.pd-period-label{font-size:12px;color:var(--grey-400);font-family:var(--mono);}
.pd-refresh-btn{display:inline-flex;align-items:center;gap:6px;padding:0 14px;height:34px;border:1.5px solid var(--border);border-radius:var(--radius-md);background:var(--surface);font-family:var(--font);font-size:13px;font-weight:500;color:var(--grey-600);cursor:pointer;transition:border-color .15s,background .15s;}
.pd-refresh-btn:hover{border-color:var(--green-500);background:var(--green-50);}
.pd-refresh-btn:disabled{opacity:.5;cursor:not-allowed;}
.spinning{animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

/* HERO */
.pd-hero{display:flex;align-items:flex-start;justify-content:space-between;padding:32px 0 28px;gap:24px;flex-wrap:wrap;}
.pd-hero__eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.28em;color:var(--grey-400);margin-bottom:8px;}
.pd-hero__title{font-size:clamp(24px,3vw,36px);font-weight:800;color:var(--grey-900);letter-spacing:-.6px;line-height:1.2;margin-bottom:8px;}
.pd-hero__accent{color:var(--green-500);}
.pd-hero__sub{font-size:14px;color:var(--grey-500);line-height:1.7;max-width:520px;}

/* KPI Strip */
.pd-kpi-strip{display:flex;gap:12px;flex-wrap:wrap;flex-shrink:0;}
.pd-kpi{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-lg);padding:16px 20px;min-width:130px;text-align:center;box-shadow:var(--shadow-sm);}
.pd-kpi--orange{background:var(--orange-50);border-color:var(--orange-100);}
.pd-kpi--green {background:var(--green-50); border-color:var(--green-200);}
.pd-kpi--amber {background:var(--amber-50); border-color:var(--amber-100);}
.pd-kpi__icon{font-size:20px;margin-bottom:6px;}
.pd-kpi__val{font-size:24px;font-weight:800;color:var(--grey-900);line-height:1;}
.pd-kpi--orange .pd-kpi__val{color:var(--orange-600);}
.pd-kpi--green  .pd-kpi__val{color:var(--green-600);}
.pd-kpi--amber  .pd-kpi__val{color:var(--amber-600);}
.pd-kpi__lbl{font-size:12px;color:var(--grey-500);margin-top:4px;}
.pd-kpi.pd-skel{height:110px;background:linear-gradient(90deg,var(--grey-100) 25%,var(--grey-50) 50%,var(--grey-100) 75%);background-size:200% 100%;animation:shimmer 1.4s ease-in-out infinite;border:none;}
@keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

/* LOADING */
.pd-full-loading{display:flex;align-items:center;justify-content:center;gap:12px;padding:80px;font-size:14px;color:var(--grey-500);}
.pd-spinner{width:22px;height:22px;border:2.5px solid var(--green-100);border-top-color:var(--green-500);border-radius:50%;animation:spin .7s linear infinite;}
.pd-spinner--sm{width:16px;height:16px;border-width:2px;}
.pd-top-loading{display:flex;align-items:center;justify-content:center;padding:24px;}

/* CONTENT LAYOUT */
.pd-content{display:flex;flex-direction:column;gap:20px;}
.pd-row{display:grid;gap:20px;}
.pd-row--two{grid-template-columns:1fr 1fr;}

/* CARD */
.pd-card{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-sm);overflow:hidden;}
.pd-card--wide{width:100%;}
.pd-card--warn{border-color:var(--amber-100);}
.pd-card__header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 14px;border-bottom:1.5px solid var(--border);background:var(--grey-50);flex-wrap:wrap;gap:10px;}
.pd-card__title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--grey-900);}
.pd-card__title--warn{color:var(--amber-700,#92400e);}
.pd-card__sub{font-size:12px;color:var(--grey-400);}
.pd-card__actions{display:flex;align-items:center;gap:10px;}
.pd-card__body{padding:20px 22px;}
.pd-card__body--no-pad{padding:0;}

/* PERIOD TABS */
.pd-period-tabs{display:flex;border:1.5px solid var(--border);border-radius:var(--radius-md);overflow:hidden;}
.pd-period-tab{padding:0 12px;height:30px;border:none;border-right:1px solid var(--border);background:var(--surface);font-family:var(--font);font-size:12px;font-weight:600;color:var(--grey-500);cursor:pointer;transition:background .12s,color .12s;}
.pd-period-tab:last-child{border-right:none;}
.pd-period-tab--active{background:var(--green-500);color:#fff;}
.pd-period-tab:hover:not(.pd-period-tab--active){background:var(--green-50);color:var(--green-700);}

/* BREAKDOWN */
.pd-breakdown{display:flex;flex-direction:column;gap:12px;}
.pd-breakdown-row{display:flex;align-items:center;gap:12px;}
.pd-breakdown-row__left{display:flex;align-items:center;gap:6px;width:180px;flex-shrink:0;}
.pd-breakdown-row__icon{font-size:16px;width:22px;text-align:center;}
.pd-breakdown-row__label{font-size:13px;font-weight:500;color:var(--grey-700);flex:1;}
.pd-breakdown-row__weight{font-size:11px;font-weight:700;color:var(--grey-400);font-family:var(--mono);background:var(--grey-100);padding:1px 5px;border-radius:4px;}
.pd-breakdown-row__bar-wrap{flex:1;display:flex;align-items:center;gap:10px;}
.pd-breakdown-row__bar{flex:1;height:8px;background:var(--grey-100);border-radius:4px;overflow:hidden;}
.pd-breakdown-row__fill{height:100%;border-radius:4px;transition:width .6s ease;}
.pd-breakdown-row__count{font-size:13px;font-weight:700;color:var(--grey-900);font-family:var(--mono);min-width:50px;text-align:right;}

/* FORMULA */
.pd-formula__intro{font-size:13px;color:var(--grey-600);line-height:1.65;margin-bottom:16px;}
.pd-formula-items{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;}
.pd-formula-item{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--grey-50);border-radius:var(--radius-md);}
.pd-formula-item__icon{font-size:16px;width:22px;text-align:center;}
.pd-formula-item__info{flex:1;}
.pd-formula-item__label{display:block;font-size:13px;font-weight:600;color:var(--grey-800);}
.pd-formula-item__desc{font-size:11px;color:var(--grey-400);}
.pd-formula-item__weight{font-size:12px;font-weight:800;padding:3px 10px;border-radius:20px;font-family:var(--mono);flex-shrink:0;}
.pd-formula-eq{font-size:14px;font-weight:700;color:var(--grey-700);font-family:var(--mono);background:var(--green-50);border:1.5px solid var(--green-200);border-radius:var(--radius-md);padding:12px 16px;text-align:center;}

/* TABLE */
.pd-table{width:100%;border-collapse:collapse;font-size:13px;}
.pd-table th{text-align:left;font-size:11px;font-weight:700;color:var(--grey-500);text-transform:uppercase;letter-spacing:.5px;padding:10px 16px;border-bottom:1.5px solid var(--border);background:var(--grey-50);white-space:nowrap;}
.pd-table td{padding:12px 16px;border-bottom:1px solid var(--grey-100);vertical-align:middle;}
.pd-table__row{cursor:pointer;transition:background .12s;}
.pd-table__row:hover td{background:var(--green-50);}
.pd-table__row--warn:hover td{background:var(--amber-50);}
.pd-table__num{text-align:right;font-family:var(--mono);}
.pd-table-empty{padding:32px;text-align:center;color:var(--grey-400);font-size:14px;}

.pd-rank{width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;font-family:var(--mono);}
.pd-rank--gold  {background:#fef3c7;color:#92400e;}
.pd-rank--silver{background:var(--grey-100);color:var(--grey-700);}
.pd-rank--bronze{background:#ffedd5;color:var(--orange-700,#c2410c);}
.pd-rank--default{background:var(--grey-50);color:var(--grey-400);}

.pd-event-cell__name{font-weight:600;color:var(--grey-900);margin-bottom:2px;}
.pd-event-cell__location{font-size:11px;color:var(--grey-400);display:flex;align-items:center;gap:3px;}

.pd-cat-pill{font-size:11px;font-weight:600;background:var(--green-50);color:var(--green-700);padding:2px 8px;border-radius:20px;white-space:nowrap;}

.pd-score-cell{display:flex;flex-direction:column;align-items:flex-end;gap:4px;}
.pd-score-val{font-size:14px;font-weight:800;color:var(--grey-900);}
.pd-score-bar{width:80px;height:4px;background:var(--grey-100);border-radius:2px;overflow:hidden;}
.pd-score-bar__fill{height:100%;background:linear-gradient(90deg,var(--green-400),var(--green-600));border-radius:2px;transition:width .5s ease;}

.pd-num{font-weight:600;color:var(--grey-700);}

.pd-conv{font-size:13px;font-weight:700;padding:2px 8px;border-radius:20px;}
.pd-conv--high{background:var(--green-100);color:var(--green-700);}
.pd-conv--mid {background:var(--amber-50);color:var(--amber-700,#92400e);}
.pd-conv--low {background:var(--grey-100);color:var(--grey-500);}

.pd-slots{font-size:12px;font-weight:600;}
.pd-slots--full{color:var(--red-500);}
.pd-slots--low {color:var(--orange-600);}

.pd-low-views{font-size:13px;font-weight:700;color:var(--amber-600);}
.pd-date-chip{font-size:12px;color:var(--grey-500);white-space:nowrap;}

.pd-detail-btn{padding:4px 12px;border:1.5px solid var(--green-400);border-radius:var(--radius-sm);background:transparent;font-family:var(--font);font-size:12px;font-weight:600;color:var(--green-600);cursor:pointer;transition:background .12s,border-color .12s;white-space:nowrap;}
.pd-detail-btn:hover{background:var(--green-50);}
.pd-detail-btn--warn{border-color:var(--amber-400);color:var(--amber-700,#92400e);}
.pd-detail-btn--warn:hover{background:var(--amber-50);}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.34rem;
  min-height: 40px;
  padding: 0.5rem 0.7rem;
  border-radius: 50px;
  border: 1px solid #d9e5ee;
  background: #fff;
  color: #334155;
  font-size: 0.76rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  border-color: #3a9282;
  color: #2f7a6e;
  background: #f7fcfb;
}

.action-button--outline {
  border-color: #d9e5ee;
  background: #fff;
  color: #334155;
}

/* MODAL */
.pd-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.45);backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .15s ease;}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
.pd-modal{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-lg);width:100%;max-width:580px;max-height:90vh;overflow-y:auto;animation:modalIn .18s ease;}
@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(8px);}to{opacity:1;transform:scale(1) translateY(0);}}
.pd-modal__header{display:flex;align-items:flex-start;justify-content:space-between;padding:20px 24px 16px;border-bottom:1.5px solid var(--border);background:var(--grey-50);}
.pd-modal__eyebrow{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.3em;color:var(--grey-400);margin-bottom:4px;}
.pd-modal__title{font-size:17px;font-weight:800;color:var(--grey-900);}
.pd-modal__close{width:30px;height:30px;border:1.5px solid var(--border);border-radius:var(--radius-sm);background:transparent;color:var(--grey-500);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .12s,color .12s;}
.pd-modal__close:hover{border-color:var(--red-500);color:var(--red-500);}
.pd-modal__body{padding:22px 24px;}
.pd-modal__loading{display:flex;align-items:center;justify-content:center;padding:40px;}
.pd-modal__footer{display:flex;justify-content:flex-end;padding:14px 24px;border-top:1.5px solid var(--border);}
.pd-btn-ghost{padding:0 14px;height:36px;border:1.5px solid var(--border);border-radius:var(--radius-md);background:transparent;font-family:var(--font);font-size:13px;font-weight:500;color:var(--grey-500);cursor:pointer;}

/* DETAIL MODAL CONTENT */
.pd-detail-hero{display:flex;align-items:center;justify-content:space-around;padding:16px;background:var(--grey-50);border-radius:var(--radius-lg);margin-bottom:20px;}
.pd-detail-score__val{font-size:32px;font-weight:800;color:var(--grey-900);text-align:center;line-height:1;}
.pd-detail-score__lbl{font-size:12px;color:var(--grey-500);text-align:center;margin-top:3px;}
.pd-trend-badge{font-size:14px;font-weight:700;padding:8px 16px;border-radius:20px;}
.pd-trend-badge--rising  {background:var(--green-100);color:var(--green-700);}
.pd-trend-badge--stable  {background:var(--grey-100);color:var(--grey-600);}
.pd-trend-badge--declining{background:var(--red-50);color:var(--red-600);}
.pd-detail-conv__val{font-size:24px;font-weight:800;color:var(--orange-600);text-align:center;line-height:1;}
.pd-detail-conv__lbl{font-size:12px;color:var(--grey-500);text-align:center;margin-top:3px;}
.pd-detail-breakdown__title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--grey-500);margin-bottom:14px;}
.pd-detail-bars{display:flex;flex-direction:column;gap:10px;}
.pd-detail-bar-row{display:flex;align-items:center;gap:8px;}
.pd-detail-bar-row__icon{font-size:14px;width:20px;text-align:center;flex-shrink:0;}
.pd-detail-bar-row__label{font-size:12px;font-weight:500;color:var(--grey-700);width:110px;flex-shrink:0;}
.pd-detail-bar-row__track{flex:1;height:10px;background:var(--grey-100);border-radius:5px;overflow:hidden;}
.pd-detail-bar-row__fill{height:100%;border-radius:5px;transition:width .6s ease;}
.pd-detail-bar-row__count{font-size:12px;font-weight:700;color:var(--grey-900);font-family:var(--mono);min-width:40px;text-align:right;}
.pd-detail-bar-row__unique{font-size:11px;color:var(--grey-400);}

@media(max-width:900px){
  .pd-shell{padding:0 16px 60px;}
  .pd-row--two{grid-template-columns:1fr;}
  .pd-hero{flex-direction:column;}
  .pd-kpi-strip{gap:8px;}
  .pd-kpi{min-width:90px;padding:12px;}
}


FILE: src/app/back-office/events/pages/popularity-dashboard/popularity-dashboard.component.html
FULL UPDATED HTML

<div class="pd-shell">

  <!-- ── TOPBAR ──────────────────────────────────────────────────── -->
  <header class="pd-topbar">
    <div class="pd-topbar__left">
      <button class="pd-back-btn" routerLink="/admin/events">
        <i class="fas fa-arrow-left"></i>
        Events
      </button>
      <span class="pd-topbar__sep">/</span>
      <span class="pd-topbar__page">Popularity Analytics</span>
    </div>
    <div class="pd-topbar__right">
      <span class="pd-period-label" *ngIf="dashboard">
        {{ dashboard.period.label }}
      </span>
      <button class="pd-refresh-btn" (click)="loadDashboard()" [disabled]="loading">
        <i class="fas fa-rotate-right" [class.spinning]="loading"></i>
        Refresh
      </button>
    </div>
  </header>

  <!-- ── HERO ──────────────────────────────────────────────────────── -->
  <div class="pd-hero">
    <div class="pd-hero__text">
      <p class="pd-hero__eyebrow">Analytics · Popularity</p>
      <h1 class="pd-hero__title">
        Event <span class="pd-hero__accent">Popularity</span> Dashboard
      </h1>
      <p class="pd-hero__sub">
        Real-time tracking of user interactions — views, clicks, registrations —
        weighted to surface what users actually engage with.
      </p>
    </div>
    <!-- Global KPIs -->
    <div class="pd-kpi-strip" *ngIf="dashboard && !loading">
      <div class="pd-kpi">
        <div class="pd-kpi__icon"><i class="fas fa-eye"></i></div>
        <div class="pd-kpi__val">{{ dashboard.totalViewsToday | number }}</div>
        <div class="pd-kpi__lbl">Views today</div>
      </div>
      <div class="pd-kpi pd-kpi--orange">
        <div class="pd-kpi__icon"><i class="fas fa-bolt"></i></div>
        <div class="pd-kpi__val">{{ dashboard.totalInteractionsThisWeek | number }}</div>
        <div class="pd-kpi__lbl">Interactions / week</div>
      </div>
      <div class="pd-kpi pd-kpi--green">
        <div class="pd-kpi__icon"><i class="fas fa-bullseye"></i></div>
        <div class="pd-kpi__val">{{ dashboard.averageConversionRate }}%</div>
        <div class="pd-kpi__lbl">Avg conversion</div>
      </div>
      <div class="pd-kpi pd-kpi--amber" *ngIf="dashboard.neglectedEvents.length > 0">
        <div class="pd-kpi__icon"><i class="fas fa-triangle-exclamation"></i></div>
        <div class="pd-kpi__val">{{ dashboard.neglectedEvents.length }}</div>
        <div class="pd-kpi__lbl">Neglected events</div>
      </div>
    </div>

    <!-- KPI skeletons -->
    <div class="pd-kpi-strip" *ngIf="loading">
      <div class="pd-kpi pd-skel" *ngFor="let i of [1,2,3,4]"></div>
    </div>
  </div>

  <!-- ── LOADING FULL PAGE ─────────────────────────────────────────── -->
  <div class="pd-full-loading" *ngIf="loading && !dashboard">
    <div class="pd-spinner"></div>
    <span>Loading analytics…</span>
  </div>

  <!-- ══════════════════════════════════════════════════════════════════
       MAIN CONTENT
  ══════════════════════════════════════════════════════════════════ -->
  <div class="pd-content" *ngIf="dashboard">

    <!-- ── ROW 1 : Interaction breakdown + Conversion ─────────────── -->
    <div class="pd-row pd-row--two">

      <!-- Breakdown par type -->
      <div class="pd-card">
        <div class="pd-card__header">
          <div class="pd-card__title">
            <i class="fas fa-chart-column"></i>
            Interactions by type
          </div>
          <span class="pd-card__sub">Last 7 days</span>
        </div>
        <div class="pd-card__body">
          <div class="pd-breakdown">
            <div class="pd-breakdown-row" *ngFor="let item of getBreakdownItems()">
              <div class="pd-breakdown-row__left">
                <span class="pd-breakdown-row__icon">{{ item.icon }}</span>
                <span class="pd-breakdown-row__label">{{ item.label }}</span>
                <span class="pd-breakdown-row__weight">×{{ item.weight }}</span>
              </div>
              <div class="pd-breakdown-row__bar-wrap">
                <div class="pd-breakdown-row__bar">
                  <div class="pd-breakdown-row__fill"
                    [style.width.%]="getBarWidth(item.count)"
                    [style.background]="item.color">
                  </div>
                </div>
                <span class="pd-breakdown-row__count">{{ item.count | number }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Score formula explanation -->
      <div class="pd-card">
        <div class="pd-card__header">
          <div class="pd-card__title">
            <i class="fas fa-circle-info"></i>
            How popularity score works
          </div>
          <span class="pd-card__sub">Weighted formula</span>
        </div>
        <div class="pd-card__body">
          <div class="pd-formula">
            <p class="pd-formula__intro">
              The popularity score is a weighted sum of all interactions,
              reflecting true engagement beyond simple view counts.
            </p>
            <div class="pd-formula-items">
              <div class="pd-formula-item" *ngFor="let item of formulaItems">
                <span class="pd-formula-item__icon">{{ item.icon }}</span>
                <div class="pd-formula-item__info">
                  <span class="pd-formula-item__label">{{ item.label }}</span>
                  <span class="pd-formula-item__desc">{{ item.desc }}</span>
                </div>
                <span class="pd-formula-item__weight" [style.background]="item.color + '22'" [style.color]="item.color">
                  ×{{ item.weight }}
                </span>
              </div>
            </div>
            <div class="pd-formula-eq">
              Score = Σ (interactions × weight)
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ROW 2 : TOP EVENTS ─────────────────────────────────────── -->
    <div class="pd-card pd-card--wide">
      <div class="pd-card__header">
        <div class="pd-card__title">
          <i class="fas fa-star"></i>
          Top popular events
        </div>
        <div class="pd-card__actions">
          <span class="pd-card__sub">{{ dashboard.period.label }}</span>
          <div class="pd-period-tabs">
            <button class="pd-period-tab" [class.pd-period-tab--active]="selectedDays === 7"  (click)="changePeriod(7)">7d</button>
            <button class="pd-period-tab" [class.pd-period-tab--active]="selectedDays === 30" (click)="changePeriod(30)">30d</button>
            <button class="pd-period-tab" [class.pd-period-tab--active]="selectedDays === 90" (click)="changePeriod(90)">90d</button>
          </div>
        </div>
      </div>
      <div class="pd-card__body pd-card__body--no-pad">
        <div class="pd-top-loading" *ngIf="loadingTop">
          <div class="pd-spinner pd-spinner--sm"></div>
        </div>
        <table class="pd-table" *ngIf="!loadingTop && topEvents.length > 0">
          <thead>
            <tr>
              <th class="pd-table__rank">#</th>
              <th>Event</th>
              <th>Category</th>
              <th class="pd-table__num">Score</th>
              <th class="pd-table__num">Unique views</th>
              <th class="pd-table__num">Conversion</th>
              <th class="pd-table__num">Availability</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let event of topEvents; let i = index"
              class="pd-table__row"
              (click)="openEventDetail(event.eventId)">
              <td class="pd-table__rank">
                <span class="pd-rank" [class]="getRankClass(i)">{{ i + 1 }}</span>
              </td>
              <td>
                <div class="pd-event-cell">
                  <div class="pd-event-cell__name">{{ event.title }}</div>
                  <div class="pd-event-cell__location">
                    <i class="fas fa-location-dot"></i>
                    {{ (event.location || '') | slice:0:30 }}
                  </div>
                </div>
              </td>
              <td>
                <span class="pd-cat-pill">
                  {{ event.categoryIcon }} {{ event.categoryName }}
                </span>
              </td>
              <td class="pd-table__num">
                <div class="pd-score-cell">
                  <span class="pd-score-val">{{ event.popularityScore | number }}</span>
                  <div class="pd-score-bar">
                    <div class="pd-score-bar__fill"
                      [style.width.%]="getScoreBarWidth(event.popularityScore)">
                    </div>
                  </div>
                </div>
              </td>
              <td class="pd-table__num">
                <span class="pd-num">{{ event.uniqueViews | number }}</span>
              </td>
              <td class="pd-table__num">
                <span class="pd-conv"
                  [class.pd-conv--high]="event.conversionRate >= 10"
                  [class.pd-conv--mid]="event.conversionRate >= 5 && event.conversionRate < 10"
                  [class.pd-conv--low]="event.conversionRate < 5">
                  {{ event.conversionRate }}%
                </span>
              </td>
              <td class="pd-table__num">
                <span class="pd-slots"
                  [class.pd-slots--full]="event.remainingSlots === 0"
                  [class.pd-slots--low]="event.remainingSlots > 0 && event.remainingSlots <= 5">
                  {{ event.remainingSlots === 0 ? 'Full' : event.remainingSlots + ' left' }}
                </span>
              </td>
              <td>
                <button class="action-button action-button--outline" (click)="$event.stopPropagation(); openEventDetail(event.eventId)">
                  <i class="fas fa-up-right-and-down-left-from-center"></i> Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pd-table-empty" *ngIf="!loadingTop && topEvents.length === 0">
          No data for this period
        </div>
      </div>
    </div>

    <!-- ── ROW 3 : NEGLECTED EVENTS ────────────────────────────────── -->
    <div class="pd-card pd-card--wide pd-card--warn" *ngIf="dashboard.neglectedEvents.length > 0">
      <div class="pd-card__header">
        <div class="pd-card__title pd-card__title--warn">
          <i class="fas fa-triangle-exclamation"></i>
          Neglected events
        </div>
        <span class="pd-card__sub">PLANNED · less than 10 views · needs attention</span>
      </div>
      <div class="pd-card__body pd-card__body--no-pad">
        <table class="pd-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th class="pd-table__num">Total views</th>
              <th class="pd-table__num">Unique views</th>
              <th class="pd-table__num">Conversion</th>
              <th class="pd-table__num">Seats left</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let event of dashboard.neglectedEvents"
              class="pd-table__row pd-table__row--warn"
              (click)="openEventDetail(event.eventId)">
              <td>
                <div class="pd-event-cell">
                  <div class="pd-event-cell__name">{{ event.title }}</div>
                  <div class="pd-event-cell__location">{{ (event.location || '') | slice:0:28 }}</div>
                </div>
              </td>
              <td>
                <span class="pd-cat-pill">{{ event.categoryIcon }} {{ event.categoryName }}</span>
              </td>
              <td class="pd-table__num">
                <span class="pd-low-views">{{ event.totalInteractions }}</span>
              </td>
              <td class="pd-table__num">{{ event.uniqueViews }}</td>
              <td class="pd-table__num">{{ event.conversionRate }}%</td>
              <td class="pd-table__num">{{ event.remainingSlots }}</td>
              <td>
                <span class="pd-date-chip">
                  {{ event.startDate | date:'dd MMM yyyy' }}
                </span>
              </td>
              <td>
                <button class="action-button action-button--outline"
                  (click)="$event.stopPropagation(); openEventDetail(event.eventId)">
                  <i class="fas fa-up-right-and-down-left-from-center"></i> Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── EVENT DETAIL MODAL ─────────────────────────────────────── -->
    <div class="pd-modal-overlay" *ngIf="selectedDetail" (click)="closeDetail()">
      <div class="pd-modal" (click)="$event.stopPropagation()">
        <div class="pd-modal__header">
          <div>
            <div class="pd-modal__eyebrow">EVENT ANALYTICS</div>
            <h3 class="pd-modal__title">{{ selectedDetail.title }}</h3>
          </div>
          <button class="pd-modal__close" (click)="closeDetail()">
            <i class="fas fa-xmark"></i>
          </button>
        </div>
        <div class="pd-modal__body" *ngIf="!loadingDetail">

          <!-- Trend + score -->
          <div class="pd-detail-hero">
            <div class="pd-detail-score">
              <div class="pd-detail-score__val">{{ selectedDetail.popularityScore | number }}</div>
              <div class="pd-detail-score__lbl">Popularity score</div>
            </div>
            <div class="pd-trend-badge pd-trend-badge--{{ selectedDetail.trend.toLowerCase() }}">
              <span *ngIf="selectedDetail.trend === 'RISING'"><i class="fas fa-arrow-trend-up"></i> Rising</span>
              <span *ngIf="selectedDetail.trend === 'STABLE'"><i class="fas fa-right-long"></i> Stable</span>
              <span *ngIf="selectedDetail.trend === 'DECLINING'"><i class="fas fa-arrow-trend-down"></i> Declining</span>
            </div>
            <div class="pd-detail-conv">
              <div class="pd-detail-conv__val">{{ selectedDetail.conversionRate }}%</div>
              <div class="pd-detail-conv__lbl">Conversion rate</div>
            </div>
          </div>

          <!-- Breakdown chart -->
          <div class="pd-detail-breakdown">
            <div class="pd-detail-breakdown__title">Interaction breakdown</div>
            <div class="pd-detail-bars">

              <div class="pd-detail-bar-row">
                <span class="pd-detail-bar-row__icon"><i class="fas fa-eye"></i></span>
                <span class="pd-detail-bar-row__label">Views</span>
                <div class="pd-detail-bar-row__track">
                  <div class="pd-detail-bar-row__fill" style="background:#6366f1"
                    [style.width.%]="getDetailBarWidth(selectedDetail.totalViews, selectedDetail)">
                  </div>
                </div>
                <span class="pd-detail-bar-row__count">{{ selectedDetail.totalViews | number }}</span>
                <span class="pd-detail-bar-row__unique">({{ selectedDetail.uniqueViews }} unique)</span>
              </div>

              <div class="pd-detail-bar-row">
                <span class="pd-detail-bar-row__icon"><i class="fas fa-magnifying-glass"></i></span>
                <span class="pd-detail-bar-row__label">Search clicks</span>
                <div class="pd-detail-bar-row__track">
                  <div class="pd-detail-bar-row__fill" style="background:#0ea5e9"
                    [style.width.%]="getDetailBarWidth(selectedDetail.searchClicks, selectedDetail)">
                  </div>
                </div>
                <span class="pd-detail-bar-row__count">{{ selectedDetail.searchClicks | number }}</span>
              </div>

              <div class="pd-detail-bar-row">
                <span class="pd-detail-bar-row__icon"><i class="fas fa-file-lines"></i></span>
                <span class="pd-detail-bar-row__label">Detail opens</span>
                <div class="pd-detail-bar-row__track">
                  <div class="pd-detail-bar-row__fill" style="background:#8b5cf6"
                    [style.width.%]="getDetailBarWidth(selectedDetail.detailOpens, selectedDetail)">
                  </div>
                </div>
                <span class="pd-detail-bar-row__count">{{ selectedDetail.detailOpens | number }}</span>
              </div>

              <div class="pd-detail-bar-row">
                <span class="pd-detail-bar-row__icon"><i class="fas fa-clock"></i></span>
                <span class="pd-detail-bar-row__label">Waitlist joins</span>
                <div class="pd-detail-bar-row__track">
                  <div class="pd-detail-bar-row__fill" style="background:#f59e0b"
                    [style.width.%]="getDetailBarWidth(selectedDetail.waitlistJoins, selectedDetail)">
                  </div>
                </div>
                <span class="pd-detail-bar-row__count">{{ selectedDetail.waitlistJoins | number }}</span>
              </div>

              <div class="pd-detail-bar-row">
                <span class="pd-detail-bar-row__icon"><i class="fas fa-circle-check"></i></span>
                <span class="pd-detail-bar-row__label">Registrations</span>
                <div class="pd-detail-bar-row__track">
                  <div class="pd-detail-bar-row__fill" style="background:#1d9e75"
                    [style.width.%]="getDetailBarWidth(selectedDetail.registrations, selectedDetail)">
                  </div>
                </div>
                <span class="pd-detail-bar-row__count">{{ selectedDetail.registrations | number }}</span>
              </div>

              <div class="pd-detail-bar-row">
                <span class="pd-detail-bar-row__icon"><i class="fas fa-star"></i></span>
                <span class="pd-detail-bar-row__label">Reviews posted</span>
                <div class="pd-detail-bar-row__track">
                  <div class="pd-detail-bar-row__fill" style="background:#f97316"
                    [style.width.%]="getDetailBarWidth(selectedDetail.reviewsPosted, selectedDetail)">
                  </div>
                </div>
                <span class="pd-detail-bar-row__count">{{ selectedDetail.reviewsPosted | number }}</span>
              </div>

            </div>
          </div>
        </div>
        <div class="pd-modal__loading" *ngIf="loadingDetail">
          <div class="pd-spinner"></div>
        </div>
        <div class="pd-modal__footer">
          <button class="pd-btn-ghost" (click)="closeDetail()">Close</button>
        </div>
      </div>
    </div>

  </div><!-- /pd-content -->

</div><!-- /pd-shell -->

DIFF TABLE
| Element | Old (Events) | New (Transit-matched) |
| --- | --- | --- |
| Row View button | row-btn + fa-eye | action-button action-button--outline + fa-up-right-and-down-left-from-center |
| Export button | action-card export tile | detail-secondary-button + fa-file-excel |
| Top/neglected detail button | pd-detail-btn + fa-eye/Boost text | action-button action-button--outline + fa-up-right-and-down-left-from-center |
| Modal close icon | inline svg close icon | fa-xmark |
