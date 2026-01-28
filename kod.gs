/**
 * Skrypt zarządzający listą zadań "plan" oraz synchronizacją z Arkuszem.
 * 
 * NOWE FUNKCJE:
 * - [!] w tytule = pilne (przenosi na górę listy)
 * - [30m], [2h] w tytule = time tracking (arkusz sumuje czas)
 * - [+3] w notatkach = przesuwa termin o 3 dni
 * 
 * INSTRUKCJA INSTALACJI:
 * 1. Otwórz Arkusz Google -> Rozszerzenia -> Apps Script.
 * 2. Wklej ten kod.
 * 3. Po lewej kliknij "+" przy Usługi (Services) i dodaj "Google Tasks API".
 * 4. Odśwież stronę z arkuszem w przeglądarce.
 */

// ============================================
// FUNKCJE POMOCNICZE DO CZYSZCZENIA
// ============================================

/**
 * Usuwa WSZYSTKIE tagi (#xyz) z tytułu zadania
 */
function usunWszystkieTagi(tytul) {
  return tytul.replace(/\s#\S+/g, '').trim();
}

/**
 * Usuwa WSZYSTKIE OriginID i separatory z notatek
 */
function usunWszystkieOriginID(notatki) {
  if (!notatki) return "";
  
  // Usuwa wszystkie bloki _______\n[OriginID:...]
  let czyste = notatki.replace(/\n*_______\n*\[OriginID:[^\]]+\]\n*/g, '');
  
  // Na wszelki wypadek usuwa same [OriginID:...] bez separatora
  czyste = czyste.replace(/\[OriginID:[^\]]+\]\n*/g, '');
  
  // Usuwa nadmiarowe puste linie
  czyste = czyste.replace(/\n{3,}/g, '\n\n');
  
  return czyste.trim();
}

/**
 * Usuwa numerację [1], [2] etc. z początku tytułu
 */
function usunNumeracje(tytul) {
  return tytul.replace(/^\[\d+\]\s*/, '').trim();
}

/**
 * Parsuje czas z tytułu zadania (wspiera [30m], [2h], [1.5h])
 * Zwraca liczbę minut lub null
 */
function parsujCzas(tytul) {
  if (!tytul) return null;
  
  // Szuka [Xm] lub [Xh] lub [X.Xh]
  const matchMinuty = tytul.match(/\[(\d+)m\]/);
  const matchGodziny = tytul.match(/\[(\d+(?:\.\d+)?)h\]/);
  
  if (matchMinuty) {
    return parseInt(matchMinuty[1]);
  }
  
  if (matchGodziny) {
    return Math.round(parseFloat(matchGodziny[1]) * 60);
  }
  
  return null;
}

/**
 * Formatuje minuty do czytelnej formy (np. 90 → "1.5h")
 */
function formatujCzas(minuty) {
  if (!minuty) return "";
  
  if (minuty < 60) {
    return minuty + "m";
  } else {
    const godziny = (minuty / 60).toFixed(1);
    return godziny + "h";
  }
}

// ============================================
// LOGIKA PLANU DNIA
// ============================================

