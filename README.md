# 📘 Instrukcja Obsługi - Google Tasks Manager

## 🎯 Nowe Funkcje

### 1️⃣ `[!]` - Pilne zadanie (przenosi na górę)

**Jak używać:**
Dodaj `[!]` w tytule zadania, które jest pilne.

**Przykłady:**
```
[!] Zadzwonić do klienta przed 15:00
[!] Wysłać fakturę dziś
Napisać raport [!]  <- też działa
```

**Co się stanie:**
- Uruchom: `🔄 Sync Tasks → ❗ Przenieś [!] pilne na górę`
- Wszystkie zadania z `[!]` przeskoczą na górę listy
- Kolejność pilnych między sobą = zachowana
- `[!]` zostaje w tytule (nie jest usuwane)

**Kiedy używać:**
- Coś nagłego wypadło
- Deadline dzisiaj
- Priorytet wyższy niż wszystko inne

---

### 2️⃣ `[30m]`, `[2h]` - Time tracking

**Jak używać:**
Dodaj w tytule po wykonaniu zadania ile czasu zajęło.

**Wspierane formaty:**
```
[30m]    -> 30 minut
[2h]     -> 2 godziny
[1.5h]   -> 1.5 godziny (= 90 minut)
[90m]    -> 90 minut
```

**Przykłady:**
```
PRZED wykonania:
"Napisać raport kwartalny"

PO wykonaniu (dodajesz czas):
"Napisać raport kwartalny [2.5h]"
```

**Co się stanie:**
1. Gdy synchronizujesz z arkuszem: `Pobierz zadania do Arkusza`
   - Kolumna "Czas" automatycznie wypełni się czasem
   
2. Uruchom: `📊 Analiza czasu`
   - Stworzy zakładkę "📊 Analiza Czasu"
   - Pokaże:
     - Łączny czas wszystkich zadań
     - Łączny czas zrobionych zadań
     - Średni czas na zadanie
     - Breakdown per lista
     - Wszystkie zadania z czasem

**Kiedy używać:**
- Po zakończeniu zadania
- Chcesz wiedzieć ile czasu zajmują różne typy zadań
- Optymalizacja planowania

---

### 3️⃣ `[+X]` - Przesuń termin o X dni

**Jak używać:**
Dodaj w **notatkach** zadania: `[+3]`, `[+1]`, `[+7]` etc.

**Przykłady:**
```
Zadanie: "Zadzwonić do dentysty"
Termin: 2026-01-24
Notatki: [+3]

↓ Po uruchomieniu funkcji ↓

Zadanie: "Zadzwonić do dentysty"
Termin: 2026-01-27  (przesunięte o 3 dni)
Notatki: (puste - [+3] usunięte)
```

**Więcej przykładów:**
```
[+1]  -> przesunie na jutro
[+7]  -> przesunie o tydzień
[+14] -> przesunie o 2 tygodnie
```

**Co się stanie:**
- Uruchom: `🔄 Sync Tasks → ⏭️ Przesuń zadania z [+X]`
- Skrypt znajdzie wszystkie zadania z `[+X]` w notatkach
- Przesunie termin o X dni
- Usunie `[+X]` z notatek (żeby nie działało w kółko)

**Kiedy używać:**
- Nie możesz dziś tego zrobić
- Chcesz szybko przesunąć bez ręcznego zmieniania daty
- Batch processing - wiele zadań przesuwasz jednocześnie

---

## 🚀 Menu w Arkuszu

Po odświeżeniu arkusza zobaczysz menu `🔄 Sync Tasks` z opcjami:

### Podstawowe:
- **Pobierz zadania do Arkusza** - sciąga wszystko z Google Tasks do arkusza
- **Wyślij zmiany z Arkusza do Google Tasks** - wysyła edycje z powrotem

### Automatyzacja:
- **📅 Uruchom Plan Dnia** - główna funkcja (jak dotychczas)
- **⏭️ Przesuń zadania z [+X]** - tylko przesuwanie dat
- **❗ Przenieś [!] pilne na górę** - tylko sortowanie pilnych

### Combo:
- **⚡ Uruchom WSZYSTKO** - wywołuje wszystkie 3 funkcje razem:
  1. Przesuwa daty `[+X]`
  2. Uruchamia Plan Dnia
  3. Przenosi `[!]` na górę

### Dodatkowe:
- **📊 Analiza czasu** - generuje dashboard z time trackingu
- **🧹 Wyczyść duplikaty** - naprawia zadania z wielokrotnymi tagami

---

## 📋 Przykładowy Workflow

### Poranny Ritual (6:00 - 6:15)
1. Otwórz Arkusz
2. Kliknij: `⚡ Uruchom WSZYSTKO`
3. Efekt:
   - Zadania z [+X] przesunięte
   - Zadania z terminem dzisiejszym → Plan
   - Zadania pilne [!] na górze planu
4. Zobacz plan dnia w Google Tasks na telefonie

