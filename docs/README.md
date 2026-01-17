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

Obsługiwane separatoty: `,` lub `;` lub tabulator (w zależności od pliku).

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
npm run dev -- --no-turbo
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

![Dashboard](./screenshots/dashboard.png)
![Transakcje](./screenshots/transactions.png)
![Wpisy](./screenshots/entries.png)
![Kategorie](./screenshots/categories.png)
![Raporty](./screenshots/reports.png)
![Import CSV](./screenshots/import.png)

---

## Uwagi końcowe

Dokumentacja opisuje rzeczywisty stan projektu i technologie użyte w implementacji. Projekt ma charakter edukacyjny i demonstracyjny.