function zarzadzajPlanemDnia() {
  const DOCELOWA_LISTA = "plan";
  
  const wszystkieListy = Tasks.Tasklists.list().items;
  if (!wszystkieListy) return;

  const listaPlan = wszystkieListy.find(l => l.title.toLowerCase() === DOCELOWA_LISTA.toLowerCase());
  if (!listaPlan) return Logger.log("BŁĄD: Nie znaleziono listy 'plan'");

  const dzisiaj = new Date();
  dzisiaj.setHours(0,0,0,0);
  
  // Data dla zadań przeniesionych do planu (dzisiaj, nie jutro!)
  const dzisiajDlaAPI = new Date(dzisiaj);
  dzisiajDlaAPI.setHours(9, 0, 0, 0); 
  const dzisiajISO = dzisiajDlaAPI.toISOString();

  wszystkieListy.forEach(lista => {
    const wynik = Tasks.Tasks.list(lista.id, { showCompleted: false });
    const zadania = wynik.items;
    if (!zadania) return;

    zadania.forEach(zadanie => {
      const czyJestWPlanie = (lista.id === listaPlan.id);
      
      let terminZadania = null;
      if (zadanie.due) {
        terminZadania = new Date(zadanie.due);
        terminZadania.setHours(0,0,0,0);
      }

      const czyDzisiaj = terminZadania && terminZadania.getTime() === dzisiaj.getTime();

      // AKCJA A: Przenoszenie do planu
      if (czyDzisiaj && !czyJestWPlanie) {
        const tag = "#" + lista.title.replace(/\s+/g, '');
        
        // Czyszczenie tytułu ze starych tagów i numeracji
        let czystyTytul = usunWszystkieTagi(zadanie.title);
        czystyTytul = usunNumeracje(czystyTytul);
        
        // Czyszczenie notatek ze wszystkich starych OriginID
        let czysteNotatki = usunWszystkieOriginID(zadanie.notes || "");
        
        // Dodajemy nowy tag i nowy OriginID
        const noweZadanie = {
          title: czystyTytul + " " + tag,
          notes: czysteNotatki + (czysteNotatki ? "\n" : "") + "_______\n[OriginID:" + lista.id + "]",
          due: dzisiajISO  // POPRAWKA: Termin = DZISIAJ (nie jutro!)
        };

        try {
          Tasks.Tasks.insert(noweZadanie, listaPlan.id);
          Tasks.Tasks.remove(lista.id, zadanie.id);
          Logger.log(">>> Przeniesiono do planu: " + czystyTytul);
        } catch (e) {
          Logger.log("Błąd przenoszenia: " + e.message);
        }
      }

      // AKCJA B: Powrót (tylko jeśli usuniesz datę)
      else if (czyJestWPlanie) {
        if (!terminZadania) {
          // Szukamy OSTATNIEGO OriginID (najbardziej aktualnego)
          const regex = /\[OriginID:(.+?)\]/g;
          const matches = [];
          let match;
          
          while ((match = regex.exec(zadanie.notes || "")) !== null) {
            matches.push(match[1]);
          }

          if (matches.length > 0) {
            const pierwotnaListaId = matches[matches.length - 1];
            
            // Czyszczenie WSZYSTKICH tagów i numeracji
            let czystyTytul = usunWszystkieTagi(zadanie.title);
            czystyTytul = usunNumeracje(czystyTytul);

            // Czyszczenie WSZYSTKICH OriginID i separatorów
            const czysteNotatki = usunWszystkieOriginID(zadanie.notes);

            const zadaniePowrotne = { 
              title: czystyTytul, 
              notes: czysteNotatki 
            };

            try {
              Tasks.Tasks.insert(zadaniePowrotne, pierwotnaListaId);
              Tasks.Tasks.remove(listaPlan.id, zadanie.id);
              Logger.log("<<< Powrót: " + czystyTytul);
            } catch (e) {
              Logger.log("Błąd powrotu: " + e.message);
            }
          }
        }
      }
    });
  });

  // Numeracja w planie wg kolejności ręcznej
  try {
    const wynikPlan = Tasks.Tasks.list(listaPlan.id, { showCompleted: false });
    let zadaniaWPlanie = wynikPlan.items;
    if (zadaniaWPlanie && zadaniaWPlanie.length > 0) {
      zadaniaWPlanie.sort((a, b) => a.position.localeCompare(b.position));
      zadaniaWPlanie.forEach((zadanie, index) => {
        const numer = index + 1;
        const prefix = `[${numer}] `;
        
        // Usuwamy starą numerację przed dodaniem nowej
        let tytulBezNumeru = usunNumeracje(zadanie.title);
        
        if (!zadanie.title.startsWith(prefix)) {
          zadanie.title = prefix + tytulBezNumeru;
          Tasks.Tasks.update(zadanie, listaPlan.id, zadanie.id);
        }
      });
    }
  } catch (e) { 
    Logger.log("Błąd numerowania: " + e.message); 
  }
}

// ============================================
// NOWA FUNKCJA: OBSŁUGA [+X] - PRZESUWANIE DAT
// ============================================

