# Per Francesco — Sito giallo in memoria

Tema prevalente giallo. Tre sezioni con gallery, lettera aperta in evidenza, area interattiva doppia con moderazione, menu a tendina in alto a sinistra, contatti.

## Struttura
- `index.html` — homepage completa
- `css/styles.css` — tema giallo
- `js/main.js` — menu, gallery, lightbox, form con salvataggio in localStorage e approvazione
- `admin/index.html` + `admin/admin.js` — pannello approvazione (password default `francesco`)

## Gallery
Metti le tue foto in:
- `images/chi-era/1.jpg` … `6.jpg`
- `images/sua-storia/1.jpg` … `6.jpg`
- `images/nostra-storia/1.jpg` … `6.jpg`
Per più foto aumenta `count` in `js/main.js` → `galleries`.

## Moderazione
- Storie/Pensieri vanno in pending (localStorage)
- Admin approva/rifiuta → compaiono in homepage
- Anonimo possibile (checkbox)
- Esporta JSON da admin

## Avvio locale
Apri `index.html` direttamente o con Live Server (VS Code). Nessun build.

## Personalizzazione
- Testi sezioni: cerca `Chi era Francesco` in `index.html`
- Lettera aperta: `id="letterContent"`
- Contatti: cambia email/tel in sezione `#contatti`
- Password admin: `ADMIN_PASSWORD` in `admin/admin.js`
