# 🐳 Guide de Correction Docker - Diaspora Platform

## ❌ Problème Rencontré

```
Error: Cannot find module '/app/webpack-hmr.config.js'
```

## ✅ Solution Appliquée

1. ✅ Créé `backend/webpack-hmr.config.js`
2. ✅ Ajouté les dépendances webpack dans `package.json`:
   - `webpack-node-externals`
   - `run-script-webpack-plugin`

## 🔧 Étapes pour Corriger (À exécuter sur votre machine)

### Étape 1: Arrêter les conteneurs actuels

```bash
cd C:\Khaly\Diaspora
docker-compose down
```

### Étape 2: Reconstruire les images Docker

```bash
docker-compose build --no-cache
```

**Note**: `--no-cache` force la reconstruction complète pour s'assurer que les nouvelles dépendances sont installées.

### Étape 3: Redémarrer les conteneurs

```bash
docker-compose up -d
```

### Étape 4: Vérifier les logs

```bash
docker logs -f diaspora-backend
```

Vous devriez voir:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
...
```

## 🎯 Commandes Rapides

### Option A: Tout en une seule commande

```bash
cd C:\Khaly\Diaspora
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

### Option B: Mode développement avec logs

```bash
cd C:\Khaly\Diaspora
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## 🔍 Vérification

### 1. Vérifier que les conteneurs sont en cours d'exécution

```bash
docker ps
```

Vous devriez voir:
```
CONTAINER ID   IMAGE              STATUS         PORTS
xxxxx          diaspora-backend   Up X seconds   0.0.0.0:3000->3000/tcp
xxxxx          postgres:15        Up X seconds   5432/tcp
xxxxx          redis:7-alpine     Up X seconds   6379/tcp
```

### 2. Vérifier les logs du backend

```bash
docker logs diaspora-backend
```

### 3. Tester l'API

```bash
curl http://localhost:3000
```

ou ouvrir dans le navigateur: http://localhost:3000

### 4. Tester Swagger

Ouvrir: http://localhost:3000/api/docs

## 📋 Fichiers Créés/Modifiés

### backend/webpack-hmr.config.js (NOUVEAU)
```javascript
const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['webpack/hot/poll?100', options.entry],
    externals: [
      nodeExternals({
        allowlist: ['webpack/hot/poll?100'],
      }),
    ],
    plugins: [
      ...options.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      new RunScriptWebpackPlugin({
        name: options.output.filename,
        autoRestart: false,
      }),
    ],
  };
};
```

### backend/package.json (MODIFIÉ)
Ajouté dans `devDependencies`:
```json
"webpack-node-externals": "^3.0.0",
"run-script-webpack-plugin": "^0.2.0"
```

## ⚠️ Problèmes Potentiels

### Problème 1: "Cannot connect to Docker daemon"

**Solution:**
```bash
# Démarrer Docker Desktop
# Attendre qu'il soit complètement lancé
# Puis réessayer les commandes
```

### Problème 2: "Port 3000 already in use"

**Solution:**
```bash
# Arrêter le processus utilisant le port 3000
# Sur Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou changer le port dans docker-compose.yml
```

### Problème 3: "Database connection failed"

**Solution:**
```bash
# Attendre que PostgreSQL soit complètement démarré
docker logs diaspora-postgres

# Vérifier la connexion
docker exec -it diaspora-postgres psql -U diaspora -d diaspora_dev
```

### Problème 4: Les changements ne sont pas pris en compte

**Solution:**
```bash
# Supprimer complètement les images et volumes
docker-compose down -v
docker system prune -af
docker-compose build --no-cache
docker-compose up -d
```

## 🚀 Démarrage Frontend

Une fois le backend fixé, démarrer le frontend:

```bash
cd C:\Khaly\Diaspora\frontend
npm install
npm run dev
```

Frontend accessible sur: http://localhost:5173

## 📝 Notes Importantes

### Mode Développement Docker

Le mode développement Docker utilise Hot Module Replacement (HMR) pour:
- ✅ Rechargement automatique du code
- ✅ Pas besoin de rebuild après chaque changement
- ✅ Meilleure expérience de développement

### Alternative: Développement Local (Sans Docker)

Si vous préférez développer sans Docker:

```bash
# Terminal 1 - PostgreSQL + Redis avec Docker
docker-compose up postgres redis

# Terminal 2 - Backend en local
cd backend
npm install
npm run prisma:migrate
npm run start:dev

# Terminal 3 - Frontend en local
cd frontend
npm install
npm run dev
```

## ✅ Checklist de Vérification

- [ ] Docker Desktop est lancé
- [ ] `docker-compose down` exécuté
- [ ] `docker-compose build --no-cache` exécuté
- [ ] `docker-compose up -d` exécuté
- [ ] `docker ps` montre 3 conteneurs running
- [ ] `docker logs diaspora-backend` ne montre pas d'erreur
- [ ] http://localhost:3000 accessible
- [ ] http://localhost:3000/api/docs accessible
- [ ] Frontend démarre sur http://localhost:5173

## 🆘 Besoin d'Aide?

Si le problème persiste:

1. Copier les logs complets:
```bash
docker logs diaspora-backend > backend-logs.txt
```

2. Vérifier le statut des conteneurs:
```bash
docker ps -a
docker inspect diaspora-backend
```

3. Vérifier les variables d'environnement:
```bash
docker exec diaspora-backend env
```

---

**Dernière mise à jour**: 2025-11-20
**Status**: ✅ Fix appliqué, rebuild requis