function obslugujPrzesuniecia() {
  const wszystkieListy = Tasks.Tasklists.list().items;
  if (!wszystkieListy) return;
  
  let licznikPrzesuniec = 0;

  wszystkieListy.forEach(lista => {
    const wynik = Tasks.Tasks.list(lista.id, { showCompleted: false });
    const zadania = wynik.items;
    if (!zadania) return;

    zadania.forEach(zadanie => {
      // Szukamy [+X] w notatkach (np. [+3], [+7], [+1])
      const match = zadanie.notes?.match(/\[(\+\d+)\]/);
      
      if (match) {
        const dni = parseInt(match[1]); // np. +3 -> 3
        
        // Aktualna data zadania (lub dzisiaj jeśli brak)
        let nowaData = zadanie.due ? new Date(zadanie.due) : new Date();
        nowaData.setHours(0, 0, 0, 0);
        
        // Przesuwamy o X dni
        nowaData.setDate(nowaData.getDate() + dni);
        nowaData.setHours(9, 0, 0, 0);
        
        // Aktualizujemy zadanie
        zadanie.due = nowaData.toISOString();
        
        // Usuwamy polecenie z notatek
        zadanie.notes = zadanie.notes.replace(/\[\+\d+\]\s*/g, '').trim();
        
        try {
          Tasks.Tasks.update(zadanie, lista.id, zadanie.id);
          licznikPrzesuniec++;
          Logger.log(`Przesunięto "${zadanie.title}" o ${dni} dni`);
        } catch (e) {
          Logger.log(`Błąd przesuwania: ${e.message}`);
        }
      }
    });
  });
  
  if (licznikPrzesuniec > 0) {
    try {
      SpreadsheetApp.getUi().alert(`Przesunięto ${licznikPrzesuniec} zadań!`);
    } catch(e) {
      Logger.log(`Przesunięto ${licznikPrzesuniec} zadań!`);
    }
  }
}

// ============================================
// NOWA FUNKCJA: OBSŁUGA [!] - PILNE NA GÓRĘ
// ============================================

function obslugujPilne() {
  const wszystkieListy = Tasks.Tasklists.list().items;
  if (!wszystkieListy) return;
  
  let licznikPilnych = 0;

  wszystkieListy.forEach(lista => {
    const wynik = Tasks.Tasks.list(lista.id, { showCompleted: false });
    const zadania = wynik.items;
    if (!zadania) return;

    // Sortujemy zadania po pozycji
    zadania.sort((a, b) => a.position.localeCompare(b.position));

    // Zbieramy pilne zadania
    const pilne = zadania.filter(z => z.title.includes('[!]'));
    
    if (pilne.length > 0) {
      // Znajdujemy pierwszą pozycję (najmniejszą)
      const pierwszaPozycja = zadania[0].position;
      
      // Dla każdego pilnego zadania
      pilne.forEach((zadanie, index) => {
        // Generujemy pozycję jeszcze wyżej niż pierwsza
        // Używamy alfabetycznego sortowania - dodajemy znaki przed pierwszą pozycją
        const nowaPozycja = String.fromCharCode(pierwszaPozycja.charCodeAt(0) - pilne.length + index);
        
        if (zadanie.position !== nowaPozycja) {
          zadanie.position = nowaPozycja;
          
          try {
            // UWAGA: move() API przenosi zadanie na nową pozycję
            Tasks.Tasks.move(lista.id, zadanie.id, { previous: null });
            licznikPilnych++;
            Logger.log(`Przeniesiono na górę: ${zadanie.title}`);
          } catch (e) {
            Logger.log(`Błąd przenoszenia pilnego: ${e.message}`);
          }
        }
      });
    }
  });
  
  if (licznikPilnych > 0) {
    try {
      SpreadsheetApp.getUi().alert(`Przeniesiono ${licznikPilnych} pilnych zadań na górę!`);
    } catch(e) {
      Logger.log(`Przeniesiono ${licznikPilnych} pilnych zadań na górę!`);
    }
  }
}

// ============================================
// MENU I AUTOMATYZACJA
// ============================================

