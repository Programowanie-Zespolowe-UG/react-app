# Personal Finance Tracker

## Opis projektu

Personal Finance Tracker to aplikacja webowa do zarządzania budżetem domowym. 
Umożliwia rejestrację i logowanie użytkowników, dodawanie przychodów i wydatków,
kategoryzację transakcji oraz przegląd statystyk w postaci wykresów. 
Projekt jest nastawiony na prostotę i czytelny interfejs,
bez integracji bankowych i automatycznej synchronizacji.

---

## Najważniejsze funkcje

### Dashboard


- podsumowanie przychodów, wydatków i salda,
- wykres trendów z ostatnich 12 miesięcy,
- dzienna sentencja (Daily Wisdom).

### Transakcje

- dodawanie, edycja i usuwanie wpisów,
- filtrowanie po typie (przychód / wydatek),
- sortowanie po dacie i kwocie,
- wyszukiwanie po opisie i kategorii,
- paginacja listy transakcji.

### Kategorie

- domyślne kategorie globalne,
- możliwość tworzenia własnych kategorii użytkownika,
- rozróżnienie na przychody i wydatki.

### Raporty

- analiza w wybranym zakresie czasu,
- wykres kołowy struktury wydatków,
- wskaźnik oszczędności (Savings Rate).

### Import CSV

- import transakcji z pliku CSV,
- podgląd pierwszych wierszy przed importem,
- walidacja wymaganych kolumn.

Wymagany format:

```
date,category,value
```

Obsługiwane separatoty: `,` lub `;` lub tabulator (aplikacja wykrywa separator automatycznie).

### Uwierzytelnianie i ustawienia

- rejestracja i logowanie,
- zmiana hasła,
- edycja imienia w profilu,
- tryb jasny / ciemny.

---

## Technologie

### Frontend

- **Next.js 16** (React, App Router)
- **JavaScript (JSX)**
- **Material UI (MUI)**
- **Recharts**

### Backend

- **Next.js API Routes**
- **JWT + cookie** (sesja użytkownika)

### Baza danych

- **MySQL**
- **Prisma ORM**

---

## Uruchomienie lokalne

### Wymagania

- Node.js >= 18
- npm
- MySQL >= 8.0

### Instalacja

1. Zainstaluj zależności:

```bash
npm install
```

2. Utwórz plik `.env` w katalogu `react-app`:

```env
DATABASE_URL="mysql://root:root@localhost:3306/database_name"
JWT_SECRET="your-secret-key"
CAPTCHA_SECRET="captcha-secret-key"
```

3. Wygeneruj klienta Prisma i zastosuj migracje:

```bash
npx prisma migrate dev
```

4. Wypełnij bazę danymi testowymi:

```bash
npm run seed
```

Testowe konto:

- email: `test@test.com`
- hasło: `password`

5. Uruchom aplikację:

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem:

```
http://localhost:3000
```

### Uwagi dla Windows

Jeśli pojawi się błąd Turbopack dotyczący braku uprawnień do symlinków, uruchom:

```bash
next dev --webpack
```

---

## Struktura projektu

- `react-app/src/app` – UI i routy (App Router)
- `react-app/src/app/api` – endpointy API
- `react-app/src/context` – kontekst autoryzacji
- `react-app/src/lib` – helpery (Prisma, auth)
- `react-app/prisma` – schemat i migracje

---

## Zrzuty ekranu

Poniżej znajdują się aktualne screeny aplikacji:

<img src="./screenshots/dashboard.png" alt="Dashboard" width="420" height="300" />
<img src="./screenshots/transactions.png" alt="Transakcje" width="420" height="300" />
<img src="./screenshots/entries.png" alt="Wpisy" width="420" height="300" />
<img src="./screenshots/categories.png" alt="Kategorie" width="420" height="300" />
<img src="./screenshots/reports.png" alt="Raporty" width="420" height="300" />
<img src="./screenshots/import.png" alt="Import CSV" width="420" height="300" />

---

## Architektura (skrót)

UI (Next.js) → API Routes → Prisma ORM → MySQL

---

## Endpointy API (najważniejsze)

### Auth

- `POST /api/auth/register` – rejestracja
- `POST /api/auth/login` – logowanie
- `POST /api/auth/logout` – wylogowanie
- `GET /api/auth/me` – dane zalogowanego użytkownika
- `PUT /api/auth/change-password` – zmiana hasła
- `GET /api/auth/captcha` – CAPTCHA do rejestracji

### Dane

- `GET /api/entries` – lista wpisów
- `POST /api/entries` – dodanie wpisu
- `PUT /api/entries/:id` – edycja wpisu
- `DELETE /api/entries/:id` – usunięcie wpisu
- `GET /api/categories` – lista kategorii
- `POST /api/categories` – dodanie kategorii
- `PUT /api/categories/:id` – edycja kategorii
- `DELETE /api/categories/:id` – usunięcie kategorii
- `GET /api/stats` – statystyki do wykresów
- `POST /api/import/preview` – podgląd CSV
- `POST /api/import/csv` – import CSV

---

## Model danych (skrót)

- **User**: `id`, `email`, `passwordHash`, `name`, `createdAt`
- **Category**: `id`, `name`, `type`, `userId`, `createdAt`
- **Entry**: `id`, `userId`, `categoryId`, `amount`, `date`, `description`, `createdAt`

Relacje:

- User → Categories (1:N)
- User → Entries (1:N)
- Category → Entries (1:N)

---

## Przepływy użytkownika (przykłady)

- Rejestracja → CAPTCHA → logowanie → dashboard
- Dodanie wpisu → aktualizacja listy → aktualizacja statystyk
- Zmiana hasła → komunikat sukcesu/błędu

---

## Uruchomienie produkcyjne

```bash
npm run build
npm run start
```

Wymagane zmienne środowiskowe: `DATABASE_URL`, `JWT_SECRET`, `CAPTCHA_SECRET`.

---

## Testy (manualna checklista)

- rejestracja i logowanie
- dodanie/edycja/usunięcie wpisu
- filtrowanie i sortowanie transakcji
- import CSV (poprawny i błędny plik)
- zmiana hasła
- raporty i wykresy
