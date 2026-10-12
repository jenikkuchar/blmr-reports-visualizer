# Nasazení na blmr-reports-visualizer.jan-kuchar.cz (GitHub Pages + DNS ve WEDOS)

Aplikace se builduje GitHub Actions workflow `.github/workflows/deploy.yml`
při každém pushi do `main` (lze spustit i ručně přes *Actions → Run workflow*).
Soubor `public/CNAME` zajišťuje, že vlastní doména zůstane nastavená i po každém deployi.

## 1. GitHub – zapnutí Pages

1. Repo → **Settings → Pages**.
2. **Build and deployment → Source:** `GitHub Actions`.
3. Mergni změny do `main` → workflow proběhne a nasadí web
   (zatím na `https://jenikkuchar.github.io/blmr-reports-visualizer/`, plně funkční bude až s doménou).

## 2. (Doporučeno) Ověření domény na GitHubu

Chrání doménu před převzetím cizím GitHub účtem.

1. GitHub → avatar → **Settings → Pages → Add a domain** → `jan-kuchar.cz`.
2. GitHub ukáže TXT záznam, např.
   `_github-pages-challenge-jenikkuchar.jan-kuchar.cz` = `<kód>`.
3. Ten přidej ve WEDOS DNS (viz níže) a pak klikni **Verify**.

## 3. WEDOS – DNS záznam

WEDOS administrace (client.wedos.com) → **Domény → jan-kuchar.cz → DNS záznamy**.

1. Pokud pro `blmr-reports-visualizer` existuje záznam **A / AAAA**
   (např. subdoména založená ve webhostingu), **smaž ho** – CNAME nesmí koexistovat s jiným záznamem stejného jména.
   Pokud je subdoména založená i ve **webhostingu (Subdomény)**, odeber ji i tam, jinak ji WEDOS může vracet zpět.
2. Přidej záznam:

   | Jméno                     | TTL  | Typ   | Data                    |
   |---------------------------|------|-------|-------------------------|
   | `blmr-reports-visualizer` | 300  | CNAME | `jenikkuchar.github.io.` |

   (Do jména jen subdoménu, ne celé `…jan-kuchar.cz`. Tečka na konci dat podle toho, jak to WEDOS formulář vyžaduje – bez ní WEDOS obvykle doplní doménu sám, proto ji zadej.)
3. Případně TXT záznam pro ověření z kroku 2 (jméno `_github-pages-challenge-jenikkuchar`).
4. **Uložit a aplikovat změny** – WEDOS změny DNS publikuje se zpožděním (obvykle do ~15 min, max. pár hodin).

Kontrola:
```bash
dig +short blmr-reports-visualizer.jan-kuchar.cz CNAME
# → jenikkuchar.github.io.
```

## 4. GitHub – vlastní doména a HTTPS

1. Repo → **Settings → Pages → Custom domain**: `blmr-reports-visualizer.jan-kuchar.cz` → **Save**
   (mělo by se vyplnit samo z `CNAME` po prvním deployi).
2. Počkej na úspěšný **DNS check** (zelená fajfka).
3. Po vystavení certifikátu (až ~1 h) zaškrtni **Enforce HTTPS**.

Hotovo: <https://blmr-reports-visualizer.jan-kuchar.cz>

## Poznámky / řešení problémů

- `vite.config.ts` nemá `base` – správně, s vlastní doménou běží aplikace z kořene `/`.
- **„Domain's DNS record could not be retrieved"** → DNS se ještě nepropsalo, nebo zůstal starý A záznam.
- **Certifikát se nevystavuje** → zkontroluj, že neexistuje CAA záznam na `jan-kuchar.cz`, který by blokoval
  Let's Encrypt (případně přidej `0 issue "letsencrypt.org"`), pak v Pages doménu odeber a znovu ulož.
- Doménu měň vždy v `public/CNAME` i v nastavení Pages.