/**
 * Menu górne w Arkuszu. Pojawi się po odświeżeniu strony arkusza.
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🔄 Sync Tasks')
        .addItem('Pobierz zadania do Arkusza', 'synchronizujZadaniaDoArkusza')
        .addItem('Wyślij zmiany z Arkusza do Google Tasks', 'synchronizujZArkuszaDoZadan')
        .addSeparator()
        .addItem('📅 Uruchom Plan Dnia', 'zarzadzajPlanemDnia')
        .addItem('⏭️ Przesuń zadania z [+X]', 'obslugujPrzesuniecia')
        .addItem('❗ Przenieś [!] pilne na górę', 'obslugujPilne')
        .addSeparator()
        .addItem('⚡ Uruchom WSZYSTKO (Plan + Przesunięcia + Pilne)', 'uruchomWszystko')
        .addSeparator()
        .addItem('📊 Analiza czasu', 'analizaCzasu')
        .addItem('🧹 Wyczyść wszystkie duplikaty tagów/OriginID', 'wyczyscDuplikatyWszedzie')
        .addToUi();
  } catch (e) {
    console.warn("Nie można załadować UI (prawdopodobnie uruchomienie ręczne z edytora): " + e.message);
  }
}

/**
 * Uruchamia wszystkie funkcje razem
 */
function uruchomWszystko() {
  Logger.log("=== ROZPOCZĘCIE PEŁNEJ AUTOMATYZACJI ===");
  
  obslugujPrzesuniecia();
  Logger.log("✓ Przesunięcia wykonane");
  
  zarzadzajPlanemDnia();
  Logger.log("✓ Plan dnia zaktualizowany");
  
  obslugujPilne();
  Logger.log("✓ Pilne przeniesione na górę");
  
  try {
    SpreadsheetApp.getUi().alert('✅ Wszystkie operacje wykonane!\n\n- Przesunięto zadania z [+X]\n- Zaktualizowano Plan Dnia\n- Przeniesiono [!] pilne na górę');
  } catch(e) {
    Logger.log("✅ Wszystkie operacje wykonane!");
  }
}

// ============================================
// CZYSZCZENIE DUPLIKATÓW
// ============================================

/**
 * Jednorazowe czyszczenie wszystkich zadań z duplikatów
 */
