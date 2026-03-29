# Husko — image pour Google Cloud Run
# Build : export statique web (Expo) · Runtime : serve sur $PORT (défaut 8080)
#
# Build local : docker build -t husko-web .
# Cloud Run : le port est injecté via la variable d’environnement PORT.

# ---------- Étape 1 : bundle web ----------
FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_ENV=production \
    CI=1

COPY package.json package-lock.json* .npmrc ./

RUN npm install

COPY . .

RUN npx expo export --platform web

# ---------- Étape 2 : serveur fichiers statiques ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080

RUN npm install -g serve@14.2.4

COPY --from=builder /app/dist ./dist

EXPOSE 8080

USER node

# Cloud Run définit PORT ; serve écoute sur toutes les interfaces
CMD ["sh", "-c", "exec serve -s dist -l tcp://0.0.0.0:${PORT:-8080}"]
