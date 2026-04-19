import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  AdminEventService,
  AdminCategoryService,
  AdminAuthService,
  AdminWeatherService,
  AdminEligibilityRuleService
} from '../../services/admin-api.service';
import { EventCategory, EventDetail, EventEligibilityRule } from '../../models/admin-events.models';

interface StepDef { label: string; sub: string; }

@Component({
  selector: 'app-admin-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './admin-event-form.component.html',
  styleUrls: ['./admin-event-form.component.css']
})
export class AdminEventFormComponent implements OnInit {

  // ── Form data ──────────────────────────────────────────────────────
  form: any = {
    title: '', description: '', location: '',
    startDate: '', endDate: '',
    maxParticipants: 50, coverImageUrl: '', categoryId: null
  };

  categories:     EventCategory[]         = [];
  weather:        any                      = null;
  isEdit          = false;
  eventId:        number | null            = null;
  loading         = false;
  error           = '';
  success         = '';
  touched         = false;

  // ── Image ──────────────────────────────────────────────────────────
  selectedImage:  File | null              = null;
  imagePreview:   string | null            = null;
  uploadingImage  = false;

  // ── Stepper ────────────────────────────────────────────────────────
  currentStep     = 0;
  steps: StepDef[] = [
    { label: 'General info',   sub: 'Title, category, image'   },
    { label: 'Date & location', sub: 'When and where'           },
    { label: 'Eligibility',    sub: 'Who can participate'       },
    { label: 'Confirm',        sub: 'Review and publish'        }
  ];

  // ── Eligibility rules ──────────────────────────────────────────────
  inheritedRules:       EventEligibilityRule[] = [];
  eventSpecificRules:   Partial<EventEligibilityRule>[] = [];
  showAddRuleForm       = false;
  newRule: Partial<EventEligibilityRule & { listValues: string; numericValue: number; booleanValue: boolean }> = {
    hardReject: true, active: true, priority: 0, valueType: 'LIST'
  };

  readonly criteriaOptions = [
    { value: 'ALLOWED_BREEDS',        label: 'Allowed breeds',          icon: '🐾', type: 'LIST'    },
    { value: 'FORBIDDEN_BREEDS',      label: 'Forbidden breeds',        icon: '🚫', type: 'LIST'    },
    { value: 'ALLOWED_SPECIES',       label: 'Allowed species',         icon: '🦁', type: 'LIST'    },
    { value: 'MIN_AGE_MONTHS',        label: 'Minimum age (months)',    icon: '📅', type: 'NUMBER'  },
    { value: 'MAX_AGE_MONTHS',        label: 'Maximum age (months)',    icon: '📅', type: 'NUMBER'  },
    { value: 'MIN_WEIGHT_KG',         label: 'Minimum weight (kg)',     icon: '⚖️', type: 'NUMBER'  },
    { value: 'MAX_WEIGHT_KG',         label: 'Maximum weight (kg)',     icon: '⚖️', type: 'NUMBER'  },
    { value: 'VACCINATION_REQUIRED',  label: 'Vaccination required',    icon: '💉', type: 'BOOLEAN' },
    { value: 'LICENSE_REQUIRED',      label: 'License/Pedigree',        icon: '📜', type: 'BOOLEAN' },
    { value: 'MEDICAL_CERT_REQUIRED', label: 'Medical certificate',     icon: '🏥', type: 'BOOLEAN' },
    { value: 'ALLOWED_SEXES',         label: 'Allowed sexes',           icon: '⚧',  type: 'LIST'    },
    { value: 'STERILIZATION_REQUIRED',label: 'Sterilization required',  icon: '✂️', type: 'BOOLEAN' },
  ];

  constructor(
    private route:           ActivatedRoute,
    private router:          Router,
    private eventService:    AdminEventService,
    private categoryService: AdminCategoryService,
    private weatherService:  AdminWeatherService,
    private ruleService:     AdminEligibilityRuleService,
    private auth:            AdminAuthService
  ) {}

