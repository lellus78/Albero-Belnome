# Linee Guida per i Contributi

Grazie per l'interesse dimostrato verso il progetto Albero-Belnome. Ogni contributo, che si tratti di correzioni di bug, miglioramenti della documentazione o sviluppo di nuove funzionalità, è un valore aggiunto per il progetto.

## Segnalazione di Bug e Richiesta di Funzionalità
Per segnalare anomalie o suggerire miglioramenti, si prega di utilizzare la sezione "Issues" del repository GitHub.
Nella segnalazione di un bug è opportuno includere:
- Il sistema operativo e la versione dell'ambiente di esecuzione.
- I passaggi dettagliati per riprodurre l'errore.
- Il comportamento atteso e il comportamento effettivamente riscontrato.
- Eventuali log di errore.

## Sviluppo e Pull Request
Se si desidera contribuire attivamente al codice, seguire questa procedura:

1. Effettuare il Fork del repository.
2. Creare un branch dedicato alla propria modifica, utilizzando una nomenclatura chiara (es. `feature/nome-funzionalita` o `fix/descrizione-bug`).
   ```bash
   git checkout -b feature/nuova-funzione
   ```
3. Effettuare i commit delle modifiche assicurandosi di redigere messaggi descrittivi e concisi.
   ```bash
   git commit -m "Aggiunta funzionalità di esportazione JSON"
   ```
4. Eseguire il push del branch sul proprio fork.
   ```bash
   git push origin feature/nuova-funzione
   ```
5. Aprire una Pull Request verso il branch principale del repository originale, fornendo una descrizione dettagliata del lavoro svolto.

Tutte le Pull Request saranno soggette a revisione prima dell'integrazione.
