import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin, of, switchMap } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import {
  PetCareTask,
  PetCareTaskPayload,
  PetGender,
  PetHealthRecord,
  PetHealthRecordPayload,
  PetProfile,
  PetProfilePayload,
  PetSpecies,
  PetTaskRecurrence,
  PetTaskStatus,
  PetTaskUrgency
} from '../../shared/models/pet-profile.model';
import { PetProfileService } from '../../shared/services/pet-profile.service';
import { PetHealthPdfService } from './services/pet-health-pdf.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

interface PetTaskItem {
  id: number;
  title: string;
  category: string;
  urgency: PetTaskUrgency;
  status: PetTaskStatus;
  dueDate: string | null;
  notes: string | null;
  recurrence: PetTaskRecurrence;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-pet-profile-detail',
  templateUrl: './pet-profile-detail.component.html',
  styleUrl: './pet-profile-detail.component.css'
})
export class PetProfileDetailComponent implements OnInit {
  readonly speciesOptions: PetSpecies[] = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'];
  readonly genderOptions: PetGender[] = ['MALE', 'FEMALE', 'UNKNOWN'];
  readonly bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'];
  readonly yesNoUnknownOptions = ['YES', 'NO', 'UNKNOWN'];
  readonly taskStatusColumns: Array<{ key: PetTaskStatus; title: string; subtitle: string; icon: string }> = [
    { key: 'NOW', title: 'Do Now', subtitle: 'Urgent care actions', icon: 'fa-bolt' },
    { key: 'NEXT', title: 'Planned', subtitle: 'Upcoming routine tasks', icon: 'fa-calendar-check' },
    { key: 'DONE', title: 'Completed', subtitle: 'Finished this cycle', icon: 'fa-circle-check' }
  ];
  readonly taskUrgencyOptions: PetTaskUrgency[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  readonly taskRecurrenceOptions: PetTaskRecurrence[] = ['NONE', 'DAILY', 'WEEKLY'];
  readonly taskCategoryOptions = [
    'Feeding',
    'Litter Cleaning',
    'Walk',
    'Grooming',
    'Medication',
    'Playtime',
    'Vet Follow-up',
    'Training',
    'Hydration',
    'Other'
  ];

  pet: PetProfile | null = null;
  loading = false;
  saving = false;
  deleting = false;
  formOpen = false;
  submitAttempted = false;
  photoPreviewUrl: string | null = null;
  selectedPhotoFile: File | null = null;
  uploadingPhoto = false;
  isDragActive = false;
  error = '';
  success = '';
  loadingHealth = false;
  savingHealth = false;
  deletingHealthId: number | null = null;
  healthRecords: PetHealthRecord[] = [];
  petTasks: PetTaskItem[] = [];
  generatingPdf = false;
  healthFormOpen = false;
  taskFormOpen = false;
  taskSubmitAttempted = false;
  activeDropColumn: PetTaskStatus | null = null;
  editingHealthRecordId: number | null = null;
  healthSubmitAttempted = false;

  petForm: FormGroup;
  healthForm: FormGroup;
  taskForm: FormGroup;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly petProfileService: PetProfileService,
    private readonly confirmDialogService: ConfirmDialogService,
    @Inject(PetHealthPdfService) private readonly petHealthPdfService: PetHealthPdfService
  ) {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s]+$/)]], 
      weight: [null, [Validators.min(0.01)]],
      species: ['DOG', [Validators.required]],
      breed: ['', [Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s]*$/)]],
      dateOfBirth: ['', [Validators.required, this.pastOrTodayDateValidator()]],
      gender: ['UNKNOWN', [Validators.required]],
      photoUrl: ['', [Validators.pattern(/^$|^https?:\/\/.+/i), Validators.maxLength(500)]]
    });

    this.healthForm = this.fb.group({
      recordDate: ['', [Validators.required]],
      visitType: ['', [Validators.required, Validators.maxLength(80)]],
      veterinarian: ['', [Validators.maxLength(120)]],
      clinicName: ['', [Validators.maxLength(120)]],
      bloodType: ['UNKNOWN', [Validators.required]],
      spayedNeutered: ['UNKNOWN', [Validators.required]],
      allergies: ['', [Validators.maxLength(1000)]],
      chronicConditions: ['', [Validators.maxLength(1000)]],
      previousOperations: ['', [Validators.maxLength(1000)]],
      vaccinationHistory: ['', [Validators.maxLength(1000)]],
      specialDiet: ['', [Validators.maxLength(500)]],
      parasitePrevention: ['', [Validators.maxLength(500)]],
      emergencyInstructions: ['', [Validators.maxLength(1000)]],
      diagnosis: ['', [Validators.maxLength(255)]],
      treatment: ['', [Validators.maxLength(500)]],
      medications: ['', [Validators.maxLength(500)]],
      notes: ['', [Validators.maxLength(1000)]],
      nextVisitDate: ['']
    }, { validators: this.nextVisitDateValidator() });

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(90)]],
      category: ['Feeding', [Validators.required]],
      urgency: ['HIGH', [Validators.required]],
      status: ['NOW', [Validators.required]],
      dueDate: [''],
      recurrence: ['DAILY', [Validators.required]],
      notes: ['', [Validators.maxLength(260)]]
    });
  }

  ngOnInit(): void {
    this.loadPet();
  }

  loadPet(): void {
    const userId = this.getCurrentUserId();
    const petId = Number(this.route.snapshot.paramMap.get('id'));
    if (!userId || !petId) {
      this.error = 'Invalid pet profile link.';
      return;
    }

    this.loading = true;
    this.loadingHealth = true;
    this.error = '';
    this.success = '';
    forkJoin({
      pet: this.petProfileService.getMyPetById(userId, petId),
      history: this.petProfileService.getMyPetHealthHistory(userId, petId)
    }).subscribe({
      next: ({ pet, history }) => {
        this.pet = pet;
        this.healthRecords = history;
        this.loadTasksForPet(userId, pet.id);
        this.loading = false;
        this.loadingHealth = false;
      },
      error: (err) => {
        this.error = this.extractError(err, 'Unable to load this pet profile.');
        this.loading = false;
        this.loadingHealth = false;
      }
    });
  }

  openHealthForm(record?: PetHealthRecord): void {
    this.healthFormOpen = true;
    this.healthSubmitAttempted = false;
    this.success = '';
    this.error = '';

    if (!record) {
      this.editingHealthRecordId = null;
      this.healthForm.reset({
        recordDate: this.todayDateInput(),
        visitType: '',
        veterinarian: '',
        clinicName: '',
        bloodType: 'UNKNOWN',
        spayedNeutered: 'UNKNOWN',
        allergies: '',
        chronicConditions: '',
        previousOperations: '',
        vaccinationHistory: '',
        specialDiet: '',
        parasitePrevention: '',
        emergencyInstructions: '',
        diagnosis: '',
        treatment: '',
        medications: '',
        notes: '',
        nextVisitDate: ''
      });
      return;
    }

    this.editingHealthRecordId = record.id;
    this.healthForm.patchValue({
      recordDate: record.recordDate,
      visitType: record.visitType,
      veterinarian: record.veterinarian ?? '',
      clinicName: record.clinicName ?? '',
      bloodType: record.bloodType ?? 'UNKNOWN',
      spayedNeutered: record.spayedNeutered ?? 'UNKNOWN',
      allergies: record.allergies ?? '',
      chronicConditions: record.chronicConditions ?? '',
      previousOperations: record.previousOperations ?? '',
      vaccinationHistory: record.vaccinationHistory ?? '',
      specialDiet: record.specialDiet ?? '',
      parasitePrevention: record.parasitePrevention ?? '',
      emergencyInstructions: record.emergencyInstructions ?? '',
      diagnosis: record.diagnosis ?? '',
      treatment: record.treatment ?? '',
      medications: record.medications ?? '',
      notes: record.notes ?? '',
      nextVisitDate: record.nextVisitDate ?? ''
    });
  }

  cancelHealthForm(): void {
    this.healthFormOpen = false;
    this.editingHealthRecordId = null;
    this.healthSubmitAttempted = false;
    this.savingHealth = false;
  }

  saveHealthRecord(): void {
    this.healthSubmitAttempted = true;
    const userId = this.getCurrentUserId();
    if (!userId || !this.pet) {
      return;
    }
    if (this.healthForm.invalid) {
      this.healthForm.markAllAsTouched();
      return;
    }

    this.savingHealth = true;
    this.error = '';
    this.success = '';

    const payload = this.toHealthPayload();
    const editingRecordId = this.editingHealthRecordId;
    const isEdit = editingRecordId !== null;
    const request$ = isEdit
      ? this.petProfileService.updateMyPetHealthRecord(userId, this.pet.id, editingRecordId, payload)
      : this.petProfileService.createMyPetHealthRecord(userId, this.pet.id, payload);

    request$.subscribe({
      next: (savedRecord) => {
        if (this.editingHealthRecordId) {
          this.healthRecords = this.healthRecords.map((record) => record.id === savedRecord.id ? savedRecord : record);
        } else {
          this.healthRecords = [savedRecord, ...this.healthRecords];
        }
        this.healthRecords = this.sortHealthRecords(this.healthRecords);
        this.savingHealth = false;
        this.healthFormOpen = false;
        this.editingHealthRecordId = null;
        this.healthSubmitAttempted = false;
        this.success = isEdit
          ? 'Health record updated successfully.'
          : 'Health record added successfully.';
      },
      error: (err) => {
        this.savingHealth = false;
        this.error = this.extractError(err, 'Unable to save health record.');
      }
    });
  }

  async deleteHealthRecord(record: PetHealthRecord): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId || !this.pet) {
      return;
    }

    const confirmed = await firstValueFrom(this.confirmDialogService.confirm(
      `Delete this ${record.visitType.toLowerCase()} record?`,
      {
        title: 'Delete health record',
        confirmText: 'Delete record',
        cancelText: 'Keep record',
        tone: 'danger'
      }
    ));
    if (!confirmed) {
      return;
    }

    this.deletingHealthId = record.id;
    this.error = '';
    this.success = '';

    this.petProfileService.deleteMyPetHealthRecord(userId, this.pet.id, record.id).subscribe({
      next: () => {
        this.healthRecords = this.healthRecords.filter((item) => item.id !== record.id);
        this.deletingHealthId = null;
        this.success = 'Health record removed successfully.';
      },
      error: (err) => {
        this.deletingHealthId = null;
        this.error = this.extractError(err, 'Unable to delete health record.');
      }
    });
  }

  async downloadHealthCardPdf(): Promise<void> {
    if (!this.pet) {
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Please sign in to download the health card.';
      return;
    }

    this.generatingPdf = true;
    this.error = '';
    try {
      await this.petHealthPdfService.generateHealthCardPdf(this.pet, this.healthRecords, {
        fullName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Pet Owner'
      });
    } catch {
      this.error = 'Unable to generate health card PDF.';
    } finally {
      this.generatingPdf = false;
    }
  }

  openEdit(): void {
    if (!this.pet) {
      return;
    }
    this.formOpen = true;
    this.submitAttempted = false;
    this.success = '';
    this.petForm.patchValue({
      name: this.pet.name,
      weight: this.pet.weight,
      species: this.pet.species,
      breed: this.pet.breed ?? '',
      dateOfBirth: this.pet.dateOfBirth ?? '',
      gender: this.pet.gender,
      photoUrl: this.toHttpUrlOrEmpty(this.pet.photoUrl)
    });
    this.photoPreviewUrl = this.pet.photoUrl ?? null;
    this.clearSelectedFile();
  }

  cancelEdit(): void {
    this.formOpen = false;
    this.submitAttempted = false;
    this.clearSelectedPhoto();
    this.uploadingPhoto = false;
    this.success = '';
  }

  saveEdit(): void {
    this.submitAttempted = true;
    const userId = this.getCurrentUserId();
    if (!userId || !this.pet) {
      return;
    }
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.uploadingPhoto = false;
    this.error = '';
    this.success = '';

    this.petProfileService.updateMyPet(userId, this.pet.id, this.toPayload()).pipe(
      switchMap((updatedPet) => {
        if (!this.selectedPhotoFile) {
          return of(updatedPet);
        }
        this.uploadingPhoto = true;
        return this.petProfileService.uploadMyPetPhoto(userId, updatedPet.id, this.selectedPhotoFile);
      })
    ).subscribe({
      next: (updated) => {
        this.pet = updated;
        this.saving = false;
        this.uploadingPhoto = false;
        this.formOpen = false;
        this.submitAttempted = false;
        this.clearSelectedPhoto();
        this.success = 'Pet profile updated successfully.';
      },
      error: (err) => {
        this.saving = false;
        this.uploadingPhoto = false;
        this.error = this.extractError(err, 'Unable to update pet profile.');
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.applySelectedFile(file);
    input.value = '';
  }

  openFilePicker(input: HTMLInputElement): void {
    input.click();
  }

  onUploadDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = true;
  }

  onUploadDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = false;
  }

  onUploadDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.applySelectedFile(file);
      return;
    }

    const droppedUrl = (event.dataTransfer?.getData('text/uri-list') || event.dataTransfer?.getData('text/plain') || '').trim();
    if (this.isHttpUrl(droppedUrl)) {
      this.petForm.patchValue({ photoUrl: droppedUrl });
      this.syncPhotoUrlPreview();
      this.success = 'Image URL added from drop.';
    }
  }

  onUploadPaste(event: ClipboardEvent): void {
    const clipboard = event.clipboardData;
    if (!clipboard) {
      return;
    }

    const imageItem = Array.from(clipboard.items).find((item) => item.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        event.preventDefault();
        this.applySelectedFile(file);
      }
      return;
    }

    const pastedText = (clipboard.getData('text/plain') || '').trim();
    if (this.isHttpUrl(pastedText)) {
      event.preventDefault();
      this.petForm.patchValue({ photoUrl: pastedText });
      this.syncPhotoUrlPreview();
      this.success = 'Image URL pasted successfully.';
    }
  }

  removeSelectedPhoto(): void {
    this.clearSelectedPhoto();
    this.petForm.patchValue({ photoUrl: '' });
  }

  syncPhotoUrlPreview(): void {
    const url = this.toHttpUrlOrEmpty(this.petForm.get('photoUrl')?.value ?? null);
    if (url) {
      this.clearSelectedFile();
      this.photoPreviewUrl = url;
      return;
    }

    if (!this.selectedPhotoFile) {
      this.photoPreviewUrl = null;
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.petForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  hasControlError(controlName: string, errorKey: string): boolean {
    return !!this.petForm.get(controlName)?.errors?.[errorKey] && this.isInvalid(controlName);
  }

  isHealthInvalid(controlName: string): boolean {
    const control = this.healthForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  hasHealthControlError(controlName: string, errorKey: string): boolean {
    return !!this.healthForm.get(controlName)?.errors?.[errorKey] && this.isHealthInvalid(controlName);
  }

  hasHealthFormError(errorKey: string): boolean {
    return !!this.healthForm.errors?.[errorKey] && this.healthSubmitAttempted;
  }

  get latestHealthRecord(): PetHealthRecord | null {
    return this.healthRecords.length ? this.healthRecords[0] : null;
  }

  get upcomingVisitCount(): number {
    return this.healthRecords.filter((record) => {
      if (!record.nextVisitDate) {
        return false;
      }
      const nextVisit = new Date(record.nextVisitDate);
      if (Number.isNaN(nextVisit.getTime())) {
        return false;
      }
      return nextVisit >= this.startOfToday();
    }).length;
  }

  get healthCardStatus(): string {
    if (!this.healthRecords.length) {
      return 'No records yet';
    }
    return this.upcomingVisitCount > 0 ? 'Follow-up scheduled' : 'Up to date';
  }

  get healthScore(): number {
    const recordCount = this.healthRecords.length;
    if (!recordCount) {
      return 0;
    }

    const latestRecord = this.latestHealthRecord;
    const latestAgeDays = latestRecord ? this.getDateDifferenceInDays(latestRecord.recordDate, this.todayDateInput()) : 999;
    let score = 48 + Math.min(recordCount * 7, 22);

    if (this.upcomingVisitCount > 0) {
      score += 10;
    }

    if (latestAgeDays <= 30) {
      score += 14;
    } else if (latestAgeDays <= 90) {
      score += 8;
    } else if (latestAgeDays > 180) {
      score -= 8;
    }

    if (latestRecord?.vaccinationHistory) {
      score += 4;
    }

    if (latestRecord?.notes) {
      score += 2;
    }

    return Math.max(0, Math.min(100, score));
  }

  get healthScoreLabel(): string {
    if (!this.healthRecords.length) {
      return 'No data';
    }
    if (this.healthScore >= 85) {
      return 'Excellent';
    }
    if (this.healthScore >= 65) {
      return 'Healthy';
    }
    if (this.healthScore >= 45) {
      return 'Watch closely';
    }
    return 'Needs attention';
  }

  get healthScoreSubtitle(): string {
    if (!this.healthRecords.length) {
      return 'Add the first health visit to activate the card.';
    }
    return this.upcomingVisitCount > 0
      ? 'A follow-up is on the calendar.'
      : 'No upcoming visit scheduled right now.';
  }

  get healthScoreDescription(): string {
    if (!this.healthRecords.length) {
      return 'The card will populate once the first veterinary record is saved.';
    }
    return `Based on ${this.healthRecords.length} record${this.healthRecords.length === 1 ? '' : 's'}, recent updates, and scheduled follow-ups.`;
  }

  get healthRingCircumference(): number {
    return 2 * Math.PI * 46;
  }

  get healthRingDashOffset(): number {
    return this.healthRingCircumference * (1 - this.healthScore / 100);
  }

  get healthTrendBars(): Array<{ label: string; month: string; count: number; height: number; intensity: string }> {
    const buckets = new Map<string, number>();
    const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'short' });

    for (let offset = 5; offset >= 0; offset--) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - offset);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, 0);
    }

    for (const record of this.healthRecords) {
      const date = new Date(record.recordDate);
      if (Number.isNaN(date.getTime())) {
        continue;
      }
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }

    const maxCount = Math.max(1, ...buckets.values());

    return Array.from(buckets.entries()).map(([key, count]) => {
      const [year, month] = key.split('-').map((value) => Number(value));
      const date = new Date(year, month - 1, 1);
      const label = monthFormatter.format(date);
      return {
        label,
        month: key,
        count,
        height: Math.max(18, (count / maxCount) * 100),
        intensity: this.getTrendIntensityClass(count, maxCount)
      };
    });
  }

  get visitTypeBreakdown(): Array<{ label: string; value: number; share: number; width: string }> {
    const counts = new Map<string, number>();

    for (const record of this.healthRecords) {
      const label = this.normalizeHealthLabel(record.visitType || 'Other');
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    const total = Math.max(1, this.healthRecords.length);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, value]) => ({
        label,
        value,
        share: Math.round((value / total) * 100),
        width: `${(value / total) * 100}%`
      }));
  }

  get healthHighlights(): Array<{ label: string; value: string; tone: string }> {
    const latestRecord = this.latestHealthRecord;
    return [
      { label: 'Status', value: this.healthCardStatus, tone: 'neutral' },
      { label: 'Score', value: `${this.healthScore}/100`, tone: this.healthScore >= 65 ? 'good' : this.healthScore >= 45 ? 'warn' : 'danger' },
      { label: 'Upcoming', value: `${this.upcomingVisitCount}`, tone: this.upcomingVisitCount > 0 ? 'good' : 'neutral' },
      { label: 'Last Check', value: latestRecord ? this.formatDate(latestRecord.recordDate) : 'Not available', tone: latestRecord ? 'good' : 'neutral' }
    ];
  }

  get totalOpenTasks(): number {
    return this.petTasks.filter((task) => task.status !== 'DONE').length;
  }

  get criticalTaskCount(): number {
    return this.petTasks.filter((task) => task.status !== 'DONE' && task.urgency === 'CRITICAL').length;
  }

  get dueTodayTaskCount(): number {
    const today = this.todayDateInput();
    return this.petTasks.filter((task) => task.status !== 'DONE' && task.dueDate === today).length;
  }

  get completedTaskCount(): number {
    return this.petTasks.filter((task) => task.status === 'DONE').length;
  }

  get nextUrgentTask(): PetTaskItem | null {
    const activeTasks = this.petTasks.filter((task) => task.status !== 'DONE');
    return activeTasks.length ? activeTasks[0] : null;
  }

  getTaskCards(status: PetTaskStatus): PetTaskItem[] {
    return this.petTasks.filter((task) => task.status === status);
  }

  trackByTaskId(_: number, task: PetTaskItem): number {
    return task.id;
  }

  openTaskForm(): void {
    this.taskFormOpen = true;
    this.taskSubmitAttempted = false;
    this.error = '';
    this.success = '';
    this.taskForm.reset({
      title: '',
      category: 'Feeding',
      urgency: 'HIGH',
      status: 'NOW',
      dueDate: this.todayDateInput(),
      recurrence: 'DAILY',
      notes: ''
    });
  }

  cancelTaskForm(): void {
    this.taskFormOpen = false;
    this.taskSubmitAttempted = false;
  }

  createTask(): void {
    this.taskSubmitAttempted = true;
    const userId = this.getCurrentUserId();
    if (!this.pet || !userId || this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const payload = this.toTaskPayload();
    this.petProfileService.createMyPetTask(userId, this.pet.id, payload).subscribe({
      next: (savedTask) => {
        this.petTasks = this.sortTasks([...this.petTasks, this.normalizeApiTask(savedTask)]);
        this.success = 'Task added to your pet board.';
        this.taskFormOpen = false;
        this.taskSubmitAttempted = false;
      },
      error: (err) => {
        this.error = this.extractError(err, 'Unable to save task.');
      }
    });
  }

  moveTask(task: PetTaskItem, status: PetTaskStatus): void {
    const userId = this.getCurrentUserId();
    if (!this.pet || !userId || task.status === status) {
      return;
    }

    const updatedTask: PetTaskItem = {
      ...task,
      status,
      updatedAt: new Date().toISOString()
    };

    this.petProfileService.updateMyPetTask(userId, this.pet.id, Number(task.id), this.toTaskPayloadFromTask(updatedTask)).subscribe({
      next: (savedTask) => {
        const normalized = this.normalizeApiTask(savedTask);
        this.petTasks = this.sortTasks(this.petTasks.map((item) => item.id === normalized.id ? normalized : item));
        this.success = 'Task moved successfully.';
      },
      error: (err) => {
        this.error = this.extractError(err, 'Unable to update task.');
      }
    });
  }

  onTaskDragStart(event: DragEvent, task: PetTaskItem): void {
    if (!event.dataTransfer) {
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/task-id', String(task.id));
  }

  onColumnDragOver(event: DragEvent, status: PetTaskStatus): void {
    event.preventDefault();
    this.activeDropColumn = status;
  }

  onColumnDragLeave(status: PetTaskStatus): void {
    if (this.activeDropColumn === status) {
      this.activeDropColumn = null;
    }
  }

  onColumnDrop(event: DragEvent, status: PetTaskStatus): void {
    event.preventDefault();
    this.activeDropColumn = null;
    const taskId = event.dataTransfer?.getData('text/task-id') ?? '';
    if (!taskId) {
      return;
    }

    const task = this.petTasks.find((item) => String(item.id) === taskId);
    if (!task) {
      return;
    }

    this.moveTask(task, status);
  }

  clearDragState(): void {
    this.activeDropColumn = null;
  }

  async removeTask(task: PetTaskItem): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!this.pet || !userId) {
      return;
    }

    const confirmed = await firstValueFrom(this.confirmDialogService.confirm(
      `Delete task "${task.title}"?`,
      {
        title: 'Delete care task',
        confirmText: 'Delete task',
        cancelText: 'Keep task',
        tone: 'danger'
      }
    ));
    if (!confirmed) {
      return;
    }

    this.petProfileService.deleteMyPetTask(userId, this.pet.id, Number(task.id)).subscribe({
      next: () => {
        this.petTasks = this.petTasks.filter((item) => item.id !== task.id);
        this.success = 'Task removed from board.';
      },
      error: (err) => {
        this.error = this.extractError(err, 'Unable to delete task.');
      }
    });
  }

  getUrgencyClass(urgency: PetTaskUrgency): string {
    switch (urgency) {
      case 'CRITICAL':
        return 'urgency-critical';
      case 'HIGH':
        return 'urgency-high';
      case 'MEDIUM':
        return 'urgency-medium';
      default:
        return 'urgency-low';
    }
  }

  formatUrgency(urgency: PetTaskUrgency): string {
    return urgency.charAt(0) + urgency.slice(1).toLowerCase();
  }

  formatRecurrence(recurrence: PetTaskRecurrence): string {
    if (recurrence === 'NONE') {
      return 'One-time';
    }
    return recurrence.charAt(0) + recurrence.slice(1).toLowerCase();
  }

  async deletePet(): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId || !this.pet) {
      return;
    }

    const confirmed = await firstValueFrom(this.confirmDialogService.confirm(
      `Delete ${this.pet.name}'s profile? This removes health history and care tasks.`,
      {
        title: 'Delete pet profile',
        confirmText: 'Delete pet',
        cancelText: 'Keep pet',
        tone: 'danger'
      }
    ));
    if (!confirmed) {
      return;
    }

    this.deleting = true;
    this.error = '';
    this.success = '';
    this.petProfileService.deleteMyPet(userId, this.pet.id).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/app/pets']);
      },
      error: (err) => {
        this.deleting = false;
        this.error = this.extractError(err, 'Unable to delete pet profile.');
      }
    });
  }

  getDisplayAge(): string {
    if (!this.pet) {
      return 'Unknown';
    }
    return this.pet.ageDisplay || 'Unknown';
  }

  formatDate(dateText: string | null): string {
    if (!dateText) {
      return 'Unknown';
    }
    const parsed = new Date(dateText);
    if (Number.isNaN(parsed.getTime())) {
      return 'Unknown';
    }
    return parsed.toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/app/pets']);
  }

  private getCurrentUserId(): number | null {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.error = 'Please sign in to access pet profiles.';
      return null;
    }
    return user.id;
  }

  private toPayload(): PetProfilePayload {
    const value = this.petForm.value;
    return {
      name: String(value.name ?? '').trim(),
      weight: this.toNumber(value.weight),
      species: value.species as PetSpecies,
      breed: this.toText(value.breed),
      dateOfBirth: this.toText(value.dateOfBirth),
      gender: value.gender as PetGender,
      photoUrl: this.toText(value.photoUrl)
    };
  }

  private toHealthPayload(): PetHealthRecordPayload {
    const value = this.healthForm.value;
    return {
      recordDate: String(value.recordDate ?? '').trim(),
      visitType: String(value.visitType ?? '').trim(),
      veterinarian: this.toText(value.veterinarian),
      clinicName: this.toText(value.clinicName),
      bloodType: this.toText(value.bloodType),
      spayedNeutered: this.toText(value.spayedNeutered),
      allergies: this.toText(value.allergies),
      chronicConditions: this.toText(value.chronicConditions),
      previousOperations: this.toText(value.previousOperations),
      vaccinationHistory: this.toText(value.vaccinationHistory),
      specialDiet: this.toText(value.specialDiet),
      parasitePrevention: this.toText(value.parasitePrevention),
      emergencyInstructions: this.toText(value.emergencyInstructions),
      diagnosis: this.toText(value.diagnosis),
      treatment: this.toText(value.treatment),
      medications: this.toText(value.medications),
      notes: this.toText(value.notes),
      nextVisitDate: this.toText(value.nextVisitDate)
    };
  }

  private toTaskPayload(): PetCareTaskPayload {
    const value = this.taskForm.value;
    return {
      title: String(value.title ?? '').trim(),
      category: String(value.category ?? 'Other').trim() || 'Other',
      urgency: (value.urgency as PetTaskUrgency) ?? 'MEDIUM',
      status: (value.status as PetTaskStatus) ?? 'NOW',
      dueDate: this.toText(value.dueDate),
      notes: this.toText(value.notes),
      recurrence: (value.recurrence as PetTaskRecurrence) ?? 'NONE'
    };
  }

  private toTaskPayloadFromTask(task: PetTaskItem): PetCareTaskPayload {
    return {
      title: task.title,
      category: task.category,
      urgency: task.urgency,
      status: task.status,
      dueDate: task.dueDate,
      notes: task.notes,
      recurrence: task.recurrence
    };
  }

  private sortHealthRecords(records: PetHealthRecord[]): PetHealthRecord[] {
    return [...records].sort((first, second) => {
      const firstDate = new Date(first.recordDate).getTime();
      const secondDate = new Date(second.recordDate).getTime();
      if (firstDate !== secondDate) {
        return secondDate - firstDate;
      }
      return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    });
  }

  private todayDateInput(): string {
    return new Date().toISOString().split('T')[0];
  }

  private startOfToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private getDateDifferenceInDays(earlierDateText: string, laterDateText: string): number {
    const earlierDate = new Date(earlierDateText);
    const laterDate = new Date(laterDateText);
    if (Number.isNaN(earlierDate.getTime()) || Number.isNaN(laterDate.getTime())) {
      return 999;
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.max(0, Math.floor((laterDate.getTime() - earlierDate.getTime()) / millisecondsPerDay));
  }

  private normalizeHealthLabel(value: string): string {
    return value
      .trim()
      .replace(/[_-]+/g, ' ')
      .split(/\s+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  private getTrendIntensityClass(count: number, maxCount: number): string {
    if (count === 0) {
      return 'empty';
    }
    const ratio = count / maxCount;
    if (ratio >= 0.85) {
      return 'peak';
    }
    if (ratio >= 0.55) {
      return 'mid';
    }
    return 'low';
  }

  private toText(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    const text = String(value).trim();
    return text.length ? text : null;
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  private toHttpUrlOrEmpty(value: string | null): string {
    if (!value) {
      return '';
    }
    return /^https?:\/\//i.test(value) ? value : '';
  }

  private applySelectedFile(file: File): void {
    this.clearSelectedPhoto();

    if (!file.type.startsWith('image/')) {
      this.error = 'Please select an image file.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Image size must be 5MB or less.';
      return;
    }

    this.selectedPhotoFile = file;
    this.photoPreviewUrl = URL.createObjectURL(file);
    this.petForm.patchValue({ photoUrl: '' });
    this.error = '';
    this.success = 'Image selected successfully.';
  }

  private clearSelectedFile(): void {
    if (this.photoPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreviewUrl);
      this.photoPreviewUrl = null;
    }
    this.selectedPhotoFile = null;
  }

  private clearSelectedPhoto(): void {
    this.clearSelectedFile();
    this.photoPreviewUrl = null;
  }

  private isHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
  }

  private extractError(err: unknown, fallback: string): string {
    const apiError = err as { error?: { error?: string; message?: string } };
    return apiError?.error?.error || apiError?.error?.message || fallback;
  }

  private loadTasksForPet(userId: number, petId: number): void {
    this.petProfileService.getMyPetTasks(userId, petId).subscribe({
      next: (tasks) => {
        this.petTasks = this.sortTasks(tasks.map((task) => this.normalizeApiTask(task)));
      },
      error: (err) => {
        this.petTasks = [];
        this.error = this.extractError(err, 'Unable to load care tasks.');
      }
    });
  }

  private normalizeApiTask(source: PetCareTask): PetTaskItem {
    return {
      id: source.id,
      title: source.title,
      category: source.category,
      urgency: source.urgency,
      status: source.status,
      dueDate: source.dueDate,
      notes: source.notes,
      recurrence: source.recurrence,
      createdAt: source.createdAt,
      updatedAt: source.updatedAt
    };
  }

  private sortTasks(tasks: PetTaskItem[]): PetTaskItem[] {
    const statusRank: Record<PetTaskStatus, number> = { NOW: 0, NEXT: 1, DONE: 2 };
    const urgencyRank: Record<PetTaskUrgency, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const maxDate = Number.MAX_SAFE_INTEGER;

    const uniqueTasks = Array.from(
      new Map(tasks.map((task) => [task.id, task])).values()
    );

    return uniqueTasks.sort((a, b) => {
      const statusDiff = statusRank[a.status] - statusRank[b.status];
      if (statusDiff !== 0) {
        return statusDiff;
      }

      const urgencyDiff = urgencyRank[a.urgency] - urgencyRank[b.urgency];
      if (urgencyDiff !== 0) {
        return urgencyDiff;
      }

      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : maxDate;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : maxDate;
      if (aDue !== bDue) {
        return aDue - bDue;
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  private pastOrTodayDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const selectedDate = new Date(value);
      if (Number.isNaN(selectedDate.getTime())) {
        return { invalidDate: true };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      return selectedDate > today ? { futureDate: true } : null;
    };
  }

  private nextVisitDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const recordDateValue = control.get('recordDate')?.value;
      const nextVisitDateValue = control.get('nextVisitDate')?.value;

      if (!recordDateValue || !nextVisitDateValue) {
        return null;
      }

      const recordDate = new Date(recordDateValue);
      const nextVisitDate = new Date(nextVisitDateValue);
      if (Number.isNaN(recordDate.getTime()) || Number.isNaN(nextVisitDate.getTime())) {
        return null;
      }

      return nextVisitDate < recordDate ? { nextVisitBeforeRecord: true } : null;
    };
  }
}