### W ciągu dnia
- Wykonujesz zadania w Google Tasks (aplikacja)
- Po wykonaniu dodajesz czas w tytule: `[45m]`
- Jeśli coś pilne: dodajesz `[!]` i klikniesz w arkuszu `❗ Przenieś [!] pilne`

### Wieczorny Ritual (20:00 - 20:15)
1. Niewykonane zadania: usuń datę (wrócą do oryginalnych list)
2. Lub wpisz w notatkach `[+1]` jeśli na jutro
3. Kliknij: `Pobierz zadania do Arkusza`
4. Kliknij: `📊 Analiza czasu`
5. Zobacz statystyki dnia

### Weekly Review (niedziela wieczór)
1. Przejrzyj zakładkę "📊 Analiza Czasu"
2. Zobacz który typ zadań zajmuje najwięcej czasu
3. Zaplanuj następny tydzień

---

## 💡 Praktyczne Przykłady

### Przykład 1: Nagła pilna sprawa
```
Problem: 
O 14:00 szef pisze: "Pilne! Wyślij raport do 16:00"

Rozwiązanie:
1. W Google Tasks: stwórz zadanie
   "[!] Wysłać raport do szefa"
2. W arkuszu: kliknij "❗ Przenieś [!] pilne"
3. Zadanie przeskoczy na górę Twojego planu
```

### Przykład 2: Dzień chory, przesuwasz wszystko
```
Problem:
Jesteś chory, 10 zadań na dziś musisz przesunąć na pojutrze

Rozwiązanie:
1. Otwórz każde zadanie w Google Tasks
2. W notatkach dodaj: [+2]
3. W arkuszu: kliknij "⏭️ Przesuń zadania z [+X]"
4. Wszystkie 10 zadań przesunięte o 2 dni
```

### Przykład 3: Time tracking i optymalizacja
```
Cel:
Chcesz wiedzieć ile czasu zajmuje Ci pisanie raportów

Rozwiązanie:
1. Przez tydzień przy każdym raporcie dodajesz czas:
   "Raport Q1 [1.5h]"
   "Raport sprzedaży [45m]"
   "Raport finansowy [2h]"
   
2. W niedzielę: kliknij "📊 Analiza czasu"

3. Zobaczysz:
   - Średnio raport = 1.5h
   - Łącznie raporty = 10% Twojego czasu
   - Możesz zoptymalizować lub delegować
```

### Przykład 4: Kombinacja wszystkich funkcji
```
Zadanie: "Przygotować prezentację dla klienta"
Początkowy termin: 2026-01-25

DZIEŃ 1 (23.01):
Tytuł: "Przygotować prezentację dla klienta"
Notatki: (puste)
→ Zadanie pojawi się w planie 25.01

DZIEŃ 2 (24.01):
Odkładasz bo nie masz czasu
Notatki: [+2]
→ Kliknij "Przesuń z [+X]"
→ Termin: 2026-01-27

DZIEŃ 3 (26.01):
Klient pisze że pilne na jutro!
Tytuł: "[!] Przygotować prezentację dla klienta"
→ Kliknij "Przenieś [!] pilne"
→ Zadanie na górze planu

DZIEŃ 4 (27.01):
Wykonujesz zadanie, zajęło 3h
Tytuł: "[!] Przygotować prezentację dla klienta [3h]"
Status: ZROBIONE

DZIEŃ 5 (28.01):
Kliknij "Analiza czasu"
→ Zobaczysz że prezentacje zajmują średnio 3h
→ Następnym razem zarezerwujesz odpowiednio czasu
```

---

## 📊 Arkusz - Kolumny

Po synchronizacji każda zakładka (= lista) ma kolumny:

| Kolumna | Opis | Edytowalna? |
|---------|------|-------------|
| ID | Identyfikator Google Tasks | ❌ NIE (auto) |
| Tytuł | Nazwa zadania | ✅ TAK |
| Notatki | Dodatkowe info, linki, `[+X]` | ✅ TAK |
| Termin | Data RRRR-MM-DD | ✅ TAK |
| Status | ZROBIONE / DO ZROBIENIA | ✅ TAK |
| Czas | Parsowane z `[30m]` w tytule | ❌ NIE (auto) |

**Edytuj w arkuszu → Wyślij zmiany** = Zaktualizuje Google Tasks

---

## 🎓 Dobre Praktyki

### ✅ DO:
- Używaj `[!]` oszczędnie - tylko rzeczywiście pilne
- Dodawaj czas `[30m]` PO wykonaniu, nie przed
- Przeglądaj `📊 Analiza czasu` co tydzień
- `[+X]` w notatkach gdy pewien że przesuwasz
- Uruchamiaj `⚡ WSZYSTKO` rano automatycznie

