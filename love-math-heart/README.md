# Mám ťa rád - GitHub Pages verzia

## Čo je hotové
- Pomalá animácia jedného srdca (8 sekúnd)
- Text `Mám ťa rád`
- Otázka `Pôjdeš so mnou na rande?`
- Tlačidlá `Áno` a `Nie`

## Dôležité
GitHub Pages je statický hosting, sám o sebe neukladá odpovede.
Aby si vedel, čo klikla, potrebuješ endpoint (webhook).

## Najjednoduchšie: Formspree
1. Vytvor si formulár na Formspree a zober endpoint, napr. `https://formspree.io/f/xxxxabcd`.
2. Otvor `script.js` a nastav:

```js
const WEBHOOK_URL = "https://formspree.io/f/xxxxabcd";
```

3. Nahraj projekt na GitHub a zapni GitHub Pages.

Potom sa pri kliknutí `Áno/Nie` odošle JSON s odpoveďou a časom.
