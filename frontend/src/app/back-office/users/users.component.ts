import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminUser, AdminUserService, CreateAdminUserPayload } from '../services/admin-user.service';

@Component({
  selector: 'app-back-office-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  users: AdminUser[] = [];
  loading = true;
  deletingId?: number;
  error = '';
  search = '';
  selectedUser?: AdminUser;
  private requestedSelectedUserId?: number;
  showCreateUserModal = false;

  creatingUser = false;
  createUserError = '';
  createUserSuccess = '';
  newUser: CreateAdminUserPayload = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  constructor(private userService: AdminUserService, private route: ActivatedRoute) {}

  get currentUserId(): number | undefined {
    return this.userService.currentSessionUserId();
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const rawId = params.get('selectedUserId');
      const parsed = rawId ? Number(rawId) : NaN;
      this.requestedSelectedUserId = Number.isFinite(parsed) ? parsed : undefined;

      if (this.requestedSelectedUserId && this.users.length) {
        this.openDetailsById(this.requestedSelectedUserId);
      }
    });

    this.loadUsers();
  }

  get filteredUsers(): AdminUser[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.users;
    return this.users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return fullName.includes(q) || u.email.toLowerCase().includes(q) || String(u.id).includes(q);
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.userService.findAll().subscribe({
      next: (data) => {
        this.users = data;
        if (this.requestedSelectedUserId) {
          this.openDetailsById(this.requestedSelectedUserId);
        } else if (this.selectedUser) {
          this.selectedUser = this.users.find((u) => u.id === this.selectedUser?.id);
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load users right now.';
        this.loading = false;
      }
    });
  }

  deleteUser(user: AdminUser): void {
    if (user.id === this.currentUserId) {
      this.error = 'You cannot delete the account currently signed in.';
      return;
    }

    if (!confirm(`Delete user ${user.firstName} ${user.lastName}?`)) return;

    this.deletingId = user.id;
    this.userService.deleteById(user.id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== user.id);
        if (this.selectedUser?.id === user.id) {
          this.selectedUser = undefined;
        }
        this.deletingId = undefined;
      },
      error: () => {
        this.error = 'Unable to delete user right now.';
        this.deletingId = undefined;
      }
    });
  }

  createUser(): void {
    this.createUserError = '';
    this.createUserSuccess = '';

    const payload: CreateAdminUserPayload = {
      firstName: this.newUser.firstName.trim(),
      lastName: this.newUser.lastName.trim(),
      email: this.newUser.email.trim(),
      password: this.newUser.password
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.password) {
      this.createUserError = 'All fields are required to create a user.';
      return;
    }

    if (payload.password.length < 6) {
      this.createUserError = 'Password must be at least 6 characters.';
      return;
    }

    this.creatingUser = true;
    this.userService.create(payload).subscribe({
      next: (created) => {
        this.createUserSuccess = `${created.firstName} ${created.lastName} created successfully.`;
        this.newUser = { firstName: '', lastName: '', email: '', password: '' };
        this.selectedUser = created;
        this.loadUsers();
        this.showCreateUserModal = false;
        this.creatingUser = false;
      },
      error: () => {
        this.createUserError = 'Unable to create user. Check email uniqueness and try again.';
        this.creatingUser = false;
      }
    });
  }

  openCreateUserModal(): void {
    this.createUserError = '';
    this.showCreateUserModal = true;
  }

  closeCreateUserModal(): void {
    if (this.creatingUser) return;
    this.showCreateUserModal = false;
  }

  openDetails(user: AdminUser): void {
    this.selectedUser = user;
  }

  isSelected(user: AdminUser): boolean {
    return this.selectedUser?.id === user.id;
  }

  canDeleteUser(user: AdminUser): boolean {
    return user.id !== this.currentUserId;
  }

  private openDetailsById(userId: number): void {
    this.selectedUser = this.users.find((u) => u.id === userId);
  }
}
