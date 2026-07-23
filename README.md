# Eunoia — Knowledge Garden UI

Фронтенд продукта **Eunoia** — «сад знаний», где пользователь не проходит уроки,
а *выращивает* свои знания. Языки — первый модуль (дерево растёт: слова-листья,
темы-ветки, грамматика-ствол). Сейчас реализован фундамент (авторизация и
профиль); визуализация сада — впереди, после доменного API.

> **Статус:** итерация 1 завершена — тулчейн, дизайн-система, авторизация,
> профиль/настройки на реальном API. Садовая визуализация ждёт контракт под
> новое направление.

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
| Контракты API | `@eunoia-application/api-types` (OpenAPI → TS, GitHub Packages) |

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
widgets   → самодостаточные блоки UI (сайдбар, топбар, карточка авторизации).
  ▲
features  → пользовательские действия (вход, регистрация, смена темы, апдейт профиля).
  ▲
entities  → бизнес-сущности (session, user): model + api + ui + lib.
  ▲
shared    → инфраструктура без знания домена: axios-клиент, UI-kit, тема, хуки.
```

**Ключевые правила проекта**

- Компонент ≤ 150–200 строк; логика выносится в `model/`-хуки, колонки таблиц — в `config/`.
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
│  ├─ layouts/             # AppLayout (сайдбар + топбар + контент)
│  └─ styles/              # global.css
├─ pages/                   # auth · home · settings
├─ widgets/                 # app-sidebar · app-topbar · auth-card
├─ features/                # auth-login · auth-register · auth-logout
│                           # theme-toggle · update-profile · change-password
├─ entities/                # session · user (Zustand + api + ui)
└─ shared/
   ├─ api/                  # client, interceptors, authBridge, contracts (из npm-пакета)
   ├─ config/               # env, constants, routes (PATHS)
   ├─ lib/                  # hooks (debounce/media), format, notify, zod-хелперы
   ├─ theme/                # токены, light/dark, themeStore, useResolvedTheme
   └─ ui/                   # DataStates (skeleton/empty/retry), PageHeader, GardenBackground
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

> Без запущенного бэкенда UI работает, но авторизация вернёт сетевую ошибку —
> это ожидаемо (моков в проекте намеренно нет).

---

## Скрипты

| Команда | Действие |
| --- | --- |
| `npm run dev` | Dev-сервер Vite на `:9000` (HMR). |
| `npm run build` | Проверка типов (`tsc -b`) + production-сборка. |
| `npm run preview` | Локальный предпросмотр собранного `dist`. |
| `npm run lint` | ESLint (включая проверку FSD-границ). |
| `npm run typecheck` | Проверка типов без эмита. |

---

## Как это работает

### API и авторизация

- Единый axios-инстанс — `shared/api/client.ts`. Все запросы идут через него.
- Интерсепторы (`shared/api/interceptors.ts`): подстановка `Bearer`-токена,
  `401 → refresh → повтор` (single-flight), нормализация ошибок в `ApiError`.
- Токен и refresh приходят из `entities/session` через `authBridge` (инверсия
  зависимостей), поэтому `shared` не зависит от `entities`.
- Сессия (`entities/session`) хранит токены и пользователя в Zustand с persist.

### Контракты (типы API)

Типы реэкспортятся из пакета в `shared/api/contracts/index.ts`
(`components['schemas'][…]`). Доменный код импортирует привычные имена из
`@shared/api` и ничего не знает об устройстве пакета. Пакет — **type-only**
(в рантайм-бандл не попадает). Обновление контракта:

```bash
npm i @eunoia-application/api-types@latest
```

> Текущая версия пакета покрывает **Auth** и **User**. Доменная модель
> (Knowledge Garden) появится в следующих версиях контракта.

### Тема

`dark` / `light` / `system` — реактивно через `ConfigProvider`. Выбор хранится в
`localStorage` (`shared/theme/themeStore`), `useResolvedTheme` разворачивает
`system` в фактический режим по ОС. Акцент — «садовый» зелёный, остальная палитра
нейтральная (стиль Linear / Stripe / Vercel).

---

## Роадмап

- [x] **Итерация 1** — тулчейн, дизайн-система (тема dark/light), авторизация
      (вход/регистрация, «цифровой сад»), профиль и настройки на реальном
      `/users/me`, интеграция пакета контрактов.
- [ ] Новый контракт API под направление **Knowledge Garden** (языки: деревья,
      ветки-темы, листья-слова, граф языка).
- [ ] Визуализация сада — дерево (SVG + Framer Motion) и граф языка (react-flow).
- [ ] AI-наставник, механика «увядания» листьев (spaced repetition), сезоны.

---

## Соглашения

- Именование и стиль — как в окружающем коде; проза UI на русском.
- Перед PR: `npm run typecheck && npm run lint && npm run build` — всё зелёное.
- Не добавляйте моки данных: без бэкенда раздел показывает пустое/ошибочное
  состояние, а не выдуманные данные.
