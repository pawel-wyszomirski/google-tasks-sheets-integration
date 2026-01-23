/**
 * Skrypt zarządzający listą zadań "plan" oraz synchronizacją z Arkuszem.
 * * INSTRUKCJA INSTALACJI:
 * 1. Otwórz Arkusz Google -> Rozszerzenia -> Apps Script.
 * 2. Wklej ten kod.
 * 3. Po lewej kliknij "+" przy Usługi (Services) i dodaj "Google Tasks API".
 * 4. Odśwież stronę z arkuszem w przeglądarce.
 */

// --- 1. LOGIKA PLANU DNIA ---

function zarzadzajPlanemDnia() {
  const DOCELOWA_LISTA = "plan";
  
  const wszystkieListy = Tasks.Tasklists.list().items;
  if (!wszystkieListy) return;

  const listaPlan = wszystkieListy.find(l => l.title.toLowerCase() === DOCELOWA_LISTA.toLowerCase());
  if (!listaPlan) return Logger.log("BŁĄD: Nie znaleziono listy 'plan'");

  const dzisiaj = new Date();
  dzisiaj.setHours(0,0,0,0);
  
  const jutroLogika = new Date(dzisiaj);
  jutroLogika.setDate(dzisiaj.getDate() + 1); 

  const jutroDlaAPI = new Date(jutroLogika);
  jutroDlaAPI.setHours(9, 0, 0, 0); 
  const jutroISO = jutroDlaAPI.toISOString();

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
        const noweZadanie = {
          title: zadanie.title + " " + tag,
          notes: (zadanie.notes || "") + "\n_______\n[OriginID:" + lista.id + "]",
          due: jutroISO 
        };

        try {
          Tasks.Tasks.insert(noweZadanie, listaPlan.id);
          Tasks.Tasks.remove(lista.id, zadanie.id);
          Logger.log(">>> Przeniesiono do planu: " + zadanie.title);
        } catch (e) {
          Logger.log("Błąd przenoszenia: " + e.message);
        }
      }

      // AKCJA B: Powrót (tylko jeśli usuniesz datę)
      else if (czyJestWPlanie) {
        if (!terminZadania) {
          const regex = /\[OriginID:(.+?)\]/;
          const match = zadanie.notes ? zadanie.notes.match(regex) : null;

          if (match) {
            const pierwotnaListaId = match[1];
            
            let czystyTytul = zadanie.title
              .replace(/\s#\S+$/, "")       
              .replace(/^\[\d+\]\s*/, "")   
              .trim();

            const czysteNotatki = zadanie.notes
              .replace(/\n_______\n\[OriginID:.+?\]/, "")
              .replace(regex, "")
              .trim();

            const zadaniePowrotne = { title: czystyTytul, notes: czysteNotatki };

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
        if (!zadanie.title.startsWith(prefix)) {
          let tytulBezNumeru = zadanie.title.replace(/^\[\d+\]\s*/, "");
          zadanie.title = prefix + tytulBezNumeru;
          Tasks.Tasks.update(zadanie, listaPlan.id, zadanie.id);
        }
      });
    }
  } catch (e) { 
    Logger.log("Błąd numerowania: " + e.message); 
  }
}

// --- 2. LOGIKA SYNCHRONIZACJI Z ARKUSZEM ---

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
        .addItem('Uruchom Plan Dnia', 'zarzadzajPlanemDnia')
        .addToUi();
  } catch (e) {
    console.warn("Nie można załadować UI (prawdopodobnie uruchomienie ręczne z edytora): " + e.message);
  }
}

/**
 * Tworzy zakładki dla list i wpisuje w nie zadania.
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
    
    const naglowki = [["ID (Nie edytuj)", "Tytuł", "Notatki", "Termin (RRRR-MM-DD)", "Status"]];
    sheet.getRange(1, 1, 1, 5).setValues(naglowki).setFontWeight("bold").setBackground("#f3f3f3");
    sheet.setFrozenRows(1);

    const tasks = Tasks.Tasks.list(lista.id, { showCompleted: true, showHidden: true }).items;
    
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow(), 5).clearContent();
    }

    if (tasks && tasks.length > 0) {
      const wiersze = tasks.map(t => [
        t.id,
        t.title,
        t.notes || "",
        t.due ? t.due.split('T')[0] : "",
        t.status === "completed" ? "ZROBIONE" : "DO ZROBIENIA"
      ]);
      sheet.getRange(2, 1, wiersze.length, 5).setValues(wiersze);
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
    const listaTask = wszystkieListy.find(l => l.title === nazwaListy);
    if (!listaTask) return;

    // Pobieramy aktualną listę zadań z Google, żeby uniknąć niepotrzebnych aktualizacji
    const aktualneZadaniaGoogle = Tasks.Tasks.list(listaTask.id, { showCompleted: true, showHidden: true }).items || [];
    const mapaZadan = Object.fromEntries(aktualneZadaniaGoogle.map(t => [t.id, t]));

    const dane = sheet.getDataRange().getValues();
    
    for (let i = 1; i < dane.length; i++) {
      const id = dane[i][0];
      const tytul = dane[i][1];
      const notatki = dane[i][2];
      const terminRaw = dane[i][3];
      const statusZArkusza = dane[i][4];

      // Formatowanie daty dla API (północ UTC)
      let terminISO = null;
      if (terminRaw) {
        try {
          const d = new Date(terminRaw);
          if (!isNaN(d.getTime())) {
            d.setHours(12, 0, 0, 0); // Ustawienie południa zapobiega przesunięciu strefy czasowej
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

        // Sprawdzanie zmian w tytule
        if (task.title !== tytul) { task.title = tytul; czyZmieniono = true; }
        
        // Sprawdzanie zmian w notatkach
        if ((task.notes || "") !== notatki) { task.notes = notatki; czyZmieniono = true; }
        
        // Sprawdzanie zmian w dacie (porównujemy tylko część daty YYYY-MM-DD)
        const taskDueSimple = task.due ? task.due.split('T')[0] : "";
        const sheetDueSimple = terminISO ? terminISO.split('T')[0] : "";
        if (taskDueSimple !== sheetDueSimple) {
          task.due = terminISO;
          czyZmieniono = true;
        }

        // Sprawdzanie statusu (ZROBIONE <-> completed)
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