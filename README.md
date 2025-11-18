# Diaspora Management Platform

![Status](https://img.shields.io/badge/status-in_development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)

> La plateforme SaaS modulaire pour la gestion des associations de la diaspora africaine

## 🎯 Vision

Fournir une plateforme tout-en-un permettant à la diaspora africaine de gérer efficacement leurs associations, investissements, engagements familiaux et projets communautaires avec transparence, traçabilité et simplicité.

## 📦 Modules

### Phase 1: Module Associations (MVP - En cours)
- ✅ Gestion complète des membres
- ✅ Système de cotisations et paiements
- ✅ Dashboard financier et statistiques
- ✅ Gestion des projets communautaires
- ✅ Événements et assemblées générales
- ✅ Multi-devises et multi-langues
- ✅ Rapports et exports

### Phases Futures
- Module Investissements au Pays
- Module Gestion Familiale
- Module Tontines
- Module Marketplace

## 🏗️ Architecture

### Stack Technique

**Frontend**
- React 18+ avec TypeScript
- Material-UI (MUI) pour les composants
- Redux Toolkit pour la gestion d'état
- React Query pour les requêtes API
- i18next pour l'internationalisation

**Backend**
- Node.js 20+ LTS
- NestJS avec TypeScript
- PostgreSQL 15+ (base de données principale)
- Redis (cache et sessions)
- Prisma ORM

**Infrastructure**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- AWS / DigitalOcean (production)

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- Git

### Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd Diaspora
```

2. **Configurer les variables d'environnement**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. **Lancer avec Docker Compose**
```bash
docker-compose up -d
```

4. **Accéder à l'application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

### Développement Local (sans Docker)

**Backend**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 📁 Structure du Projet

```
Diaspora/
├── frontend/              # Application React
│   ├── src/
│   │   ├── app/          # Configuration app
│   │   ├── features/     # Modules par feature
│   │   ├── shared/       # Composants partagés
│   │   └── services/     # Services API
│   └── package.json
│
├── backend/              # API NestJS
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── modules/     # Modules métier
│   │   ├── shared/      # Code partagé
│   │   └── database/    # Migrations & seeds
│   └── package.json
│
├── docs/                 # Documentation complète
│   ├── 01_VISION_GLOBALE.md
│   ├── 02_CAHIER_DES_CHARGES_MODULE_ASSOCIATION.md
│   ├── 03_ARCHITECTURE_TECHNIQUE.md
│   ├── 04_PLAN_DEVELOPPEMENT_MVP.md
│   ├── 05_STRATEGIE_BUSINESS.md
│   └── 06_SPECIFICATIONS_UX_UI.md
│
├── docker-compose.yml    # Configuration Docker
├── .github/             # GitHub Actions
└── README.md
```

## 🧪 Tests

### Backend
```bash
cd backend
npm run test              # Tests unitaires
npm run test:e2e         # Tests E2E
npm run test:cov         # Couverture
```

### Frontend
```bash
cd frontend
npm run test             # Tests unitaires
npm run test:e2e        # Tests E2E
```

## 📚 Documentation

La documentation complète du projet se trouve dans le dossier `/docs`:

- [Vision Globale](./01_VISION_GLOBALE.md)
- [Cahier des Charges - Module Associations](./02_CAHIER_DES_CHARGES_MODULE_ASSOCIATION.md)
- [Architecture Technique](./03_ARCHITECTURE_TECHNIQUE.md)
- [Plan de Développement MVP](./04_PLAN_DEVELOPPEMENT_MVP.md)
- [Stratégie Business](./05_STRATEGIE_BUSINESS.md)
- [Spécifications UX/UI](./06_SPECIFICATIONS_UX_UI.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.

## 📄 License

MIT License - voir [LICENSE](./LICENSE) pour plus de détails.

## 🌍 Multi-devises & Multi-langues

### Devises Supportées (Phase 1)
- EUR (Euro)
- USD (Dollar américain)
- XOF (Franc CFA - Afrique de l'Ouest)
- XAF (Franc CFA - Afrique Centrale)
- GBP (Livre Sterling)

### Langues Supportées (Phase 1)
- Français (priorité)
- Anglais

## 👨‍💻 Équipe

- **Product Owner**: TBD
- **Tech Lead**: TBD
- **Développeurs**: TBD

## 📞 Contact

Pour toute question ou suggestion, contactez-nous à: [contact@diaspora-platform.com](mailto:contact@diaspora-platform.com)

---

**Made with ❤️ for the African Diaspora**
