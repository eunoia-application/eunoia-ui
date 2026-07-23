/**
 * Единая точка контрактов API. Типы приходят из npm-пакета OAS
 * `@eunoia-application/api-types` (сгенерирован openapi-typescript из OpenAPI).
 * Здесь только алиасы `components['schemas'][…]`.
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
/** Слим-идентичность в ответе auth (НЕ полный профиль). */
export type AuthUser = Schemas['AuthUser']
export type TokenType = AuthResponse['tokenType']

// --- User ---
export type UserProfile = Schemas['UserProfile']
export type UserPublicProfile = Schemas['UserPublicProfile']
export type UserUpdateRequest = Schemas['UserUpdateRequest']
export type UserSettings = Schemas['UserSettings']
export type UserStats = Schemas['UserStats']
export type UserDataExport = Schemas['UserDataExport']
export type ThemePreference = UserSettings['theme']
export type ProfileVisibility = UserSettings['profileVisibility']

// --- Learning: граф знаний + сад ---
/** KNOWN | LEARNING | UNKNOWN. Отсутствие отметки трактуем как UNKNOWN. */
export type MasteryStatus = Schemas['MasteryStatus']
export type PartOfSpeech = Schemas['PartOfSpeech']
export type Cefr = Schemas['Cefr']
/** Форма слова (went / past). В схеме зовётся `Form` — алиасим, чтобы не путать с antd. */
export type LexemeForm = Schemas['Form']
export type Translation = Schemas['Translation']
export type LexemeRef = Schemas['LexemeRef']
export type LexemeCard = Schemas['LexemeCard']
/** Слово-лист в теме: из статуса берём цвет листа. */
export type GardenLeaf = Schemas['GardenLeaf']
export type TopicRef = Schemas['TopicRef']
/** Ветка сада: тема + её слова с моей раскраской. */
export type TopicView = Schemas['TopicView']
export type GrammarView = Schemas['GrammarView']
export type MasteryRequest = Schemas['MasteryRequest']
export type MasteryView = Schemas['MasteryView']
