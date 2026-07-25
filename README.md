# Eunoia — Knowledge Garden UI

Фронтенд продукта **Eunoia** — «сад знаний», где пользователь не проходит уроки,
а *выращивает* свои знания. Языки — первый модуль: главный экран — живое дерево,
которое растёт по мере освоения слов; словарь идёт блоками по частотности.

> **Статус:** работают авторизация, полный профиль и **учебное ядро** на контракте
> **3.1.0**. Разделы: «Слова» (блоки топ-слов → слова по темам → карточка с вариантами
> по частям речи, отметки «Знаю/Учить»), «Грамматика» (ствол по CEFR, правила с
> предпосылками и словами-примерами), «Учить» (`/study` — очередь на повторение) и
> «Темы» (`/topics`). Главный экран — **Сад**: живое 3D-дерево на React Three Fiber, которое растёт
> по стадиям и служит навигацией. Автотесты (~99.7% покрытие) и CI.

---

## Стек

| Область | Технология |
| --- | --- |
| UI-фреймворк | React 19 + TypeScript (strict) |
| Сборка | Vite 6 |
| Компоненты | Ant Design 5 (`ConfigProvider` + theme tokens) |
| Состояние | Zustand 5 (persist) |
| Роутинг | React Router 6 |
| HTTP | Axios (единый инстанс + интерсепторы) |
| Формы/валидация | Ant Design Form + Zod |
| Анимации | Framer Motion |
| Визуализация Сада | React Three Fiber 9 + Three.js + drei (3D WebGL, ленивый чанк) |
| Контракты API | `@eunoia-application/api-types` 3.1.0 (OpenAPI → TS, GitHub Packages) |
| Тесты | Vitest + Testing Library + coverage v8 |

---

## Архитектура — Feature-Sliced Design

Слои сверху вниз; **импорт разрешён только вниз по слоям**, слайсы внутри слоя
не импортируют друг друга, публичный API каждого слайса — через `index.ts`.
Правило границ выражено в ESLint (`eslint-plugin-boundaries`).

```
app       → композиция: провайдеры, роутер, layouts, тема. Бизнес-логики нет.
  ▲
pages     → тонкие роут-композиции (собирают виджеты).
  ▲
widgets   → самодостаточные блоки UI (сайдбар, карточка авторизации, блоки/слова/карточки).
  ▲
features  → пользовательские действия (вход, поиск слова, отметка владения, апдейт профиля).
  ▲
entities  → бизнес-сущности (session, user, word, band, mastery, grammar): model + api + lib.
  ▲
shared    → инфраструктура без знания домена: axios-клиент, UI-kit, тема, хуки.
```

**Ключевые правила проекта**

- Компонент ≤ 150–200 строк; логика выносится в `model/`-хуки/сторы.
- **API-логика только в `entities/*/api`** поверх `shared/api/client`; UI дёргает экшены стора, а не Axios напрямую.
- `shared` не знает про домен. Токен/refresh в интерсептор попадают через **инверсию зависимостей** (`shared/api/authBridge`), а не импортом `entities` в `shared`.

---

## Структура

```
src/
├─ app/                     # композиция приложения
│  ├─ main.tsx              # точка входа (setupZodRu + bindSessionToApi + render)
│  ├─ providers/           # AppProviders, ThemeProvider, NotifyBridge
│  ├─ router/              # AppRoutes, ProtectedRoute / GuestOnly, RouteFallback
│  ├─ layouts/             # AppLayout (sticky-сайдбар + контент)
│  └─ styles/              # global.css
├─ pages/                   # auth · home (Сад) · words · grammar · study · topics · settings
├─ widgets/                 # app-sidebar · auth-card · garden-tree (дерево Сада)
│                           # bands · words · word-modal · grammar · grammar-modal · progress-hero
├─ features/                # auth-login · auth-register · auth-logout · theme-toggle
│                           # update-profile · update-settings · manage-avatar
│                           # export-data · delete-account · search-words · set-mastery
├─ entities/                # session · user · word · band · mastery · grammar
└─ shared/
   ├─ api/                  # client, interceptors, authBridge, contracts (из npm-пакета)
   ├─ config/               # env, constants (APP), routes (PATHS)
   ├─ lib/                  # hooks (debounce/media), format, notify, zod-хелперы
   ├─ test/                 # setup, renderWithProviders, фабрики данных
   ├─ theme/                # токены, light/dark, themeStore, useResolvedTheme, mapper
   └─ ui/                   # DataStates (skeleton/empty/retry), PageHeader, WordCard, GardenBackground
```

---

## Быстрый старт

### 1. Требования

- Node.js **≥ 18.18**
- Доступ к GitHub Packages (для пакета контрактов) — см. ниже.

