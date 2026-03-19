# Mwongozo: Letter Templates (Barua)

Mwongozo huu unaelezea jinsi ya kusimamia **templates za barua** bila kubadili source code.

## 1) Maana ya vitu muhimu

- **Template**: ni muundo wa barua (Kichwa + Maudhui) unaotengeneza PDF.
- **Template Key**: ni kitambulisho cha template (mfano `barua_umiliki_meneja`). Hii ndiyo inayounganisha template na barua husika.
- **Application Category + Letter Type**: husaidia kuchagua template sahihi kwa aina ya ombi/barua (mfano `meneja`, `mmiliki`).
- **Status (Active/Inactive)**: ikiwa `Inactive`, template haitatumika kwenye barua (lakini bado unaweza kuiona/kuibadili).
- **Versioning**: kila ukihifadhi template, toleo (version) jipya linaongezeka ili history ibaki.

## 2) Hatua za kuhariri (au kuongeza) template

1. Nenda `Barua` → `Templates` (au fungua `/letter-templates`).
2. Chagua template ubonyeze `Edit` (au `Ongeza Template` kuanzisha mpya).
3. Jaza sehemu za juu:
  - `Template Key`: (kwa template mpya tu) mfano `barua_bweni`
  - `Jina`: jina la kueleweka
  - `Application Category`: chagua category husika (au acha `(General)`)
  - `Letter Type`: chagua aina ya barua (au `(None)`)
  - `Status`: iache `Active` kama unataka itumike
4. Kwenye `Title Template` andika kichwa cha barua (unaweza kutumia variables).
5. Kwenye `Body Template` andika maudhui ya barua:
  - **Paragraphs**: tumia mstari mtupu kutenganisha paragraph
  - **Bold/Underline**: unaweza kutumia tags za template kama `<b>...</b>` na `<u>...</u>`
6. Kwenye `Addressee`:
  - Chagua `Addressee Format` kama unataka format ya anwani ijirudie (binafsi/taasisi)
  - Ukichagua format, `Custom Addressee Template` unaweza kuiacha wazi
7. Bonyeza `Hifadhi`.
8. Angalia sehemu ya **Variable Catalog** ndani ya ukurasa huo huo ili kuona variables zinazopatikana na mfano wake.

## 3) Hatua za kuhariri Addressee Format (anwani)

1. Nenda `Barua` → `Addressee Formats` (au fungua `/letter-addressee-templates`).
2. Bonyeza `Ongeza Format` (au `Edit` kuhariri iliyopo).
3. Jaza:
  - `Template Key` (mfano `addressee_taasisi`)
  - `Jina` (mfano “Taasisi (Mwombaji)”)
  - `Addressee Template` (kila mstari ni line moja ya anwani)
4. Bonyeza `Hifadhi`.

## 4) Hatua za ku-preview barua (PDF)

1. Nenda `/letter-templates`.
2. Bonyeza `Preview` kwenye template unayotaka.
3. Kwenye dirisha linalofunguka:
  - Ukichagua `Tracking Number`, barua itaonyesha data halisi
  - Ukiacha wazi, itaonyesha barua ikiwa na variables (placeholders) ili uone muundo/format
4. Bonyeza `Fungua Preview`.

## 5) Variables (mfano wa matumizi)

- `{{variable}}` → hujaza data ya kawaida (salama)
- `{{{variable}}}` → hujaza data “raw” (tumia pale unapohitaji HTML tayari ipo kwenye data)

Mfano:

```text
Ninafurahi kukufahamisha kuwa kibali cha kuanzisha {{school.type_only}} <b>{{school_name}}</b> kimetolewa.
```

## 6) Maneno ya Kiswahili (ya/cha, hii/hiki)

Ili kuzuia makosa ya “ya/cha” na “hii/hiki”, tumia variables hizi:

1. `{{school.noun}}` → `shule` / `chuo`
2. `{{school.of}}` → `ya` / `cha`
3. `{{school.this}}` → `hii` / `hiki`
4. `{{school.type_only}}` → mfano `shule ya sekondari` / `chuo cha ualimu`
5. `{{school.full_name}}` → mfano `shule ya sekondari ABC`

## 7) Notes muhimu

1. Templates zinaonekana/zinatumika kwa watumiaji wenye ruhusa ya `view-letters`.
2. Ukifanya template `Inactive`, haitatumika kwenye barua (lakini bado unaweza kuipreview).
3. Ukiona preview ina variables tu, maana yake hujachagua `Tracking Number` (au kuna data haijakamilika kwenye ombi husika).
