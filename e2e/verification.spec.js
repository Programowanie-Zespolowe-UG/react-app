const { test, expect } = require('@playwright/test');

test.describe('Verification Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Logowanie
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test@test.com');
        await page.fill('input[name="password"]', 'password');
        // Znajdź przycisk logowania - szukamy po typie submit lub tekście
        await page.click('button[type="submit"]');
        // Czekaj na przekierowanie na stronę główną
        await page.waitForURL('/');
    });

    test('Weryfikacja UI Kategorii', async ({ page }) => {
        // Przejdź do zakładki Kategorie
        await page.getByRole('button', { name: 'Categories' }).click();

        // 1. Kategoria systemowa (np. Food) - BRAK przycisku usuwania
        const foodItem = page.locator('li').filter({ hasText: 'Food' });
        await expect(foodItem).toBeVisible();
        // Sprawdź czy ikona kosza NIE jest widoczna dla systemowej kategorii
        await expect(foodItem.locator('svg[data-testid="DeleteRoundedIcon"]')).not.toBeVisible();

        // 2. Kategoria użytkownika (np. Gym) - JEST przycisk usuwania
        const gymItem = page.locator('li').filter({ hasText: 'My Custom' });
        await expect(gymItem).toBeVisible();
        // Sprawdź czy ikona kosza JEST widoczna dla kategorii użytkownika
        await expect(gymItem.locator('svg[data-testid="DeleteRoundedIcon"]')).toBeVisible();
    });

    test('Weryfikacja Obsługi Błędów (Error Handling)', async ({ page }) => {
        // Przejdź do zakładki Kategorie
        await page.getByRole('button', { name: 'Categories' }).click();

        // Zmockuj request DELETE aby zwrócił błąd 500
        await page.route('**/api/categories/*', async route => {
            if (route.request().method() === 'DELETE') {
                await route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Symulowany błąd serwera' })
                });
            } else {
                await route.continue();
            }
        });

        // Obsłuż dialog potwierdzenia (window.confirm)
        page.on('dialog', dialog => dialog.accept());

        // Kliknij usuń przy kategorii Gym
        const gymItem = page.locator('li').filter({ hasText: 'My Custom' });
        await gymItem.locator('svg[data-testid="DeleteRoundedIcon"]').click();

        // Sprawdź czy pojawił się Toast z błędem
        // Sonner toasty pojawiają się zazwyczaj jako lista
        await expect(page.getByText('Symulowany błąd serwera')).toBeVisible(); // Tekst z backendu
        // LUB
        // await expect(page.getByText('Failed to delete category')).toBeVisible(); // Tekst fallback
    });

    test('Weryfikacja Edycji Daty (Błąd Timezone)', async ({ page }) => {
        // Przejdź do strony głównej (gdzie jest lista wpisów)
        await page.goto('/');
        
        // 1. Otwórz formularz dodawania (zakładka Add w dolnym menu)
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        
        // 2. Wypełnij dane: Kwota 123, Data "2026-05-20"
        await page.fill('input[name="amount"]', '123');
        await page.fill('input[name="date"]', '2026-05-20');
        // Wybierz kategorię (pierwszą dostępną)
        await page.click('#category-select-label + div'); // Otwórz dropdown
        await page.locator('ul[role="listbox"] li').first().click(); // Wybierz pierwszy element
        
        // 3. Zapisz
        await page.getByRole('button', { name: 'Add Entry' }).click();
        
        // 4. Przejdź do zakładki Transactions/Entries aby zobaczyć listę
        await page.getByRole('button', { name: 'Entries' }).click();

        // Czekaj na odświeżenie listy. Możemy poszukać tekstu "123,00" (formatowanie PL)
        // lub opisu jeśli dodaliśmy.
        // Wypełnialiśmy tylko amount i date i category.
        // Amount 123 -> "123,00"
        const entryCard = page.locator('div.MuiCard-root').filter({ hasText: '123,00' }).first();
        await expect(entryCard).toBeVisible({ timeout: 10000 });

        // 5. Kliknij edytuj
        await entryCard.click();

        // Czekaj na otwarcie drawera edycji
        await expect(page.getByRole('heading', { name: 'Edit Entry' })).toBeVisible();

        // Sprawdź czy data w formularzu edycji to nadal 2026-05-20
        await expect(page.locator('input[name="date"]')).toHaveValue('2026-05-20');

        // 6. Edytuj tylko opis
        await page.fill('textarea[name="description"]', 'Updated description');
        
        // 7. Zapisz zmiany
        await page.getByRole('button', { name: 'Save Changes' }).click();

        // Czekaj na zamknięcie (można sprawdzić czy toast się pojawił lub drawer zniknął)
        await expect(page.getByRole('heading', { name: 'Edit Entry' })).not.toBeVisible();

        // 8. Ponownie otwórz ten sam wpis (używamy tej samej referencji entryCard, ale lokalizator trzeba odświeżyć jeśli element zniknął, ale w React liście zazwyczaj zostaje)
        // Dla pewności znajdźmy go jeszcze raz
        await page.locator('div.MuiCard-root').filter({ hasText: '123,00' }).first().click();
        
        // Czekaj na otwarcie drawera edycji
        await expect(page.getByRole('heading', { name: 'Edit Entry' })).toBeVisible();

        // 8. Sprawdź czy data nadal wynosi 2026-05-20 (a nie 2026-05-19)
        await expect(page.locator('input[name="date"]')).toHaveValue('2026-05-20');
        
        // Posprzątaj - usuń wpis
        await page.getByRole('button', { name: 'Delete Entry' }).click();
    });

    test('Weryfikacja Usuwania Kategorii z Konfliktami (Conflict Resolution)', async ({ page }) => {
        // Obsługa dialogu potwierdzenia (window.confirm)
        page.on('dialog', dialog => dialog.accept());

        // --- SCENARIUSZ 1: Move to Other ---

        // 1. Utwórz kategorię testową "Cat To Move"
        await page.getByRole('button', { name: 'Categories' }).click();
        await page.getByRole('button', { name: 'New' }).click();
        await page.fill('input[name="name"]', 'Cat To Move');
        
        // Upewnij się, że typ to Expense
        await page.getByRole('button', { name: 'Expense' }).click();
        
        await page.getByRole('button', { name: 'Create Category' }).click();
        
        // Poczekaj na pojawienie się nowej kategorii
        await expect(page.locator('li').filter({ hasText: 'Cat To Move' })).toBeVisible();

        // 2. Dodaj wydatek do tej kategorii
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await page.fill('input[name="amount"]', '55.55');
        // Wybór kategorii
        await page.click('#category-select-label + div'); // Otwiera select
        await page.getByRole('option', { name: 'Cat To Move' }).click();
        
        await page.getByRole('button', { name: 'Add Entry' }).click();
        
        // Poczekaj na potwierdzenie dodania
        await expect(page.getByText('Transaction added.').last()).toBeVisible();

        // 3. Spróbuj usunąć kategorię "Cat To Move"
        await page.getByRole('button', { name: 'Categories' }).click();
        const catToMoveItem = page.locator('li').filter({ hasText: 'Cat To Move' });
        await expect(catToMoveItem).toBeVisible();
        
        // Kliknij kosz
        await catToMoveItem.locator('svg[data-testid="DeleteRoundedIcon"]').click();

        // 4. Oczekuj modala z konfliktem
        await expect(page.getByText('Cannot delete category')).toBeVisible();
        await expect(page.getByText('This category contains 1 entries')).toBeVisible();

        // 5. Wybierz opcję "Move to 'Other'"
        await page.getByRole('button', { name: "Move to 'Other'" }).click();

        // 6. Weryfikacja sukcesu
        await expect(page.getByText('Category deleted.')).toBeVisible();
        await expect(catToMoveItem).not.toBeVisible();

        // 7. Sprawdź czy wydatek został przeniesiony (nadal istnieje na liście)
        await page.getByRole('button', { name: 'Entries' }).click();
        // Szukamy po unikalnej kwocie "55,55" (polska lokalizacja w formaterze)
        const movedEntry = page.locator('div.MuiCard-root').filter({ hasText: '55,55' }).first();
        await expect(movedEntry).toBeVisible();


        // --- SCENARIUSZ 2: Force Delete (Delete All) ---

        // 1. Utwórz kategorię "Cat To Force"
        await page.getByRole('button', { name: 'Categories' }).click();
        await page.getByRole('button', { name: 'New' }).click();
        await page.fill('input[name="name"]', 'Cat To Force');
        await page.getByRole('button', { name: 'Create Category' }).click();
        await expect(page.locator('li').filter({ hasText: 'Cat To Force' })).toBeVisible();

        // 2. Dodaj wydatek
        await page.getByRole('button', { name: 'Add', exact: true }).click();
        await page.fill('input[name="amount"]', '66.66');
        await page.click('#category-select-label + div');
        await page.getByRole('option', { name: 'Cat To Force' }).click();
        await page.getByRole('button', { name: 'Add Entry' }).click();
        await expect(page.getByText('Transaction added.').last()).toBeVisible();

        // 3. Usuń
        await page.getByRole('button', { name: 'Categories' }).click();
        const catToForceItem = page.locator('li').filter({ hasText: 'Cat To Force' });
        await catToForceItem.locator('svg[data-testid="DeleteRoundedIcon"]').click();

        // 4. Oczekuj modala
        await expect(page.getByText('Cannot delete category')).toBeVisible();

        // 5. Wybierz "Delete All"
        await page.getByRole('button', { name: 'Delete All' }).click();

        // 6. Weryfikacja
        await expect(page.getByText('Category deleted.')).toBeVisible();
        await expect(catToForceItem).not.toBeVisible();

        // 7. Sprawdź czy wydatek zniknął
        await page.getByRole('button', { name: 'Entries' }).click();
        await expect(page.locator('div.MuiCard-root').filter({ hasText: '66,66' })).not.toBeVisible();
    });
});
