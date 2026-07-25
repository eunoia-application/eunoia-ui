import type {
  AuthResponse,
  AuthUser,
  Band,
  GrammarView,
  MasteryView,
  TopicRef,
  TopicView,
  UserProfile,
  UserSettings,
  WordCard,
  WordLeaf,
  WordPage,
  WordRef,
  WordVariant,
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

// --- Learning: слова, блоки, темы, грамматика ---

export function makeWordRef(over: Partial<WordRef> = {}): WordRef {
  return { id: 'en:go', lemma: 'go', pos: 'VERB', ...over }
}

export function makeWordVariant(over: Partial<WordVariant> = {}): WordVariant {
  return {
    pos: 'VERB',
    cefr: 'A1',
    freqRank: 42,
    translations: [{ text: 'идти', lang: 'ru' }],
    forms: [{ text: 'went', feature: 'past' }],
    synonyms: [makeWordRef({ id: 'en:walk', lemma: 'walk' })],
    antonyms: [],
    hypernyms: [],
    ...over,
  }
}

export function makeWordCard(over: Partial<WordCard> = {}): WordCard {
  return {
    id: 'en:go',
    lemma: 'go',
    ipa: '/ɡoʊ/',
    freqRank: 42,
    status: 'LEARNING',
    variants: [makeWordVariant()],
    ...over,
  }
}

export function makeWordLeaf(over: Partial<WordLeaf> = {}): WordLeaf {
  return {
    id: 'en:go',
    lemma: 'go',
    pos: ['VERB'],
    cefr: 'A1',
    topics: [{ id: 't-travel', name: 'Путешествия', slug: 'travel' }],
    status: 'UNKNOWN',
    ...over,
  }
}

export function makeWordPage(over: Partial<WordPage> = {}): WordPage {
  return { total: 1, offset: 0, limit: 60, words: [makeWordLeaf()], ...over }
}

export function makeTopicRef(over: Partial<TopicRef> = {}): TopicRef {
  return { id: 't-travel', name: 'Путешествия', slug: 'travel', ...over }
}

export function makeTopicView(over: Partial<TopicView> = {}): TopicView {
  return { topic: makeTopicRef(), words: [makeWordLeaf()], ...over }
}

export function makeBand(over: Partial<Band> = {}): Band {
  return {
    id: 'top-100',
    label: 'Топ-100',
    fromRank: 1,
    toRank: 100,
    total: 100,
    known: 10,
    learning: 5,
    ...over,
  }
}

export function makeMasteryView(over: Partial<MasteryView> = {}): MasteryView {
  return {
    wordId: 'en:go',
    status: 'KNOWN',
    updatedAt: '2026-07-01T00:00:00Z',
    ...over,
  }
}

export function makeGrammarView(over: Partial<GrammarView> = {}): GrammarView {
  return {
    id: 'gr:past-simple',
    name: 'Past Simple',
    cefr: 'A2',
    prerequisites: ['gr:present-simple'],
    illustratedBy: [makeWordRef({ id: 'en:went', lemma: 'went' })],
    ...over,
  }
}
