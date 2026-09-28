# Pizza Crunch

A mobile-first ordering site for a pizza shop. Customers browse the menu, build a pizza, and send the full cart on WhatsApp. Staff edit the menu from the browser. The live content sits in one JSON file, so a new deploy is enough to publish changes.

## What it does

- Opening deal popup, then a full-width banner that advances every 4 seconds, pauses when the pointer is over it, and has previous and next controls
- Home page sections for deals, pizzas, burgers, rolls, pasta, and sides, with scroll animations
- A section bar that highlights the area you are scrolling through and jumps straight to it
- Create Your Own Pizza: crust, flavour, size, toppings, running total, quantity
- Flavour pizzas open the same options before they go in the cart. Deals, burgers, rolls, and simple items add in one tap
- Flat discount in settings. Every item can show the old price, the new price, and the percent off
- Cart drawer, toast when something is added, and a checkout message that opens WhatsApp with the order written out
- Menu, about, and contact pages, plus a map when a map search is set
- Staff editor to change the shop name, logo, discount, prices, items, deals, banners, crusts, and toppings
- Download the menu as a JSON backup, or upload a backup to restore it

## Stack

- Angular 19, standalone components
- TypeScript and SCSS
- Menu data in `public/data/store.json`
- Cart saved in the browser
- Staff password stored only as a hash, compared in the browser
- Static hosting. Netlify build command: `npm run build`. Publish `dist/pizza-crunch/browser`

There is no database server. Netlify serves the built site. Orders go out through the customer's own WhatsApp.

## Run

```bash
npm install
npm start
```

## Before you publish contact details

Phone numbers, the street address, the map pin, and the staff username and password are not in this repository. Fill them in the staff editor, then download a backup.

Keep that backup on your computer. Do not commit it. A local copy of the original shop file, if you have one, belongs in `private/` and that folder is gitignored. Posters that show a phone number or the street address are gitignored as well.

To set a staff login, open the editor after you add a username and password hash into `public/data/store.json` on your machine only. Leave those hashes out of git.