function wyczyscDuplikatyWszedzie() {
  const wszystkieListy = Tasks.Tasklists.list().items;
  if (!wszystkieListy) return;
  
  let licznikWyczyszczonych = 0;

  wszystkieListy.forEach(lista => {
    const wynik = Tasks.Tasks.list(lista.id, { showCompleted: false });
    const zadania = wynik.items;
    if (!zadania) return;

    zadania.forEach(zadanie => {
      let czyZmieniono = false;
      
      // Czyścimy tytuł
      let nowyTytul = zadanie.title;
      const numeracja = nowyTytul.match(/^\[\d+\]\s*/);
      const czystegoTytulu = usunWszystkieTagi(usunNumeracje(nowyTytul));
      
      // Zbieramy unikalne tagi
      const tagi = [...new Set((nowyTytul.match(/#\S+/g) || []))];
      
      // Zachowujemy [!] jeśli istnieje
      const czyPilne = nowyTytul.includes('[!]');
      
      // Odbudowujemy tytuł: numeracja + [!] + czysty tytuł + unikalne tagi
      nowyTytul = (numeracja ? numeracja[0] : '') + 
                  (czyPilne ? '[!] ' : '') +
                  czystegoTytulu;
      if (tagi.length > 0) {
        nowyTytul += ' ' + tagi.join(' ');
      }
      
      if (nowyTytul !== zadanie.title) {
        zadanie.title = nowyTytul;
        czyZmieniono = true;
      }
      
      // Czyścimy notatki
      const noweNotatki = usunWszystkieOriginID(zadanie.notes);
      
      // Zachowujemy tylko OSTATNI OriginID jeśli istnieje
      const regex = /\[OriginID:(.+?)\]/g;
      const matches = [];
      let match;
      while ((match = regex.exec(zadanie.notes || "")) !== null) {
        matches.push(match[1]);
      }
      
      let finalneNotatki = noweNotatki;
      if (matches.length > 0) {
        const ostatniOriginID = matches[matches.length - 1];
        finalneNotatki = noweNotatki + (noweNotatki ? "\n" : "") + "_______\n[OriginID:" + ostatniOriginID + "]";
      }
      
      if (finalneNotatki !== zadanie.notes) {
        zadanie.notes = finalneNotatki;
        czyZmieniono = true;
      }
      
      if (czyZmieniono) {
        try {
          Tasks.Tasks.update(zadanie, lista.id, zadanie.id);
          licznikWyczyszczonych++;
          Logger.log("Wyczyszczono: " + zadanie.title);
        } catch (e) {
          Logger.log("Błąd czyszczenia: " + e.message);
        }
      }
    });
  });
  
  try {
    SpreadsheetApp.getUi().alert(`Wyczyszczono ${licznikWyczyszczonych} zadań z duplikatów!`);
  } catch(e) {
    Logger.log(`Wyczyszczono ${licznikWyczyszczonych} zadań z duplikatów!`);
  }
}

// ============================================
// SYNCHRONIZACJA Z ARKUSZEM
// ============================================

/**
 * Tworzy zakładki dla list i wpisuje w nie zadania + PARSUJE CZAS
 */
function synchronizujZadaniaDoArkusza() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const listy = Tasks.Tasklists.list().items;
  if (!listy) return;

  listy.forEach(lista => {
    let sheet = ss.getSheetByName(lista.title);
    if (!sheet) {
      sheet = ss.insertSheet(lista.title);
    }
    
    // ZMIANA: Dodano kolumnę "Czas"
    const naglowki = [["ID (Nie edytuj)", "Tytuł", "Notatki", "Termin (RRRR-MM-DD)", "Status", "Czas"]];
    sheet.getRange(1, 1, 1, 6).setValues(naglowki).setFontWeight("bold").setBackground("#f3f3f3");
    sheet.setFrozenRows(1);

    const tasks = Tasks.Tasks.list(lista.id, { showCompleted: true, showHidden: true }).items;
    
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow(), 6).clearContent();
    }

    if (tasks && tasks.length > 0) {
      const wiersze = tasks.map(t => {
        const czas = parsujCzas(t.title);
        return [
          t.id,
          t.title,
          t.notes || "",
          t.due ? t.due.split('T')[0] : "",
          t.status === "completed" ? "ZROBIONE" : "DO ZROBIENIA",
          czas ? formatujCzas(czas) : ""  // NOWA KOLUMNA
        ];
      });
      sheet.getRange(2, 1, wiersze.length, 6).setValues(wiersze);
    }
  });
  
  try {
    SpreadsheetApp.getUi().alert('Pobrano wszystkie zadania do arkusza!');
  } catch(e) {}
}

/**
 * Wysyła zmiany z arkusza do Google Tasks (nowe zadania ORAZ edycja istniejących).
 */
function synchronizujZArkuszaDoZadan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const arkusze = ss.getSheets();
  const wszystkieListy = Tasks.Tasklists.list().items;

  arkusze.forEach(sheet => {
    const nazwaListy = sheet.getName();
    
    // Pomijamy zakładki specjalne
    if (nazwaListy === "📊 Analiza Czasu") return;
    
    const listaTask = wszystkieListy.find(l => l.title === nazwaListy);
    if (!listaTask) return;

    // Pobieramy aktualną listę zadań z Google
    const aktualneZadaniaGoogle = Tasks.Tasks.list(listaTask.id, { showCompleted: true, showHidden: true }).items || [];
    const mapaZadan = Object.fromEntries(aktualneZadaniaGoogle.map(t => [t.id, t]));

    const dane = sheet.getDataRange().getValues();
    
    for (let i = 1; i < dane.length; i++) {
      const id = dane[i][0];
      const tytul = dane[i][1];
      const notatki = dane[i][2];
      const terminRaw = dane[i][3];
      const statusZArkusza = dane[i][4];
      // Kolumna 5 (Czas) jest read-only - ignorujemy

      // Formatowanie daty dla API
      let terminISO = null;
      if (terminRaw) {
        try {
          const d = new Date(terminRaw);
          if (!isNaN(d.getTime())) {
            d.setHours(12, 0, 0, 0);
            terminISO = d.toISOString();
          }
        } catch(e) {}
      }

      // 1. DODAWANIE NOWEGO ZADANIA (brak ID)
      if (!id && tytul) {
        const noweZadanie = { 
          title: tytul, 
          notes: notatki,
          due: terminISO
        };
        
        try {
          const stworzone = Tasks.Tasks.insert(noweZadanie, listaTask.id);
          sheet.getRange(i + 1, 1).setValue(stworzone.id);
          Logger.log(`Dodano nowe: ${tytul}`);
        } catch (e) {
          Logger.log(`Błąd tworzenia zadania: ${e.message}`);
        }
      } 
      
      // 2. AKTUALIZACJA ISTNIEJĄCEGO ZADANIA (jest ID)
      else if (id && mapaZadan[id]) {
        const task = mapaZadan[id];
        let czyZmieniono = false;

        if (task.title !== tytul) { task.title = tytul; czyZmieniono = true; }
        if ((task.notes || "") !== notatki) { task.notes = notatki; czyZmieniono = true; }
        
        const taskDueSimple = task.due ? task.due.split('T')[0] : "";
        const sheetDueSimple = terminISO ? terminISO.split('T')[0] : "";
        if (taskDueSimple !== sheetDueSimple) {
          task.due = terminISO;
          czyZmieniono = true;
        }

        const oczekiwanyStatus = (statusZArkusza === "ZROBIONE") ? "completed" : "needsAction";
        if (task.status !== oczekiwanyStatus) {
          task.status = oczekiwanyStatus;
          czyZmieniono = true;
        }

        if (czyZmieniono) {
          try {
            Tasks.Tasks.update(task, listaTask.id, id);
            Logger.log(`Zaktualizowano: ${tytul}`);
          } catch (e) {
            Logger.log(`Błąd aktualizacji ID ${id}: ${e.message}`);
          }
        }
      }
    }
  });
  
  try {
    SpreadsheetApp.getUi().alert('Zmiany zostały zsynchronizowane z Google Tasks!');
  } catch(e) {}
}

