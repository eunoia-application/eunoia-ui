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

// --- Learning: слова, блоки-частотность, темы, грамматика ---
/** KNOWN | LEARNING | UNKNOWN. Отсутствие отметки трактуем как UNKNOWN. */
export type MasteryStatus = Schemas['MasteryStatus']
export type PartOfSpeech = Schemas['PartOfSpeech']
export type Cefr = Schemas['Cefr']
/** Форма слова (went / past). В схеме зовётся `Form` — алиасим, чтобы не путать с antd. */
export type WordForm = Schemas['Form']
export type Translation = Schemas['Translation']
/** Ссылка на слово (id-лемма `en:go` + часть речи) — поиск и связи графа. */
export type WordRef = Schemas['WordRef']
/** Одна часть речи слова: свои переводы, формы и связи. */
export type WordVariant = Schemas['WordVariant']
/** Карточка слова: ipa + варианты по частям речи + мой статус. */
export type WordCard = Schemas['WordCard']
/** Слово-лист в списке/теме: части речи, темы и статус. */
export type WordLeaf = Schemas['WordLeaf']
/** Страница списка слов (total/offset/limit/words). */
export type WordPage = Schemas['WordPage']
/** Блок топ-слов по частотности + прогресс (known/learning). */
export type Band = Schemas['Band']
export type TopicRef = Schemas['TopicRef']
/** Ветка темы: тема + её слова. */
export type TopicView = Schemas['TopicView']
export type GrammarView = Schemas['GrammarView']
export type MasteryRequest = Schemas['MasteryRequest']
export type MasteryView = Schemas['MasteryView']
