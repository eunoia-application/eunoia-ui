/**
 * Единая точка контрактов API. Типы приходят из npm-пакета OAS
 * `@eunoia-application/api-types` (сгенерирован openapi-typescript из OpenAPI).
 * Здесь только алиасы `components['schemas'][…]` — доменный код импортирует
 * привычные имена и не знает про устройство пакета.
 */
import type { components } from '@eunoia-application/api-types'

type Schemas = components['schemas']

// --- Auth ---
export type LoginRequest = Schemas['LoginRequest']
export type RegisterRequest = Schemas['RegisterRequest']
export type RefreshTokenRequest = Schemas['RefreshTokenRequest']
export type ForgotPasswordRequest = Schemas['ForgotPasswordRequest']
export type ResetPasswordRequest = Schemas['ResetPasswordRequest']
export type AuthResponse = Schemas['AuthResponse']
export type TokenType = AuthResponse['tokenType']

// --- User ---
export type UserProfile = Schemas['UserProfile']
export type UserPublicProfile = Schemas['UserPublicProfile']
export type UserUpdateRequest = Schemas['UserUpdateRequest']
export type ChangePasswordRequest = Schemas['ChangePasswordRequest']
export type UserStats = Schemas['UserStats']
export type UserSettings = Schemas['UserSettings']
export type ThemePreference = UserSettings['theme']
export type NoteStatus = UserSettings['defaultNoteStatus']

// --- Домен «заметки» (в UI пока не используется, готово для будущих итераций) ---
export type Note = Schemas['Note']
export type Tag = Schemas['Tag']
export type NoteLink = Schemas['NoteLink']
export type AISuggestion = Schemas['AISuggestion']