### 2. Доступ к контрактам (GitHub Packages)

Типы API поставляются приватным пакетом `@eunoia-application/api-types` из
GitHub Packages. Нужен **Personal Access Token** с правом `read:packages`.

Файл `.npmrc` (в корне репозитория, **в `.gitignore` — токен не коммитится**):

```
@eunoia-application:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ВАШ_GITHUB_TOKEN
```

> Только scope `@eunoia-application` уходит в GitHub Packages. **Не** добавляйте
> глобальный `registry=` — иначе публичные пакеты (react/antd/…) начнут 404-ить.

### 3. Установка и запуск

```bash
npm install          # поставит зависимости + пакет контрактов
cp .env.example .env # переменные окружения
npm run dev          # http://localhost:9000
```

---

## Переменные окружения

| Переменная | По умолчанию | Назначение |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api/v1` | Базовый префикс API. В dev проксируется на бэкенд. |

Dev-сервер (`vite.config.ts`) проксирует `/api/*` → `http://localhost:7777`
**как есть** (без rewrite). Т.е. `/api/v1/auth/login` уходит на
`http://localhost:7777/api/v1/auth/login` — база бэкенда `:7777/api/v1`.
Origin `:9000` уже в CORS allow-list бэкенда (в проде — `CORS_ALLOWED_ORIGINS`).

> Без запущенного бэкенда UI работает, но защищённые разделы вернут сетевую
> ошибку — это ожидаемо (моков в проекте намеренно нет).

---

## Скрипты

| Команда | Действие |
| --- | --- |
| `npm run dev` | Dev-сервер Vite на `:9000` (HMR). |
| `npm run build` | Проверка типов (`tsc -b`) + production-сборка. |
| `npm run preview` | Локальный предпросмотр собранного `dist`. |
| `npm run lint` | ESLint (включая проверку FSD-границ). |
| `npm run typecheck` | Проверка типов без эмита. |
| `npm run test` | Прогон тестов (Vitest). |
| `npm run test:watch` | Тесты в watch-режиме. |
| `npm run test:cov` | Тесты + отчёт покрытия (v8). |

---

## Как это работает

### API и авторизация

- Единый axios-инстанс — `shared/api/client.ts`. Все запросы идут через него.
- Интерсепторы (`shared/api/interceptors.ts`): подстановка `Bearer`-токена,
  `401 → refresh → повтор` (single-flight), нормализация ошибок в `ApiError`.
- Токен и refresh приходят из `entities/session` через `authBridge` (инверсия
  зависимостей), поэтому `shared` не зависит от `entities`.
- Сессия (`entities/session`) хранит токены и пользователя в Zustand с persist.

### Учебное ядро (`/learning/*`)

Единица обучения — **слово-лемма** (`en:go`); части речи живут внутри слова как
`variants`. Навигация — **блоки топ-слов** по частотности.

- `entities/band` — `GET /learning/bands`: уровни (Топ-100 … 5001–10000) с
  прогрессом `known/learning/total`.
- `entities/word` — карточка (`GET /learning/words/{id}` → `variants` по частям
  речи), поиск (`/search`), список блока с пагинацией (`/words?band=…`);
  `groupByTopic` раскладывает слова по темам (сироты → «Разное», крупные темы выше).
- `entities/mastery` — отметки владения по `wordId` (`KNOWN`/`LEARNING`), очередь
  «Учить» (`/study`). Клик красит слово оптимистично, при ошибке — откат и тост.
- `entities/grammar` — ствол: `GET /learning/grammar` (правила по CEFR с
  `prerequisites`), деталь правила со словами-примерами.

Разделы «Слова» и «Грамматика» — единый «дашборд»-вид: hero-обзор прогресса
(кольцо + разбивка), блоки/уровни с кольцевым прогрессом, слова и правила
карточками, карточка-слово и правило — центрированные премиум-модалки.

### Сад — живое дерево (`/`)

Главный экран — полноценная 3D-сцена на **React Three Fiber + Three.js** (ленивый
чанк — three грузится только на Саде). Дерево *растёт непрерывно* по числу
освоенных слов и само служит навигацией:

- **Непрерывный рост** — единый прогресс p∈[0,1] (корень до 150 слов, дальше
  логарифм до 5000); от него плавно интерполируются высота, толщина ствола,
  зрелость ветвей, размер листа, теплота света и «жизнь» частиц. Эволюция без
  стадий-переключений: росток → побег → молодое дерево → дерево → древо знаний.
- **Процедурная геометрия** — никаких картинок: ствол и ветви строятся трубками
  переменного радиуса по осевым кривым (parallel transport), кора — генерируемая
  canvas-текстура, лист — Безье-силуэт с продольным изгибом.
- **Каждое слово = лист** (InstancedMesh, свой размер/оттенок/фаза): «Знаю» —
  раскрытый лист, «Учить» — набухшая почка, непройденное — голая ветка. Пока ветвь
  незрелая, листья распускаются вдоль стебля; со зрелостью переезжают в крону.
  На полностью освоенном блоке (known == total) зреют **плоды**.
- **Живая атмосфера** — ветер (фрактальный шум в вершинном шейдере + трепет
  листьев), светлячки (тёмная тема) и пыльца (светлая), редкие опадающие листья,
  дыхание камеры с параллаксом за курсором; prefers-reduced-motion уважается.
- **Крона = навигация**: гроздь = блок (тултип с прогрессом, клик уводит в «Слова»),
  лист = слово (лениво подгружается, клик открывает карточку) — raycast по
  инстансам. Скелет дерева и модель роста — чистые модули
  `widgets/garden-tree/model/{growth,skeleton}.ts` (тестируются без WebGL).
- **theme-aware**: закатный ореол и свечение кроны только в тёмной теме; отметка
  слова обновляет блоки — крона отрастает сразу, без перезагрузки сцены.

Часть механик из продуктовой карты (грамматика→высота, цветы, плоды, погода, сезоны)
ждёт данных с бэкенда — их намеренно не мокаем.

### Контракты (типы API)

Типы реэкспортятся из пакета в `shared/api/contracts/index.ts`
(`components['schemas'][…]`). Доменный код импортирует привычные имена из
`@shared/api` и ничего не знает об устройстве пакета. Пакет — **type-only**
(в рантайм-бандл не попадает). Обновление контракта:

```bash
npm i @eunoia-application/api-types@latest
```

> Контракт **3.1.0** покрывает Auth (slim `AuthUser`), User (профиль, аватар,
> настройки, экспорт) и Learning (слова/блоки/темы/грамматика/мастерство).

### Тема

`dark` / `light` / `system` — реактивно через `ConfigProvider`. Выбор хранится в
`localStorage` (`shared/theme/themeStore`), `useResolvedTheme` разворачивает
`system` в фактический режим по ОС. Акцент — «садовый» зелёный, остальная палитра
нейтральная (стиль Linear / Stripe / Vercel).

---

## Тестирование

- **Vitest + Testing Library** (jsdom), покрытие через `@vitest/coverage-v8`.
- Тесты лежат рядом с кодом (`*.test.ts` / `*.test.tsx`).
- Общая инфраструктура — в `shared/test`: `setup.ts` (jest-dom + заглушки
  `matchMedia`/`ResizeObserver`), `renderWithProviders` (тема + antd `App` + роутер),
  фабрики данных (`makeWordCard`, `makeBand`, `makeGrammarView`, `makeProfile`, …).
- Сеть не дёргается: api/сторы мокаются через `vi.mock` и `store.setState`.

```bash
npm run test        # разовый прогон
npm run test:watch  # watch-режим
npm run test:cov    # + покрытие (пороги: 99% строк/функций, 97% веток)
```

Текущее покрытие — ~99.7% (371 тест). **CI** (GitHub Actions,
`.github/workflows/ci.yml`) на каждый push/PR прогоняет
`typecheck → lint → test:cov → build`.

---

## Роадмап

- [x] **Фундамент** — тулчейн, дизайн-система (тема dark/light), авторизация
      («цифровой сад»), профиль (аватар, настройки, экспорт данных, удаление аккаунта).
- [x] **Учебное ядро** на контракте 3.1.0 — «Слова» (блоки топ-слов → слова по
      темам → карточка с вариантами, отметки «Знаю/Учить») и «Грамматика» (ствол
      по CEFR, правила с предпосылками и словами-примерами); премиум-раскладка.
- [x] Разделы **«Учить»** (`/study` — очередь на повторение) и **«Темы»** (`/topics`).
- [x] Визуализация **Сада** — живое 3D-дерево на **React Three Fiber**, растущее
      непрерывно (росток → побег → дерево → древо); крона служит навигацией,
      плоды на полностью освоенных блоках.
- [ ] Механики карты эволюции, требующие бэкенда: грамматика→высота, цветы (грам-
      темы), погода/сезоны (регулярность), «увядание» листьев (spaced repetition),
      AI-наставник и граф языка.

---

## Соглашения

- Именование и стиль — как в окружающем коде; проза UI на русском.
- Перед PR: `npm run typecheck && npm run lint && npm run test && npm run build` — всё зелёное.
- Не добавляйте моки данных: без бэкенда раздел показывает пустое/ошибочное
  состояние, а не выдуманные данные.
