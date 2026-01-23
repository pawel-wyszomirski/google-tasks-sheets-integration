# ⚡ Quick Reference - Ściągawka

## 🎯 3 Nowe Funkcje

### 1. `[!]` = PILNE
- **Gdzie:** W tytule zadania
- **Przykład:** `[!] Zadzwonić do klienta`
- **Działanie:** Przenieś [!] pilne na górę
- **Efekt:** Zadanie przeskakuje na górę listy

### 2. `[30m]`, `[2h]` = TIME TRACKING  
- **Gdzie:** W tytule zadania (PO wykonaniu)
- **Przykład:** `Napisać raport [2.5h]`
- **Działanie:** Analiza czasu
- **Efekt:** Dashboard ze statystykami czasu

### 3. `[+3]` = PRZESUŃ O 3 DNI
- **Gdzie:** W NOTATKACH zadania
- **Przykład:** Notatki: `[+3]`
- **Działanie:** Przesuń zadania z [+X]
- **Efekt:** Termin +3 dni, [+3] znika z notatek

---

## 📋 Menu - Co Kliknąć

| Chcę... | Kliknij |
|---------|---------|
| Wszystko naraz (automatyzacja) | ⚡ Uruchom WSZYSTKO |
| Tylko plan dnia | 📅 Uruchom Plan Dnia |
| Tylko przesunięcia [+X] | ⏭️ Przesuń zadania z [+X] |
| Tylko pilne [!] | ❗ Przenieś [!] pilne na górę |
| Statystyki czasu | 📊 Analiza czasu |
| Naprawić duplikaty | 🧹 Wyczyść duplikaty |
| Pobrać z Tasks do arkusza | Pobierz zadania do Arkusza |
| Wysłać z arkusza do Tasks | Wyślij zmiany z Arkusza |

---

## ⏰ Typowy Dzień

### Rano (6:00)
```
1. Otwórz arkusz
2. Kliknij: ⚡ Uruchom WSZYSTKO
3. Zobacz plan w Google Tasks
```

### W ciągu dnia
```
→ Wykonujesz zadania
→ Po wykonaniu dodaj czas: [45m]
→ Coś pilnego? Dodaj [!] i kliknij menu
```

### Wieczorem (20:00)
```
1. Niewykonane: usuń datę LUB dodaj [+1] w notatkach
2. Kliknij: Pobierz zadania do Arkusza
3. Kliknij: 📊 Analiza czasu
4. Zobacz co zajęło najwięcej czasu
```

---

## ✅ Format czasu (wspierane)

| Format | Znaczenie |
|--------|-----------|
| [30m] | 30 minut |
| [1h] | 1 godzina |
| [2h] | 2 godziny |
| [1.5h] | 1.5 godziny (90 min) |
| [90m] | 90 minut |

❌ NIE: `30min`, `2 hours`, `1:30`, `90 minut`

---

## ✅ Format przesunięć

| Format | Znaczenie |
|--------|-----------|
| [+1] | Jutro |
| [+3] | Za 3 dni |
| [+7] | Za tydzień |
| [+14] | Za 2 tygodnie |

⚠️ **WAŻNE:** `[+X]` zawsze w NOTATKACH, nie w tytule!

---

## 🚨 Częste Błędy

| Błąd | Rozwiązanie |
|------|-------------|
| [+3] nie działa | Sprawdź czy w notatkach (nie w tytule) |
| [!] nie przenosi | Uruchom "❗ Przenieś [!] pilne" |
| Czas się nie sumuje | Format: [30m] nie "30 minut" |
| Duplikaty tagów | Kliknij "🧹 Wyczyść duplikaty" |

---

## 💡 Pro Tips

**Batch defer:**  
5 zadań na przyszły tydzień? → Wszystkim daj [+7] → Jeden klik

**Realistic planning:**  
Zobacz sumę czasu w planie. Masz 10h zadań a tylko 6h? Zmniejsz.

**Weekly review:**  
Niedzielą wieczorem → Analiza czasu → Zobacz trendy

**Automation:**  
Apps Script → Triggers → `uruchomWszystko` codziennie o 6:00

---

## 🎯 Kombinacje

### Pilne NA JUTRO
```
Tytuł: [!] Wysłać ofertę
Notatki: [+1]
→ Uruchom WSZYSTKO
→ Przesunie na jutro + da na górę planu
```

### Time tracking + pilne
```
Tytuł: [!] Naprawić bug [3h]
→ Pilne zadanie które zajęło 3h
→ Statystyki pokażą ile czasu tracisz na bugfixy
```

### Planowanie realistyczne
```
1. W planie: 8 zadań po [2h] = 16h
2. Analiza czasu: "Za dużo!"
3. Przesuniesz połowę: [+1]
4. Realny plan: 8h
```

---

## 📊 Czytanie Analizy Czasu

### Czerwone flagi 🚩
- Łączny czas w planie >10h → Nierealistyczne
- Completion rate <50% → Za dużo zadań
- Średni czas >3h → Może rozbić na mniejsze?

### Dobre sygnały ✅
- Completion rate >80%
- Średni czas 30m-2h (manageable chunks)
- Łączny czas zrobionych rośnie co tydzień

---

## 🔄 Update tego skryptu

Jeśli dostajesz nową wersję:

1. **Backup obecny kod:**
   - Apps Script → File → Make a copy
   
2. **Wklej nowy kod:**
   - Ctrl+A (zaznacz wszystko)
   - Ctrl+V (wklej nowy)
   - Ctrl+S (zapisz)
   
3. **Odśwież arkusz:**
   - F5 w przeglądarce
   - Menu powinno się pojawić

4. **Test:**
   - Kliknij "⚡ Uruchom WSZYSTKO"
   - Sprawdź czy działa

---

## 📞 Help!

**Skrypt nie działa:**
1. Apps Script → View → Logs (sprawdź błędy)
2. Sprawdź czy Google Tasks API włączone
3. Sprawdź uprawnienia (może trzeba autoryzować)

**Wolno działa:**
- Normalne przy >500 zadań
- Google Tasks API limit: 250 requests/day/user

**Coś się popsuło:**
- "🧹 Wyczyść duplikaty" naprawia większość problemów
- Najgorzej: usuń wszystkie zadania i importuj z backupu

---

## 🎓 Nauka przez użycie

### Tydzień 1: Podstawy
- Używaj tylko `⚡ Uruchom WSZYSTKO` rano
- Dodawaj czas [30m] do zadań
- Obserwuj co się dzieje

### Tydzień 2: Pilne
- Zacznij używać [!] dla pilnych
- Zobacz różnicę w produktywności

### Tydzień 3: Przesuwanie
- Eksperymentuj z [+X]
- Zobacz jak ułatwia planowanie

### Tydzień 4: Optymalizacja
- Przeglądaj Analizę czasu co niedzielę
- Dostosowuj workflow
- Automatyzacja przez triggery?

---

**Miłego używania! 🚀**