### ❌ NIE:
- Nie oznaczaj wszystkiego jako `[!]` (wtedy nic nie jest pilne)
- Nie szacuj czasu przed wykonaniem - to tracking, nie estimating
- Nie przesuwaj `[+1]` codziennie tego samego - może usuń zadanie?
- Nie edytuj kolumny "ID" w arkuszu - zepsuje synchronizację
- Nie używaj `[+X]` dla zadań bez terminu - nic nie przesunie

---

## 🔧 Troubleshooting

### Problem: `[!]` nie przenosi na górę
**Rozwiązanie:** Sprawdź czy uruchomiłeś funkcję "❗ Przenieś [!] pilne"

### Problem: `[+3]` nie działa
**Możliwe przyczyny:**
1. `[+3]` jest w tytule zamiast w notatkach
2. Nie uruchomiłeś "⏭️ Przesuń zadania z [+X]"
3. Zadanie nie ma terminu - ustaw najpierw termin

### Problem: Czas się nie sumuje
**Rozwiązanie:**
1. Sprawdź format: `[30m]` lub `[2h]` (nie `30min`, nie `2 hours`)
2. Uruchom "Pobierz zadania do Arkusza"
3. Uruchom "📊 Analiza czasu"

### Problem: Duplikaty tagów
**Rozwiązanie:** Kliknij "🧹 Wyczyść duplikaty" - posprzątają się automatycznie

---

## ⚙️ Automatyzacja (Opcjonalnie)

Chcesz żeby skrypt uruchamiał się automatycznie?

### Ustawienie triggera:
1. W Apps Script kliknij ⏰ (Triggers)
2. Dodaj nowy trigger:
   - Funkcja: `uruchomWszystko`
   - Zdarzenie: Time-driven
   - Typ: Day timer
   - Godzina: 6:00 - 7:00
3. Zapisz

**Efekt:** Codziennie rano o ~6:00 automatycznie wykona się pełna automatyzacja!

---

## 📈 Jak Czytać Analizę Czasu

Zakładka "📊 Analiza Czasu" składa się z 3 sekcji:

### 1. Podsumowanie (góra)
```
Wszystkie zadania: 150
Zadania z czasem: 45
Zadania zrobione: 38

Łączny czas wszystkich zadań: 67.5h
Łączny czas zrobionych zadań: 58h
Łączny czas do zrobienia: 9.5h

Średni czas na zadanie: 1.5h
```

**Co to znaczy:**
- Masz 45 zadań gdzie zalogowałeś czas
- 38 z nich wykonane (84% completion rate)
- Średnio zadanie zajmuje 1.5h
- Zostało ci ~9.5h pracy

### 2. Breakdown per lista (środek)
```
Lista          | Zadania | Łączny | Średni | Status
---------------|---------|--------|--------|--------
Projekt Doktorat | 15    | 28h    | 1.9h   | 12/15
Komputer         | 20    | 15h    | 45m    | 18/20
Telefon          | 10    | 7.5h   | 45m    | 8/10
```

**Co to znaczy:**
- Projekt Doktorat zajmuje najwięcej czasu (1.9h średnio)
- Zadania @Telefon są szybkie (45m średnio)
- Completion rate najgorszy w Doktorat (80%)

### 3. Wszystkie zadania z czasem (dół)
Lista zadań posortowana:
- Najpierw DO ZROBIENIA (żółte tło)
- Potem ZROBIONE (zielone tło)
- W ramach grupy: od najdłuższych do najkrótszych

---

## 🎯 Tips & Tricks

### Tip 1: Batch defer
```
Masz 5 zadań które przesuwasz na przyszły tydzień?
→ Dodaj wszystkim [+7] w notatkach
→ Jeden klik "Przesuń z [+X]"
→ Wszystkie przesunięte
```

### Tip 2: Priorytety przez listy
```
Zamiast tagować [P1], [P2], [P3]...
→ Stwórz listy: "⚡ Priorytet", "📅 Plan", "📋 Kiedyś"
→ Przenoś między listami
→ Wykorzystujesz natywne funkcje Tasks
```

### Tip 3: Daily cap
```
Jeśli w planie jest >5 zadań po [2h] każde...
→ Masz 10h+ pracy zaplanowane
→ Nierealistyczne!
→ Analiza czasu pokaże czy się da
```

### Tip 4: Recurring tasks
```
Zadanie codzienne (np. "Trening [45m]")
→ Nie oznaczaj jako completed, tylko duplicate
→ Ustaw nowy termin
→ Time tracking pokaże consistency
```

---

## 📞 Kontakt / Pytania

Jeśli coś nie działa lub masz pomysły na ulepszenia:
1. Sprawdź Logs: Apps Script → Execution log
2. Sprawdź czy Google Tasks API jest włączone
3. Sprawdź czy skrypt ma uprawnienia do arkusza i Tasks

**Najczęstsze błędy:**
- Brak uprawnień → Autoryzuj skrypt
- Błąd API → Sprawdź limity (250 requests/user/day)
- Wolno działa → Normalne przy >1000 zadań
