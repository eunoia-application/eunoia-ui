import type {
  AuthResponse,
  AuthUser,
  GardenLeaf,
  LexemeCard,
  LexemeRef,
  MasteryView,
  TopicRef,
  TopicView,
  UserProfile,
  UserSettings,
} from '@shared/api'

/**
 * Фабрики тестовых данных. Только для *.test.* — в прод-бандл не попадают
 * (не импортятся из прод-кода, tree-shaken).
 */

export function makeAuthUser(over: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'u-1',
    email: 'user@example.com',
    username: 'eunoia_user',
    emailVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...over,
  }
}

export function makeSettings(over: Partial<UserSettings> = {}): UserSettings {
  return {
    theme: 'AUTO',
    interfaceLanguage: 'ru',
    profileVisibility: 'PRIVATE',
    emailNotifications: true,
    aiSuggestionsEnabled: true,
    ...over,
  }
}

export function makeProfile(over: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'u-1',
    email: 'user@example.com',
    username: 'eunoia_user',
    firstName: 'Alex',
    lastName: 'Johnson',
    avatarUrl: null,
    bio: null,
    emailVerified: true,
    settings: makeSettings(),
    stats: { lastActiveAt: '2026-06-01T00:00:00Z' },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    ...over,
  }
}

export function makeAuthResponse(over: Partial<AuthResponse> = {}): AuthResponse {
  return {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: makeAuthUser(),
    ...over,
  }
}

// --- Learning: граф знаний + сад ---

export function makeTopicRef(over: Partial<TopicRef> = {}): TopicRef {
  return { id: 't-travel', name: 'Путешествия', slug: 'travel', ...over }
}

export function makeGardenLeaf(over: Partial<GardenLeaf> = {}): GardenLeaf {
  return {
    id: 'en:go:VERB',
    lemma: 'go',
    pos: 'VERB',
    cefr: 'A1',
    status: 'UNKNOWN',
    ...over,
  }
}

export function makeTopicView(over: Partial<TopicView> = {}): TopicView {
  return { topic: makeTopicRef(), lexemes: [makeGardenLeaf()], ...over }
}

export function makeLexemeRef(over: Partial<LexemeRef> = {}): LexemeRef {
  return { id: 'en:go:VERB', lemma: 'go', pos: 'VERB', ...over }
}

export function makeLexemeCard(over: Partial<LexemeCard> = {}): LexemeCard {
  return {
    id: 'en:go:VERB',
    lemma: 'go',
    pos: 'VERB',
    cefr: 'A1',
    freqRank: 42,
    forms: [{ text: 'went', feature: 'past' }],
    translations: [{ text: 'идти', lang: 'ru' }],
    synonyms: [makeLexemeRef({ id: 'en:walk:VERB', lemma: 'walk' })],
    antonyms: [],
    hypernyms: [],
    status: 'LEARNING',
    ...over,
  }
}

export function makeMasteryView(over: Partial<MasteryView> = {}): MasteryView {
  return {
    lexemeId: 'en:go:VERB',
    status: 'KNOWN',
    updatedAt: '2026-07-01T00:00:00Z',
    ...over,
  }
}
