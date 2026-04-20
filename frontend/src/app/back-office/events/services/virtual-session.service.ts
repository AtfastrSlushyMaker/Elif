import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// ── Modèles ──────────────────────────────────────────────────────

export type VirtualSessionStatus = 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'ARCHIVED';

/**
 * Réponse complète de la session virtuelle.
 * Tous les champs correspondent exactement au backend VirtualSessionResponse.java
 */
export interface VirtualSessionResponse {
  id:                       number;
  eventId:                  number;
  eventTitle:               string;

  /** URL Jitsi — null si canJoinNow=false */
  roomUrl:                  string | null;

  earlyAccessMinutes:       number;
  attendanceThresholdPercent: number;
  status:                   VirtualSessionStatus;

  openedAt:                 string | null;
  closedAt:                 string | null;
  accessWindowStart:        string;
  accessWindowEnd:          string;

  // ── Flags calculés côté backend ──────────────────────────────

  /** L'utilisateur peut rejoindre maintenant */
  canJoinNow:               boolean;

  /** L'admin a déjà rejoint et démarré la session */
  sessionStarted:           boolean;

  /** L'utilisateur appelant est un participant CONFIRMED */
  isConfirmedParticipant:   boolean;

  /**
   * CONFIRMED + OPEN + !sessionStarted
   * → le panel affiche "⏳ Waiting for organizer"
   */
  waitingForModerator:      boolean;

  /** Mot de passe modérateur — uniquement pour l'admin */
  moderatorPassword:        string | null;

  /** Message contextuel affiché dans le panel */
  statusMessage:            string;
}

/**
 * Réponse à une tentative de connexion (join).
 */
export interface JoinSessionResponse {
  canJoin:             boolean;
  roomUrl:             string | null;
  accessToken:         string | null;
  joinedAt:            string | null;
  message:             string;
  isModerator:         boolean;
  isExternal:          boolean;
  /** true si la salle est ouverte mais l'admin n'a pas encore démarré */
  waitingForModerator: boolean;
}

export interface SessionStatsResponse {
  sessionId:           number;
  eventTitle:          string;
  totalRegistered:     number;
  totalJoined:         number;
  averageAttendance:   number;
  certificatesEarned:  number;
  participantDetails:  AttendanceResponse[];
}

export interface AttendanceResponse {
  userId:               number;
  userName:             string;
  sessionId:            number;
  joinedAt:             string | null;
  leftAt:               string | null;
  totalMinutesPresent:  number;
  attendancePercent:    number | null;
  certificateEarned:    boolean;
  certificateUrl:       string | null;
  currentlyConnected:   boolean;
}

export interface CreateVirtualSessionRequest {
  earlyAccessMinutes:        number;
  attendanceThresholdPercent: number;
  externalRoomUrl:           string | null;
}

// ── Service ──────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class VirtualSessionService {

  private readonly BASE = 'http://localhost:8087/elif/api/events';

  constructor(private http: HttpClient) {}

  // ── Admin : créer la session ──────────────────────────────────

  /**
   * POST /api/events/{id}/virtual
   * Crée la salle virtuelle pour l'événement.
   * La réponse contient le moderatorPassword à afficher dans le back-office.
   */
  createSession(
    eventId: number,
    adminId: number,
    request: CreateVirtualSessionRequest
  ): Observable<VirtualSessionResponse> {
    return this.http.post<VirtualSessionResponse>(
      `${this.BASE}/${eventId}/virtual`,
      request,
      { params: { userId: adminId.toString() } }
    );
  }

  // ── Lire la session (frontend public) ─────────────────────────

  /**
   * GET /api/events/{id}/virtual?userId=X
   * Retourne null (204) si aucune session configurée → le panel ne s'affiche pas.
   */
  getSession(eventId: number, userId: number | null): Observable<VirtualSessionResponse | null> {
  // 1. Initialiser HttpParams
  let params = new HttpParams();

  // 2. Ajouter le paramètre uniquement s'il existe
  if (userId !== null) {
    params = params.set('userId', userId.toString());
  }

  // 3. Utiliser params dans l'appel http
  return this.http.get<VirtualSessionResponse>(
    `${this.BASE}/${eventId}/virtual`,
    { params, observe: 'response' }
  ).pipe(
    map(r => r.status === 204 ? null : r.body),
    catchError(() => of(null))
  );
}

  // ── Lire la session (back-office admin avec mot de passe) ──────

  /**
   * GET /api/events/{id}/virtual/admin?userId=X
   * Retourne la réponse complète incluant moderatorPassword.
   */
  getSessionForAdmin(eventId: number, adminId: number): Observable<VirtualSessionResponse | null> {
    return this.http.get<VirtualSessionResponse>(
      `${this.BASE}/${eventId}/virtual/admin`,
      { params: { userId: adminId.toString() } }
    ).pipe(catchError(() => of(null)));
  }

  // ── Modérateur : démarrer la session ──────────────────────────

  /**
   * POST /api/events/{id}/virtual/join/moderator?userId=X&password=Y
   *
   * Scénario :
   *   1. L'admin ouvre le back-office → voit le mot de passe (ex: ELIF-42-2026-A3F2)
   *   2. Il va sur le front-office → entre le mot de passe dans le panel
   *   3. Si correct → session démarrée, tous les participants CONFIRMED notifiés
   *   4. URL Jitsi retournée avec displayName "[MOD]"
   */
  joinAsModerator(
    eventId: number,
    adminId: number,
    password: string
  ): Observable<JoinSessionResponse> {
    return this.http.post<JoinSessionResponse>(
      `${this.BASE}/${eventId}/virtual/join/moderator`,
      null,
      { params: { userId: adminId.toString(), password } }
    );
  }

  // ── Participant : rejoindre la salle ──────────────────────────

  /**
   * POST /api/events/{id}/virtual/join/participant?userId=X
   *
   * Réponses possibles :
   *   canJoin=true  + roomUrl      → ouvre Jitsi
   *   canJoin=false + waitingForModerator=true → "⏳ Waiting for organizer"
   *   canJoin=false + message      → erreur (non confirmé, hors fenêtre…)
   */
  joinAsParticipant(
    eventId: number,
    userId:  number
  ): Observable<JoinSessionResponse> {
    return this.http.post<JoinSessionResponse>(
      `${this.BASE}/${eventId}/virtual/join/participant`,
      null,
      { params: { userId: userId.toString() } }
    );
  }

  // ── Quitter la salle ─────────────────────────────────────────

  /**
   * POST /api/events/{id}/virtual/leave?userId=X
   * Enregistre leftAt et accumule la durée de présence.
   * Idempotent — sans effet si déjà sorti.
   */
  leaveSession(eventId: number, userId: number): Observable<void> {
    return this.http.post<void>(
      `${this.BASE}/${eventId}/virtual/leave`,
      null,
      { params: { userId: userId.toString() } }
    ).pipe(catchError(() => of(void 0)));
  }

  // ── Stats assiduité (admin, après fermeture) ──────────────────

  /**
   * GET /api/events/{id}/virtual/stats?userId=X
   * Disponible uniquement après status = CLOSED ou ARCHIVED.
   */
  getStats(eventId: number, adminId: number): Observable<SessionStatsResponse> {
    return this.http.get<SessionStatsResponse>(
      `${this.BASE}/${eventId}/virtual/stats`,
      { params: { userId: adminId.toString() } }
    );
  }
}