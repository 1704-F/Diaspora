# Spécifications UX/UI & Design System

## 🎨 Table des Matières

1. [Principes de Design](#principes-de-design)
2. [Personas Utilisateurs](#personas-utilisateurs)
3. [User Journey](#user-journey)
4. [Architecture de l'Information](#architecture-de-linformation)
5. [Design System](#design-system)
6. [Wireframes Clés](#wireframes-clés)
7. [Responsive Design](#responsive-design)
8. [Accessibilité](#accessibilité)

---

## 🎯 Principes de Design

### Vision Design

Créer une expérience qui inspire **confiance**, **transparence** et **professionnalisme** tout en restant **simple** et **accessible** pour tous les niveaux de compétence technique.

### Principes Fondamentaux

#### 1. 🎯 Clarté avant tout
- **Hiérarchie visuelle claire**: L'information la plus importante est immédiatement visible
- **Langage simple**: Pas de jargon, termes compréhensibles par tous
- **Actions évidentes**: Les boutons et actions sont explicites
- **Feedback immédiat**: Chaque action reçoit une confirmation visuelle

#### 2. 💎 Transparence par le Design
- **Visualisation des données**: Graphiques intuitifs et accessibles
- **Traçabilité visible**: Historique et logs accessibles
- **États clairs**: Statuts visuellement distincts (payé, en attente, en retard)

#### 3. 🌍 Inclusivité
- **Multi-langues natif**: Interface adaptée à chaque langue
- **Multi-devises**: Affichage clair des conversions
- **Accessible**: WCAG 2.1 niveau AA minimum
- **Performant**: Fonctionne sur connexions lentes

#### 4. 📱 Mobile-First
- **Responsive**: Adapté à tous les écrans
- **Touch-friendly**: Boutons suffisamment grands
- **Offline-capable**: Fonctionnalités basiques hors ligne

#### 5. 🚀 Efficacité
- **Moins de clics**: Parcours optimisés
- **Shortcuts**: Raccourcis pour utilisateurs avancés
- **Bulk actions**: Actions groupées possibles
- **Smart defaults**: Valeurs par défaut intelligentes

---

## 👥 Personas Utilisateurs

### Persona 1: Amadou - Le Président d'Association

**Profil:**
- 45 ans, cadre supérieur en France
- Président association ressortissants village (80 membres)
- Utilise ordinateur et smartphone
- Niveau technique: Moyen

**Besoins:**
- Vue d'ensemble rapide de l'association
- Validation des décisions importantes
- Communication avec les membres
- Rapports pour AG

**Frustrations Actuelles:**
- Manque de visibilité en temps réel
- Trop de temps passé en administratif
- Difficile de mobiliser les membres
- Rapports manuels chronophages

**Objectifs avec la Plateforme:**
- Gagner du temps (80% de réduction)
- Transparence totale
- Professionnaliser l'image
- Faciliter la participation

### Persona 2: Fatou - La Trésorière

**Profil:**
- 38 ans, comptable
- Trésorière depuis 3 ans
- Très à l'aise avec Excel et outils numériques
- Niveau technique: Élevé

**Besoins:**
- Suivi précis des finances
- Enregistrement rapide des paiements
- Génération de rapports
- Traçabilité complète

**Frustrations Actuelles:**
- Excel limité et risqué
- Enregistrements manuels longs
- Relances cotisations chronophages
- Difficile de produire rapports clairs

**Objectifs avec la Plateforme:**
- Automatiser le maximum
- Réduire les erreurs à zéro
- Rapports en 1 clic
- Plus de temps pour l'analyse

### Persona 3: Ibrahim - Le Membre Actif

**Profil:**
- 32 ans, ingénieur aux USA
- Membre depuis 5 ans
- Utilise surtout smartphone
- Niveau technique: Élevé

**Besoins:**
- Payer facilement ses cotisations
- Voir l'utilisation de son argent
- Participer aux décisions
- Suivre les projets

**Frustrations Actuelles:**
- Paiements compliqués (Western Union, etc.)
- Manque de visibilité sur les finances
- Communication inefficace
- Ne sait pas si son argent est bien utilisé

**Objectifs avec la Plateforme:**
- Paiement en 2 clics
- Transparence totale
- Participation facilitée
- Impact visible

### Persona 4: Mariama - Le Membre Peu Actif

**Profil:**
- 55 ans, infirmière au UK
- Membre depuis 10 ans
- Utilise peu le numérique
- Niveau technique: Faible

**Besoins:**
- Interface très simple
- Rappels cotisations
- Voir événements importants
- Aide disponible

**Frustrations Actuelles:**
- Outils trop complexes
- Oublie de payer
- Se sent déconnectée
- N'ose pas demander de l'aide

**Objectifs avec la Plateforme:**
- Comprendre facilement
- Ne rien oublier
- Se sentir incluse
- Support patient

---

## 🗺️ User Journey

### Journey 1: Première Connexion Président

```
1. Landing Page
   ↓ "Créer mon association" (CTA)
2. Inscription
   ↓ Email + Mot de passe
3. Vérification Email
   ↓ Clic lien
4. Onboarding - Étape 1: Info Association
   ↓ Nom, logo, devise, langue
5. Onboarding - Étape 2: Configuration
   ↓ Types cotisations, montants
6. Onboarding - Étape 3: Premier Membre
   ↓ Ajouter soi-même + trésorier
7. Dashboard Vide mais Guidé
   ↓ Tooltips, suggestions
8. Action Guidée: Ajouter 3 membres
   ↓ Import CSV ou manuel
9. Action Guidée: Inviter membres
   ↓ Emails automatiques
10. Dashboard Actif
    ✅ Onboarding terminé

Temps estimé: 10-15 minutes
```

### Journey 2: Paiement Cotisation par Membre

```
1. Email Notification
   "Votre cotisation de janvier est disponible"
   ↓ CTA "Payer maintenant"
2. Login (ou déjà connecté)
   ↓
3. Page Paiement
   - Montant: 50€
   - Mois: Janvier 2025
   - Statut: En attente
   ↓ "Payer par carte"
4. Stripe Checkout
   ↓ Infos carte
5. Confirmation Paiement
   ✅ Reçu par email
   ✅ Notification dans app
   ↓
6. Dashboard Membre
   Statut: À jour jusqu'à janvier 2025

Temps estimé: 2-3 minutes
```

### Journey 3: Création Projet par Président

```
1. Dashboard
   ↓ Menu "Projets"
2. Liste Projets (vide)
   ↓ "Nouveau projet"
3. Formulaire Projet
   - Titre: "Construction école primaire"
   - Description: ...
   - Budget: 50 000€
   - Responsable: Sélection membre
   - Dates: Début/Fin
   ↓ "Créer le projet"
4. Page Projet Créé
   ✅ Confirmation
   - Option: Partager avec membres
   - Option: Ajouter première mise à jour
   ↓
5. Dashboard Projets
   Nouveau projet visible
   Statut: Planifié

Temps estimé: 5 minutes
```

---

## 📐 Architecture de l'Information

### Sitemap

```
PLATEFORME
│
├── 🏠 ACCUEIL (Landing Page - Public)
│   ├── Features
│   ├── Pricing
│   ├── Testimonials
│   ├── FAQ
│   └── Login/Register
│
├── 🔐 AUTHENTICATION
│   ├── Login
│   ├── Register
│   ├── Forgot Password
│   └── Email Verification
│
├── 🎯 DASHBOARD (Post-login)
│   ├── Vue Président/Admin
│   │   ├── KPIs Financiers
│   │   ├── Graphiques
│   │   ├── Activité Récente
│   │   ├── Alertes
│   │   └── Raccourcis
│   │
│   └── Vue Membre
│       ├── Mes Cotisations
│       ├── Prochains Événements
│       ├── Projets Actifs
│       └── Mon Profil
│
├── 👥 MEMBRES
│   ├── Liste Membres
│   │   ├── Tableau
│   │   ├── Filtres (statut, section, rôle)
│   │   ├── Recherche
│   │   └── Actions Groupées
│   │
│   ├── Détail Membre
│   │   ├── Infos Personnelles
│   │   ├── Historique Cotisations
│   │   ├── Historique Paiements
│   │   └── Activité
│   │
│   ├── Ajouter Membre
│   ├── Import CSV
│   └── Export Excel
│
├── 💰 FINANCES
│   ├── Dashboard Financier
│   │   ├── Solde
│   │   ├── Recettes/Dépenses
│   │   └── Graphiques
│   │
│   ├── Cotisations
│   │   ├── Configuration Types
│   │   ├── Génération
│   │   └── Suivi
│   │
│   ├── Paiements
│   │   ├── Historique
│   │   ├── En attente
│   │   └── Enregistrer Manuel
│   │
│   ├── Transactions
│   │   ├── Liste
│   │   ├── Ajouter Dépense
│   │   ├── Ajouter Recette
│   │   └── Justificatifs
│   │
│   └── Budget
│       ├── Vue Budget
│       ├── Créer Budget
│       └── Suivi vs Réalisé
│
├── 🎯 PROJETS
│   ├── Liste Projets
│   ├── Détail Projet
│   │   ├── Infos
│   │   ├── Budget
│   │   ├── Avancement
│   │   ├── Mises à jour
│   │   └── Documents/Photos
│   │
│   └── Créer Projet
│
├── 📅 ÉVÉNEMENTS
│   ├── Calendrier
│   ├── Liste Événements
│   ├── Détail Événement
│   │   ├── Infos
│   │   ├── Participants
│   │   ├── Documents
│   │   └── Compte-rendu
│   │
│   └── Créer Événement
│
├── 📊 RAPPORTS
│   ├── Rapports Prédéfinis
│   ├── Rapport Mensuel
│   ├── Rapport Annuel
│   └── Exports
│
└── ⚙️ PARAMÈTRES
    ├── Association
    │   ├── Infos Générales
    │   ├── Configuration
    │   └── Sections (si multi)
    │
    ├── Utilisateurs & Rôles
    │   ├── Gestion Rôles
    │   └── Permissions
    │
    ├── Cotisations
    │   └── Types & Montants
    │
    ├── Notifications
    │   └── Préférences
    │
    ├── Intégrations
    │   └── Paiements, etc.
    │
    └── Mon Profil
        ├── Infos Personnelles
        ├── Sécurité
        └── Préférences
```

---

## 🎨 Design System

### Palette de Couleurs

#### Couleurs Principales
```css
/* Primaire - Vert (Représente croissance, prospérité) */
--primary-50:  #E8F5E9;
--primary-100: #C8E6C9;
--primary-200: #A5D6A7;
--primary-300: #81C784;
--primary-400: #66BB6A;
--primary-500: #4CAF50; /* Principale */
--primary-600: #43A047;
--primary-700: #388E3C;
--primary-800: #2E7D32;
--primary-900: #1B5E20;

/* Secondaire - Orange/Doré (Chaleur africaine) */
--secondary-50:  #FFF3E0;
--secondary-100: #FFE0B2;
--secondary-200: #FFCC80;
--secondary-300: #FFB74D;
--secondary-400: #FFA726;
--secondary-500: #FF9800; /* Principale */
--secondary-600: #FB8C00;
--secondary-700: #F57C00;
--secondary-800: #EF6C00;
--secondary-900: #E65100;
```

#### Couleurs Sémantiques
```css
/* Succès */
--success: #4CAF50;
--success-light: #81C784;
--success-dark: #388E3C;

/* Danger / Erreur */
--danger: #F44336;
--danger-light: #E57373;
--danger-dark: #D32F2F;

/* Attention / Warning */
--warning: #FF9800;
--warning-light: #FFB74D;
--warning-dark: #F57C00;

/* Info */
--info: #2196F3;
--info-light: #64B5F6;
--info-dark: #1976D2;
```

#### Couleurs Neutres
```css
/* Gris */
--gray-50:  #FAFAFA;
--gray-100: #F5F5F5;
--gray-200: #EEEEEE;
--gray-300: #E0E0E0;
--gray-400: #BDBDBD;
--gray-500: #9E9E9E;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;

/* Texte */
--text-primary: #212121;
--text-secondary: #757575;
--text-disabled: #BDBDBD;
--text-hint: #9E9E9E;

/* Backgrounds */
--bg-default: #FFFFFF;
--bg-paper: #FAFAFA;
--bg-dark: #212121;
```

### Typographie

#### Fonts
```css
/* Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-heading: 'Poppins', sans-serif;
--font-mono: 'Roboto Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Font Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

#### Hiérarchie
```css
/* Headings */
h1 {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
}

h2 {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
}

h3 {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
}

/* Body */
body {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}
```

### Spacing

```css
/* Échelle 8pt */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
--spacing-16: 4rem;    /* 64px */
--spacing-20: 5rem;    /* 80px */
--spacing-24: 6rem;    /* 96px */
```

### Borders & Radius

```css
/* Border Width */
--border-thin: 1px;
--border-medium: 2px;
--border-thick: 4px;

/* Border Radius */
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;

/* Border Colors */
--border-color: var(--gray-300);
--border-light: var(--gray-200);
--border-dark: var(--gray-400);
```

### Shadows

```css
/* Ombres */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

### Composants UI

#### Boutons

```css
/* Bouton Primaire */
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--primary-600);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Tailles */
.btn-sm { padding: var(--spacing-2) var(--spacing-4); font-size: var(--text-sm); }
.btn-md { padding: var(--spacing-3) var(--spacing-6); font-size: var(--text-base); }
.btn-lg { padding: var(--spacing-4) var(--spacing-8); font-size: var(--text-lg); }

/* Variantes */
.btn-secondary { background: var(--secondary-500); }
.btn-outline { background: transparent; border: 2px solid var(--primary-500); color: var(--primary-500); }
.btn-ghost { background: transparent; color: var(--primary-500); }
.btn-danger { background: var(--danger); }
```

#### Cards

```css
.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

.card-header {
  border-bottom: 1px solid var(--border-light);
  padding-bottom: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}
```

#### Inputs

```css
.input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.input-error {
  border-color: var(--danger);
}
```

#### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.badge-success { background: var(--success-light); color: var(--success-dark); }
.badge-danger { background: var(--danger-light); color: var(--danger-dark); }
.badge-warning { background: var(--warning-light); color: var(--warning-dark); }
.badge-info { background: var(--info-light); color: var(--info-dark); }
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* Tablettes portrait */
--breakpoint-md: 768px;   /* Tablettes landscape */
--breakpoint-lg: 1024px;  /* Desktop petit */
--breakpoint-xl: 1280px;  /* Desktop moyen */
--breakpoint-2xl: 1536px; /* Desktop large */
```

### Grille

```css
/* 12 colonnes */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

@media (min-width: 640px) {
  .container { padding: 0 var(--spacing-6); }
}

@media (min-width: 1024px) {
  .container { padding: 0 var(--spacing-8); }
}
```

### Adaptations Mobiles

**Dashboard:**
- Statistiques empilées verticalement
- Graphiques simplifiés
- Menu hamburger

**Tableaux:**
- Vue carte sur mobile
- Scroll horizontal si nécessaire
- Filtres dans drawer

**Formulaires:**
- Champs pleine largeur
- Labels au-dessus des inputs
- Boutons pleine largeur

---

## ♿ Accessibilité

### Standards
- WCAG 2.1 Niveau AA minimum
- Keyboard navigation complète
- Screen reader friendly
- Contraste suffisant (4.5:1 min)

### Implémentation
- Labels explicites sur tous les inputs
- ARIA labels où nécessaire
- Focus visible
- Skip links
- Alt text sur images
- Semantic HTML

---

## 🎨 Wireframes Clés

### 1. Dashboard Président

```
┌────────────────────────────────────────────────────────┐
│ [Logo] Diaspora Platform          [Notifications] [👤] │
├────────────────────────────────────────────────────────┤
│ Sidebar                 │  Main Content                 │
│ ┌──────────────┐       │                               │
│ │ 🏠 Dashboard  │       │  📊 Vue d'Ensemble            │
│ │ 👥 Membres    │       │                               │
│ │ 💰 Finances   │       │  ┌─────────────────────────┐ │
│ │ 🎯 Projets    │       │  │ Solde: 45 320€          │ │
│ │ 📅 Événements │       │  │ ↗ +12% ce mois          │ │
│ │ 📊 Rapports   │       │  └─────────────────────────┘ │
│ │ ⚙️  Paramètres│       │                               │
│ └──────────────┘       │  ┌──────┐ ┌──────┐ ┌──────┐  │
│                         │  │35 200│ │8 900€│ │1 220€│  │
│                         │  │Recet.│ │Dépen.│ │En att│  │
│                         │  └──────┘ └──────┘ └──────┘  │
│                         │                               │
│                         │  📈 [Graphique Cotisations]  │
│                         │                               │
│                         │  📋 Activité Récente          │
│                         │  • Nouveau membre: Jean D.   │
│                         │  • Paiement: Marie K. 50€    │
│                         │  • Projet: École - 15%       │
│                         │                               │
│                         │  ⚠️  Alertes                  │
│                         │  • 5 cotisations en retard   │
│                         │  • AG dans 15 jours          │
└─────────────────────────┴───────────────────────────────┘
```

### 2. Liste Membres

```
┌────────────────────────────────────────────────────────┐
│ 👥 Membres (87)                                        │
│                                                         │
│ [🔍 Rechercher...] [Filtres ▾] [+ Ajouter] [↓ Import] │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Nom          │ Statut │ Cotisation │ Actions     │  │
│ ├──────────────────────────────────────────────────┤  │
│ │ 👤 Amadou D. │ ✅ Actif│ ✅ À jour  │ [👁][✏️]    │  │
│ │ 👤 Fatou S.  │ ✅ Actif│ ⚠️ Retard  │ [👁][✏️]    │  │
│ │ 👤 Ibrahim K.│ ✅ Actif│ ✅ À jour  │ [👁][✏️]    │  │
│ │ ...                                               │  │
│ └──────────────────────────────────────────────────┘  │
│                                                         │
│ [Pagination: 1 2 3 ... 9]                             │
└─────────────────────────────────────────────────────────┘
```

### 3. Page Paiement Membre

```
┌────────────────────────────────────────────────────────┐
│ 💰 Payer ma cotisation                                 │
│                                                         │
│ ┌──────────────────────────────────────────────────┐  │
│ │                                                   │  │
│ │  Cotisation de Janvier 2025                      │  │
│ │                                                   │  │
│ │  Montant: 50,00 €                                │  │
│ │  Date limite: 31 janvier 2025                    │  │
│ │  Statut: En attente                              │  │
│ │                                                   │  │
│ │  ┌────────────────────────────────────────────┐ │  │
│ │  │ [💳] Payer par carte bancaire              │ │  │
│ │  │      (Paiement sécurisé via Stripe)        │ │  │
│ │  └────────────────────────────────────────────┘ │  │
│ │                                                   │  │
│ │  Historique de paiements:                        │  │
│ │  ✅ Décembre 2024 - 50€ - 05/12/2024            │  │
│ │  ✅ Novembre 2024 - 50€ - 03/11/2024            │  │
│ │                                                   │  │
│ └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Checklist Design

### Phase Conception
- [ ] Valider personas avec utilisateurs réels
- [ ] Mapper tous les user journeys critiques
- [ ] Créer sitemap détaillé
- [ ] Définir design system complet
- [ ] Créer wireframes basse fidélité
- [ ] Valider wireframes avec équipe

### Phase Design
- [ ] Créer maquettes haute fidélité (Figma)
- [ ] Design responsive (mobile/tablette/desktop)
- [ ] Créer composants réutilisables
- [ ] Définir animations et transitions
- [ ] Créer prototype interactif
- [ ] Tests utilisateurs sur prototype

### Phase Développement
- [ ] Implémenter design system en code
- [ ] Bibliothèque de composants React
- [ ] Tests d'accessibilité
- [ ] Tests responsive multi-navigateurs
- [ ] Performance (Core Web Vitals)
- [ ] Validation WCAG 2.1 AA

---

## 🎯 Prochaines Étapes Design

1. **Créer maquettes Figma** des écrans prioritaires:
   - Landing page
   - Login/Register
   - Dashboard (Président et Membre)
   - Liste membres
   - Page paiement
   - Détail projet

2. **Valider avec stakeholders** et associations pilotes

3. **Itérer** selon feedback

4. **Créer prototype interactif** pour tests utilisateurs

5. **Finaliser design system** pour développement

**Le design n'est pas juste l'apparence, c'est comment ça fonctionne. 🎨✨**