  ngOnInit() {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit  = true;
      this.eventId = +id;
      this.loadEvent(this.eventId);
    }
  }

  // ── Data loading ───────────────────────────────────────────────────
  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (c) => this.categories = c,
      error: ()  => {}
    });
  }

  loadEvent(id: number) {
    this.eventService.getById(id).subscribe({
      next: (e: EventDetail) => {
        this.form = {
          title:            e.title,
          description:      e.description,
          location:         e.location,
          startDate:        e.startDate?.slice(0, 16),
          endDate:          e.endDate?.slice(0, 16),
          maxParticipants:  e.maxParticipants,
          coverImageUrl:    e.coverImageUrl,
          categoryId:       e.category?.id
        };
        if (e.coverImageUrl)   this.imagePreview = e.coverImageUrl;
        if (e.category?.id)    this.loadInheritedRules(e.category.id);
        if (id)                this.loadEventRules(id);
      }
    });
  }

  loadInheritedRules(categoryId: number) {
    this.ruleService.getByCategory(categoryId).subscribe({
      next: (rules) => this.inheritedRules = rules,
      error: ()     => {}
    });
  }

  loadEventRules(eventId: number) {
    this.ruleService.getByEvent(eventId).subscribe({
      next: (rules) => this.eventSpecificRules = rules,
      error: ()     => {}
    });
  }

  // ── Stepper ────────────────────────────────────────────────────────
  goToStep(index: number) {
    if (index <= this.currentStep) this.currentStep = index;
  }

  nextStep() {
    this.touched = true;
    if (this.currentStep === 0 && !this.step1Valid) return;
    if (this.currentStep === 1 && !this.step2Valid) return;
    this.touched = false;
    this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.touched = false;
    }
  }

  // ── Validation ────────────────────────────────────────────────────
  get step1Valid(): boolean {
    return !!(this.form.title && this.form.description && this.form.categoryId);
  }
  get step2Valid(): boolean {
    return !!(this.form.location && this.form.startDate && this.form.endDate);
  }
  get isValid(): boolean {
    return this.step1Valid && this.step2Valid && this.form.maxParticipants > 0;
  }

  get validationWarnings(): string[] {
    const w: string[] = [];
    if (!this.form.title)           w.push('Event title is required');
    if (!this.form.description)     w.push('Description is required');
    if (!this.form.categoryId)      w.push('Category is required');
    if (!this.form.location)        w.push('Location is required');
    if (!this.form.startDate)       w.push('Start date is required');
    if (!this.form.endDate)         w.push('End date is required');
    if (!this.form.maxParticipants) w.push('Max participants must be > 0');
    return w;
  }

  // ── Category change ───────────────────────────────────────────────
  onCategoryChange() {
    if (this.form.categoryId) {
      this.loadInheritedRules(this.form.categoryId);
    } else {
      this.inheritedRules = [];
    }
  }

  get selectedCategory(): EventCategory | null {
    return this.categories.find(c => c.id === this.form.categoryId) ?? null;
  }

  get inheritedRulesCount(): number { return this.inheritedRules.length; }

  get blockingRulesCount(): number {
    return [...this.inheritedRules, ...this.eventSpecificRules]
      .filter(r => r.hardReject).length;
  }

  get warningRulesCount(): number {
    return [...this.inheritedRules, ...this.eventSpecificRules]
      .filter(r => !r.hardReject).length;
  }

  isInherited(rule: any): boolean {
    return rule.id !== undefined && this.inheritedRules.some(r => r.id === rule.id);
  }

  // ── Rules helpers ─────────────────────────────────────────────────
  toggleAddRuleForm() {
    this.showAddRuleForm = !this.showAddRuleForm;
    if (!this.showAddRuleForm) this.resetNewRule();
  }

  resetNewRule() {
    this.newRule = { 
      hardReject: true, 
      active: true, 
      priority: 0, 
      valueType: 'LIST',
      criteria: undefined
    };
  }

  selectCriteria(opt: { value: string; type: string }) {
    this.newRule.criteria = opt.value as any;
    this.newRule.valueType = opt.type as any;
    this.newRule.listValues = '';
    this.newRule.numericValue = undefined;
    this.newRule.booleanValue = undefined;
  }

  addEventRule() {
    if (!this.newRule.criteria) return;
    
    const ruleToSave: any = {
      criteria: this.newRule.criteria,
      valueType: this.newRule.valueType,
      hardReject: this.newRule.hardReject ?? true,
      active: this.newRule.active ?? true,
      priority: this.newRule.priority ?? 0,
    };
    
    if (this.isListCriteria() && this.newRule.listValues) {
      ruleToSave.listValues = this.newRule.listValues;
    }
    if (this.isNumberCriteria() && this.newRule.numericValue !== undefined) {
      ruleToSave.numericValue = this.newRule.numericValue;
    }
    if (this.isBooleanCriteria() && this.newRule.booleanValue !== undefined) {
      ruleToSave.booleanValue = this.newRule.booleanValue;
    }
    if (this.newRule.rejectionMessage) {
      ruleToSave.rejectionMessage = this.newRule.rejectionMessage;
    }
    
    this.eventSpecificRules.push(ruleToSave);
    this.toggleAddRuleForm();
  }

  removeEventRule(index: number) {
    this.eventSpecificRules.splice(index, 1);
  }

  isListCriteria(): boolean {
    return ['ALLOWED_BREEDS','FORBIDDEN_BREEDS','ALLOWED_SPECIES','ALLOWED_SEXES','ALLOWED_COLORS','FORBIDDEN_COLORS']
      .includes(this.newRule.criteria || '');
  }
  
  isNumberCriteria(): boolean {
    return ['MIN_AGE_MONTHS','MAX_AGE_MONTHS','MIN_WEIGHT_KG','MAX_WEIGHT_KG','MIN_EXPERIENCE_LEVEL']
      .includes(this.newRule.criteria || '');
  }
  
  isBooleanCriteria(): boolean {
    return ['VACCINATION_REQUIRED','LICENSE_REQUIRED','MEDICAL_CERT_REQUIRED','STERILIZATION_REQUIRED']
      .includes(this.newRule.criteria || '');
  }

  getCriteriaLabel(criteria: string | undefined): string {
    if (!criteria) return '—';
    const found = this.criteriaOptions.find(o => o.value === criteria);
    return found?.label ?? criteria;
  }

  parseRuleValues(raw: string | null | undefined): string[] {
    if (!raw) return [];
    return raw.split(',').map(v => v.trim()).filter(v => v.length > 0);
  }

  getUnit(): string {
    const units: Record<string, string> = {
      MIN_AGE_MONTHS: 'months', MAX_AGE_MONTHS: 'months',
      MIN_WEIGHT_KG: 'kg',     MAX_WEIGHT_KG: 'kg',
    };
    return units[this.newRule.criteria || ''] || '';
  }

  getUnitFor(criteria: string | undefined): string {
    if (!criteria) return '';
    const units: Record<string, string> = {
      MIN_AGE_MONTHS: 'months',
      MAX_AGE_MONTHS: 'months',
      MIN_WEIGHT_KG: 'kg',
      MAX_WEIGHT_KG: 'kg',
    };
    return units[criteria] || '';
  }

  // ✅ Méthode pour combiner les règles héritées et spécifiques
  getAllRules(): any[] {
    return [...this.inheritedRules, ...this.eventSpecificRules];
  }

  // ── Duration helper ───────────────────────────────────────────────
  getDuration(): string {
    if (!this.form.startDate || !this.form.endDate) return '';
    const diff = new Date(this.form.endDate).getTime() - new Date(this.form.startDate).getTime();
    if (diff <= 0) return 'Invalid range';
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    if (h === 0) return `${m}min`;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  // ── Weather helpers ───────────────────────────────────────────────
  getWeatherEmoji(condition: string): string {
    const map: Record<string, string> = {
      SUNNY: '☀️', CLOUDY: '⛅', RAINY: '🌧️', STORMY: '⛈️', SNOWY: '❄️', UNKNOWN: '🌤️'
    };
    return map[condition] ?? '🌤️';
  }

  // ── Image ──────────────────────────────────────────────────────────
  get minDate(): string { return new Date().toISOString().slice(0, 16); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => { this.imagePreview = reader.result as string; };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview  = null;
    this.form.coverImageUrl = '';
  }

  uploadImage(): void {
    if (!this.selectedImage) return;
    this.uploadingImage = true;
    const fd = new FormData();
    fd.append('file', this.selectedImage);
    this.eventService.uploadImage(fd).subscribe({
      next:  (r: { url: string }) => {
        const url = `http://localhost:8087/elif${r.url}`;
        this.form.coverImageUrl = url;
        this.imagePreview       = url;
        this.uploadingImage     = false;
        this.selectedImage      = null;
      },
      error: () => {
        this.error          = 'Failed to upload image';
        this.uploadingImage = false;
      }
    });
  }

  onLocationBlur() {
    if (!this.form.location || !this.form.startDate) return;
    const city = this.form.location.split(',').pop()?.trim() || this.form.location;
    this.weatherService.getByCity(city).subscribe({
      next:  (w) => this.weather = w,
      error: ()  => {}
    });
  }

  onDateChange() {
    if (this.form.location && this.form.startDate) this.onLocationBlur();
  }

  // ── Save ───────────────────────────────────────────────────────────
  save() {
    this.touched = true;
    if (!this.isValid) { this.error = 'Please fill all required fields'; return; }

    if (this.selectedImage && !this.form.coverImageUrl) {
      this.uploadImage();
      setTimeout(() => this.saveEvent(), 1200);
    } else {
      this.saveEvent();
    }
  }

  saveEvent(): void {
    this.loading = true;
    this.error   = '';
    this.success = '';

    const userId = this.auth.getAdminId();
    const fd     = new FormData();

    fd.append('title',            this.form.title);
    fd.append('description',      this.form.description || '');
    fd.append('location',         this.form.location);
    fd.append('startDate',        this.form.startDate);
    fd.append('endDate',          this.form.endDate);
    fd.append('maxParticipants',  this.form.maxParticipants.toString());
    fd.append('categoryId',       this.form.categoryId.toString());
    if (this.form.coverImageUrl) fd.append('coverImageUrl', this.form.coverImageUrl);
    if (this.selectedImage)      fd.append('image', this.selectedImage);

    const obs = this.isEdit && this.eventId
      ? this.eventService.updateWithImage(this.eventId, fd, userId)
      : this.eventService.createWithImage(fd, userId);

    obs.subscribe({
      next: (savedEvent: any) => {
        this.loading = false;
        this.success = this.isEdit ? 'Event updated!' : 'Event created!';

        if (this.eventSpecificRules.length > 0 && savedEvent?.id) {
          this.saveEventRules(savedEvent.id);
        } else {
          setTimeout(() => this.router.navigate(['/admin/events']), 1200);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error   = err.error?.message || 'An error occurred. Please try again.';
      }
    });
  }

  private saveEventRules(eventId: number) {
  const userId = this.auth.getAdminId();
  
  const saves = this.eventSpecificRules.map(rule => {
    if (!rule.criteria) {
      console.error('Rule missing criteria - skipping:', rule);
      return Promise.resolve();
    }
    
    if (!rule.valueType) {
      console.error('Rule missing valueType - skipping:', rule);
      return Promise.resolve();
    }
    
    const ruleToSend: any = {
      eventId: eventId,
      criteria: rule.criteria,
      valueType: rule.valueType,
      hardReject: rule.hardReject ?? true,
      active: rule.active ?? true,
      priority: rule.priority ?? 0,
    };
    
    if (rule.valueType === 'LIST' && rule.listValues) {
      ruleToSend.listValues = rule.listValues;
    }
    if (rule.valueType === 'NUMBER' && rule.numericValue !== undefined && rule.numericValue !== null) {
      ruleToSend.numericValue = rule.numericValue;
    }
    if (rule.valueType === 'BOOLEAN' && rule.booleanValue !== undefined && rule.booleanValue !== null) {
      ruleToSend.booleanValue = rule.booleanValue;
    }
    if (rule.rejectionMessage) {
      ruleToSend.rejectionMessage = rule.rejectionMessage;
    }
    
    console.log('Sending rule to backend:', JSON.stringify(ruleToSend, null, 2));
    
    return this.ruleService.create(ruleToSend, userId).toPromise();
  });
  
  // ✅ UN SEUL Promise.allSettled
  Promise.allSettled(saves).then((results) => {
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      console.error('Failed rules:', failed);
      // Afficher les détails des erreurs
      failed.forEach(f => {
        if (f.status === 'rejected') {
          console.error('Error details:', (f as any).reason);
        }
      });
      this.error = `Failed to save ${failed.length} rule(s). Check console for details.`;
    } else {
      console.log('All rules saved successfully');
      setTimeout(() => this.router.navigate(['/admin/events']), 1200);
    }
  });
}
}