// ============================================
// NOWA FUNKCJA: ANALIZA CZASU
// ============================================

/**
 * Tworzy dashboard z analizą czasu na podstawie zadań z [30m], [2h] etc.
 */
function analizaCzasu() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Znajdź lub stwórz zakładkę "📊 Analiza Czasu"
  let dashboardSheet = ss.getSheetByName("📊 Analiza Czasu");
  if (!dashboardSheet) {
    dashboardSheet = ss.insertSheet("📊 Analiza Czasu");
  } else {
    dashboardSheet.clear();
  }
  
  // Zbierz wszystkie zadania z wszystkich list
  const wszystkieListy = Tasks.Tasklists.list().items;
  if (!wszystkieListy) return;
  
  let zadaniaZCzasem = [];
  let sumaWszystkichZadan = 0;
  let sumaZrobionychZadan = 0;
  let sumaCzasuWszystkie = 0;
  let sumaCzasuZrobione = 0;
  
  wszystkieListy.forEach(lista => {
    const wynik = Tasks.Tasks.list(lista.id, { showCompleted: true, showHidden: true });
    const zadania = wynik.items;
    if (!zadania) return;
    
    zadania.forEach(zadanie => {
      const czas = parsujCzas(zadanie.title);
      const czyZrobione = zadanie.status === "completed";
      
      sumaWszystkichZadan++;
      if (czyZrobione) sumaZrobionychZadan++;
      
      if (czas) {
        sumaCzasuWszystkie += czas;
        if (czyZrobione) sumaCzasuZrobione += czas;
        
        zadaniaZCzasem.push({
          lista: lista.title,
          tytul: zadanie.title,
          czas: czas,
          status: czyZrobione ? "ZROBIONE" : "DO ZROBIENIA",
          termin: zadanie.due ? zadanie.due.split('T')[0] : ""
        });
      }
    });
  });
  
  // SEKCJA 1: Podsumowanie
  const podsumowanie = [
    ["📊 ANALIZA CZASU - PODSUMOWANIE"],
    [""],
    ["Zaktualizowano:", new Date().toLocaleString('pl-PL')],
    [""],
    ["Wszystkie zadania:", sumaWszystkichZadan],
    ["Zadania z czasem:", zadaniaZCzasem.length],
    ["Zadania zrobione:", sumaZrobionychZadan],
    [""],
    ["⏱️ CZAS"],
    ["Łączny czas wszystkich zadań:", formatujCzas(sumaCzasuWszystkie)],
    ["Łączny czas zrobionych zadań:", formatujCzas(sumaCzasuZrobione)],
    ["Łączny czas do zrobienia:", formatujCzas(sumaCzasuWszystkie - sumaCzasuZrobione)],
    [""],
    ["Średni czas na zadanie:", formatujCzas(Math.round(sumaCzasuWszystkie / zadaniaZCzasem.length))],
  ];
  
  dashboardSheet.getRange(1, 1, podsumowanie.length, 2).setValues(podsumowanie);
  dashboardSheet.getRange(1, 1).setFontSize(14).setFontWeight("bold");
  dashboardSheet.getRange("A1:B1").setBackground("#4285f4").setFontColor("#ffffff");
  
  // SEKCJA 2: Breakdown per lista
  let currentRow = podsumowanie.length + 3;
  
  dashboardSheet.getRange(currentRow, 1, 1, 5).setValues([["📋 CZAS PER LISTA"]]);
  dashboardSheet.getRange(currentRow, 1, 1, 5).setBackground("#34a853").setFontColor("#ffffff").setFontWeight("bold");
  currentRow++;
  
  const naglowkiLista = [["Lista", "Zadania z czasem", "Łączny czas", "Średni czas", "Status"]];
  dashboardSheet.getRange(currentRow, 1, 1, 5).setValues(naglowkiLista).setFontWeight("bold").setBackground("#f3f3f3");
  currentRow++;
  
  // Grupowanie per lista
  const perLista = {};
  zadaniaZCzasem.forEach(z => {
    if (!perLista[z.lista]) {
      perLista[z.lista] = { suma: 0, liczba: 0, zrobione: 0 };
    }
    perLista[z.lista].suma += z.czas;
    perLista[z.lista].liczba++;
    if (z.status === "ZROBIONE") perLista[z.lista].zrobione++;
  });
  
  const wierszePerLista = Object.entries(perLista).map(([lista, dane]) => [
    lista,
    dane.liczba,
    formatujCzas(dane.suma),
    formatujCzas(Math.round(dane.suma / dane.liczba)),
    `${dane.zrobione}/${dane.liczba} zrobione`
  ]);
  
  if (wierszePerLista.length > 0) {
    dashboardSheet.getRange(currentRow, 1, wierszePerLista.length, 5).setValues(wierszePerLista);
    currentRow += wierszePerLista.length + 2;
  }
  
  // SEKCJA 3: Wszystkie zadania z czasem
  dashboardSheet.getRange(currentRow, 1, 1, 5).setValues([["📝 WSZYSTKIE ZADANIA Z CZASEM"]]);
  dashboardSheet.getRange(currentRow, 1, 1, 5).setBackground("#fbbc04").setFontColor("#000000").setFontWeight("bold");
  currentRow++;
  
  const naglowkiZadania = [["Lista", "Zadanie", "Czas", "Status", "Termin"]];
  dashboardSheet.getRange(currentRow, 1, 1, 5).setValues(naglowkiZadania).setFontWeight("bold").setBackground("#f3f3f3");
  currentRow++;
  
  if (zadaniaZCzasem.length > 0) {
    // Sortuj: najpierw do zrobienia, potem wg czasu malejąco
    zadaniaZCzasem.sort((a, b) => {
      if (a.status !== b.status) return a.status === "DO ZROBIENIA" ? -1 : 1;
      return b.czas - a.czas;
    });
    
    const wierszeZadania = zadaniaZCzasem.map(z => [
      z.lista,
      z.tytul,
      formatujCzas(z.czas),
      z.status,
      z.termin
    ]);
    
    dashboardSheet.getRange(currentRow, 1, wierszeZadania.length, 5).setValues(wierszeZadania);
    
    // Kolorowanie wierszy wg statusu
    for (let i = 0; i < wierszeZadania.length; i++) {
      const kolor = wierszeZadania[i][3] === "ZROBIONE" ? "#d9ead3" : "#fff2cc";
      dashboardSheet.getRange(currentRow + i, 1, 1, 5).setBackground(kolor);
    }
  }
  
  // Dopasuj szerokości kolumn
  dashboardSheet.autoResizeColumns(1, 5);
  
  try {
    SpreadsheetApp.getUi().alert(`Analiza czasu zaktualizowana!\n\nZnaleziono ${zadaniaZCzasem.length} zadań z czasem.\nŁączny czas: ${formatujCzas(sumaCzasuWszystkie)}`);
  } catch(e) {
    Logger.log(`Analiza czasu zaktualizowana! ${zadaniaZCzasem.length} zadań.`);
  }
}
