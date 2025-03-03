# Utiliser une image Node officielle
FROM node:14

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Compiler le projet NestJS (le build sera dans le dossier dist/)
RUN npm run build

# Exposer le port 3000
EXPOSE 3000

# Lancer l'application
CMD ["node", "dist/main.js"]
