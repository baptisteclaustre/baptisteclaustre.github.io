# Site personnel — guide pas à pas

Ce dossier contient un site Eleventy prêt à l'emploi : une page d'accueil,
une page Recherche, une page Enseignement, une page Publications et une page
Contact. Il n'y a rien à coder pour commencer : tu remplis le contenu, et la
mise en page est déjà faite.

## 1. Personnaliser tes informations

Ouvre `src/_data/site.json` et remplace les valeurs (ton nom, ton
laboratoire, ton domaine, ton email...). Ces informations apparaissent
automatiquement sur toutes les pages.

Ensuite, ouvre chaque page dans `src/` (`index.njk`, `recherche.njk`,
`enseignement.njk`, `publications.njk`, `contact.njk`) et remplace le texte
entre crochets `[...]` par ton propre contenu. Tu peux supprimer les
sections qui ne s'appliquent pas, ou dupliquer un bloc `<div class="card">`
pour en ajouter un nouveau.

Tu n'as pas besoin de toucher aux fichiers `.eleventy.js`, `base.njk` ou
`style.css` pour remplir le contenu — ce sont les fichiers "moteur" qui
gèrent la mise en page.

## 2. Installer les outils (une seule fois)

Il te faut [Node.js](https://nodejs.org/) (version 18 ou plus récente)
installé sur ton ordinateur. Une fois fait, ouvre un terminal dans ce
dossier et lance :

```bash
npm install
```

Cela télécharge Eleventy et ses dépendances dans un dossier `node_modules`
(il n'est pas envoyé sur GitHub, c'est normal).

## 3. Prévisualiser le site en local

```bash
npm start
```

Cela ouvre un serveur local, en général sur `http://localhost:8080`. La
page se recharge automatiquement à chaque modification d'un fichier.
`Ctrl+C` dans le terminal pour arrêter.

## 4. Publier sur GitHub Pages

1. Crée un dépôt sur GitHub (public), par exemple nommé `mon-site` ou
   directement `TON-PSEUDO.github.io` si tu veux que le site soit à la
   racine de ton adresse GitHub.
2. Dans ce dossier, initialise git et pousse le code :

   ```bash
   git init
   git add .
   git commit -m "Premier envoi du site"
   git branch -M main
   git remote add origin https://github.com/TON-PSEUDO/NOM-DU-DEPOT.git
   git push -u origin main
   ```

3. Sur GitHub, va dans **Settings → Pages** du dépôt, et choisis comme
   source **"GitHub Actions"** (pas "Deploy from a branch"). Le workflow
   fourni dans `.github/workflows/deploy.yml` construit le site et le
   publie automatiquement à chaque `push` sur `main`.
4. Après quelques minutes, ton site est visible à l'adresse indiquée dans
   l'onglet **Actions** du dépôt une fois le déploiement terminé (en
   général `https://TON-PSEUDO.github.io/NOM-DU-DEPOT/`).

### Important si ton dépôt n'est PAS `TON-PSEUDO.github.io`

Si l'adresse de ton site contient un nom de dépôt après ton pseudo (ex.
`TON-PSEUDO.github.io/mon-site/`), ouvre `.eleventy.js` et décommente la
ligne `pathPrefix`, en remplaçant `NOM-DU-DEPOT` par le nom exact de ton
dépôt :

```js
pathPrefix: "/mon-site/",
```

Sans ça, les images et le CSS ne se chargeront pas correctement une fois en
ligne. Si ton dépôt s'appelle exactement `TON-PSEUDO.github.io`, laisse
cette ligne commentée.

## 5. Mettre à jour le site après publication

À chaque fois que tu modifies du contenu, il suffit de refaire :

```bash
git add .
git commit -m "Mise à jour du contenu"
git push
```

Le site se reconstruit et se republie automatiquement.
