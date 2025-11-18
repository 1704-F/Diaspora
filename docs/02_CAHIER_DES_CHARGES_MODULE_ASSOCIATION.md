# Cahier des Charges - Module Associations

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités Principales](#fonctionnalités-principales)
3. [Types d'Associations](#types-dassociations)
4. [Gestion des Membres](#gestion-des-membres)
5. [Système de Cotisations](#système-de-cotisations)
6. [Gestion Financière](#gestion-financière)
7. [Projets et Initiatives](#projets-et-initiatives)
8. [Événements](#événements)
9. [Système de Permissions](#système-de-permissions)
10. [Multi-devises et Multi-langues](#multi-devises-et-multi-langues)
11. [Exports et Rapports](#exports-et-rapports)

---

## 📖 Vue d'ensemble

Le module Associations permet aux organisations de la diaspora de gérer l'ensemble de leurs activités: membres, cotisations, finances, projets et événements.

### Objectifs Principaux
- Simplifier la gestion administrative
- Assurer la transparence financière
- Faciliter la participation des membres
- Permettre le suivi des projets et initiatives

---

## 🎯 Fonctionnalités Principales

### 1. Tableau de Bord (Dashboard)

#### Pour les Administrateurs
- Vue d'ensemble financière (recettes, dépenses, solde)
- Graphiques interactifs:
  - Évolution des cotisations dans le temps
  - Répartition des dépenses par catégorie
  - Taux de participation des membres
  - État d'avancement des projets
- Notifications et alertes:
  - Cotisations en retard
  - Échéances de projets
  - Événements à venir
- Statistiques clés (KPIs):
  - Nombre de membres actifs
  - Taux de paiement des cotisations
  - Budget disponible
  - Nombre de projets en cours

#### Pour les Membres
- Statut de leurs cotisations
- Historique de paiements
- Événements à venir
- Projets de l'association
- Solde de leur compte (si applicable)

---

## 🏢 Types d'Associations

### Association Simple
**Caractéristiques:**
- Structure unique
- Un seul bureau exécutif
- Membres dans une zone géographique principale
- Une devise principale
- Une langue principale

**Cas d'usage:**
Association de ressortissants d'un village basés en France

### Association Multi-sections
**Caractéristiques:**
- Association mère (centrale)
- Sections régionales/nationales
- Autonomie partielle des sections
- Consolidation des données au niveau central

**Structure hiérarchique:**
```
Association Mère (Globale)
├── Section France
│   ├── Bureau France
│   ├── Membres France
│   └── Projets locaux France
├── Section USA
│   ├── Bureau USA
│   ├── Membres USA
│   └── Projets locaux USA
└── Section Afrique
    ├── Bureau Afrique
    ├── Membres Afrique
    └── Projets locaux Afrique
```

**Spécificités par Section:**
- Bureau exécutif propre
- Langue de travail différente
- Devise locale
- Cotisations adaptées
- Projets locaux ou globaux

**Gestion des Budgets:**
- Budget global (géré par l'association mère)
- Budgets sectionnels (gérés par chaque section)
- Projets inter-sections possibles

**Cas d'usage:**
Grande association de ressortissants avec présence mondiale

---

## 👥 Gestion des Membres

### Informations de Base
- Nom complet
- Email (unique)
- Téléphone
- Photo de profil
- Date de naissance
- Adresse complète
- Pays de résidence
- Ville d'origine
- Section d'appartenance (si multi-sections)
- Date d'adhésion
- Statut (actif, inactif, suspendu)

### Statuts de Membres
Les statuts définissent les droits et obligations de chaque membre:

1. **Membre Fondateur**
   - Droits étendus
   - Cotisation potentiellement différente
   - Accès historique complet

2. **Membre Honoraire**
   - Reconnaissance spéciale
   - Peut être exempté de cotisations
   - Droit de vote selon règlement

3. **Membre Actif**
   - Cotisations à jour
   - Plein droits de participation
   - Droit de vote

4. **Membre Bienfaiteur**
   - Cotisation supérieure
   - Reconnaissance spéciale
   - Avantages particuliers

5. **Membre Associé**
   - Droits limités
   - Cotisation réduite
   - Pas de droit de vote

### Hiérarchie et Rôles

#### Rôles Administratifs
1. **Président(e)**
   - Représente l'association
   - Accès total
   - Validation des décisions importantes

2. **Vice-Président(e)**
   - Remplace le président
   - Accès étendu
   - Gestion opérationnelle

3. **Secrétaire Général(e)**
   - Gestion administrative
   - Communication
   - Procès-verbaux

4. **Trésorier(ère)**
   - Gestion financière
   - Validation des dépenses
   - Rapports financiers

5. **Commissaire aux Comptes**
   - Audit interne
   - Vérification des comptes
   - Accès en lecture seule aux finances

6. **Responsable de Section** (si multi-sections)
   - Gestion d'une section spécifique
   - Autonomie partielle
   - Reporting à l'association mère

7. **Membre Simple**
   - Accès aux informations générales
   - Paiement des cotisations
   - Participation aux événements

### Organigramme Visible
L'organigramme doit être accessible à tous les membres et afficher:
- Structure du bureau exécutif
- Photos et noms des responsables
- Dates de mandats
- Hiérarchie claire

---

## 💰 Système de Cotisations

### Types de Cotisations

1. **Cotisations Mensuelles**
   - Paiement récurrent chaque mois
   - Montant fixe ou variable selon statut

2. **Cotisations Annuelles**
   - Paiement unique par an
   - Possibilité de paiement fractionné

3. **Cotisations Exceptionnelles**
   - Pour projets spécifiques
   - Levées de fonds ponctuelles

### Montants Variables
Les cotisations peuvent varier selon:
- Statut du membre
- Section d'appartenance
- Capacité contributive déclarée
- Décisions de l'assemblée générale

**Exemple de grille:**
```
Membre Simple France: 50€/mois
Membre Bienfaiteur France: 100€/mois
Membre Simple USA: 60$/mois
Membre Fondateur: Exempt ou tarif réduit
```

### Méthodes de Paiement

#### Paiement en Ligne
- Carte bancaire
- Virement bancaire
- Services de paiement mobile (Mobile Money pour l'Afrique)
- PayPal, Stripe, etc.

#### Enregistrement Manuel
Pour les membres ne pouvant pas payer en ligne:
- Enregistrement par le trésorier
- Justificatif requis (reçu, capture d'écran)
- Validation obligatoire
- Historique traçable

### Gestion des Retards
- Alertes automatiques avant échéance
- Relances progressives
- Pénalités potentielles (selon règlement)
- Suspension temporaire des droits
- Procédure de régularisation

### Suivi des Cotisations
Chaque membre peut voir:
- Historique complet de ses paiements
- Statut actuel (à jour / en retard)
- Prochaine échéance
- Montant total versé
- Reçus téléchargeables

---

## 💼 Gestion Financière

### Budget Général
- Budget prévisionnel annuel
- Suivi en temps réel
- Comparaison budget/réalisé
- Alertes de dépassement

### Catégories de Dépenses
Organisation des dépenses par catégories:
- Projets communautaires
- Frais administratifs
- Événements
- Aide aux membres
- Solidarité (funérailles, urgences)
- Investissements
- Autres

### Gestion des Transactions

#### Recettes
- Cotisations
- Dons
- Subventions
- Revenus d'activités
- Intérêts
- Autres recettes

#### Dépenses
- Justificatif obligatoire
- Validation selon seuils:
  - < 100€: Trésorier seul
  - 100-500€: Trésorier + Président
  - > 500€: Bureau exécutif
- Catégorisation
- Pièces jointes (factures, reçus)

### Aide aux Membres
L'association peut venir en aide à ses membres:
- Aide financière d'urgence
- Soutien funérailles
- Aide maladie
- Aide scolarité
- Prêts internes

**Processus:**
1. Demande formelle du membre
2. Examen par le bureau
3. Vote si nécessaire
4. Validation et versement
5. Suivi et remboursement (si prêt)

### Rapports Financiers
- Rapport mensuel automatique
- Bilan annuel
- Compte de résultat
- Tableau de flux de trésorerie
- Exports comptables

---

## 🎯 Projets et Initiatives

### Création de Projet
Informations requises:
- Titre du projet
- Description détaillée
- Objectifs
- Budget prévisionnel
- Source de financement:
  - Budget global
  - Budget sectionnel
  - Financement mixte
- Responsable(s)
- Échéances
- Indicateurs de succès

### Suivi de Projet
- État d'avancement (%)
- Budget consommé vs prévu
- Étapes franchies
- Documents associés
- Photos/preuves d'exécution
- Commentaires et mises à jour

### Types de Projets
- Construction (école, dispensaire, puits)
- Équipement (matériel médical, informatique)
- Événements culturels
- Bourses d'études
- Développement économique
- Projets agricoles

### Visibilité des Projets
Tous les membres peuvent:
- Voir la liste des projets
- Suivre l'avancement
- Consulter les rapports
- Voir les photos et documents
- Commenter (si autorisé)

---

## 📅 Événements

### Types d'Événements

1. **Assemblée Générale**
   - Ordinaire (annuelle)
   - Extraordinaire
   - Convocation officielle
   - Ordre du jour
   - Procès-verbal

2. **Réunions du Bureau**
   - Réunions de décision
   - Réunions de suivi
   - Comptes-rendus

3. **Événements Sociaux**
   - Fêtes culturelles
   - Galas
   - Rencontres conviviales
   - Cérémonies

4. **Changement de Bureau**
   - Élections
   - Passation de pouvoir
   - Nomination de nouveaux membres

### Gestion d'Événement
- Création avec détails:
  - Titre
  - Date et heure
  - Lieu (physique/virtuel)
  - Description
  - Ordre du jour
  - Documents préparatoires
- Invitation des membres
- Gestion des participations
- Rappels automatiques
- Enregistrement de la présence
- Publication du compte-rendu
- Archivage des décisions

### Notifications
- Email
- SMS (optionnel)
- Notification dans l'application
- Rappels à J-7, J-3, J-1

---

## 🔐 Système de Permissions

### Niveaux d'Accès

#### Super Admin (Président)
- Tous les droits
- Gestion des rôles
- Configuration de l'association
- Suppression de données sensibles

#### Admin (Bureau Exécutif)
- Gestion des membres
- Gestion financière
- Gestion des projets
- Création d'événements
- Accès aux rapports

#### Trésorier
- Gestion complète des finances
- Validation des dépenses
- Enregistrement des paiements manuels
- Exports financiers

#### Secrétaire
- Gestion des événements
- Communication
- Gestion documentaire

#### Responsable de Section
- Gestion de sa section uniquement
- Membres de sa section
- Budget sectionnel
- Projets locaux

#### Membre
- Lecture des informations générales
- Gestion de son profil
- Paiement de ses cotisations
- Inscription aux événements

### Permissions Granulaires
Pour chaque type de données:
- **Lecture**: Voir les informations
- **Création**: Ajouter de nouvelles entrées
- **Modification**: Éditer les données existantes
- **Suppression**: Supprimer des données
- **Validation**: Approuver des actions

### Matrice de Permissions (Exemple)

| Action | Membre | Secrétaire | Trésorier | Admin | Président |
|--------|--------|-----------|-----------|-------|-----------|
| Voir membres | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modifier membre | ❌ | ✅ | ✅ | ✅ | ✅ |
| Supprimer membre | ❌ | ❌ | ❌ | ✅ | ✅ |
| Voir finances | Limitées | ✅ | ✅ | ✅ | ✅ |
| Valider dépense | ❌ | ❌ | ✅ | ✅ | ✅ |
| Créer projet | ❌ | ✅ | ✅ | ✅ | ✅ |
| Modifier projet | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## 🌍 Multi-devises et Multi-langues

### Gestion Multi-devises

#### Devises Supportées (Phase 1)
- EUR (Euro)
- USD (Dollar américain)
- XOF (Franc CFA - Afrique de l'Ouest)
- XAF (Franc CFA - Afrique Centrale)
- GBP (Livre Sterling)

#### Configuration par Association/Section
- Devise principale de l'association
- Devise de référence pour les rapports consolidés
- Devises secondaires acceptées

#### Taux de Change
- Mise à jour automatique quotidienne
- Possibilité de fixer un taux manuel
- Historique des taux
- Conversion automatique pour les rapports

#### Affichage
- Montants affichés dans la devise du membre
- Option de voir en devise de référence
- Conversion visible sur les transactions

### Gestion Multi-langues

#### Langues Supportées (Phase 1)
- Français (priorité)
- Anglais

#### Langues Futures
- Portugais
- Langues locales africaines (Wolof, Bambara, etc.)

#### Fonctionnalités
- Interface traduite complètement
- Emails dans la langue du membre
- Documents générés dans la langue choisie
- Changement de langue en temps réel

---

## 📊 Exports et Rapports

### Exports de Données

#### Formats Disponibles
- **Excel (.xlsx)**: Pour traitement ultérieur
- **CSV**: Pour compatibilité maximale
- **PDF**: Pour archivage et présentation

#### Types d'Exports
1. **Liste des Membres**
   - Tous les membres ou filtrés
   - Informations personnalisables
   - Avec ou sans données sensibles

2. **Historique des Cotisations**
   - Par période
   - Par membre
   - Par statut de paiement

3. **Rapport Financier**
   - Toutes transactions
   - Par catégorie
   - Par période
   - Avec justificatifs (ZIP)

4. **Projets**
   - Liste des projets
   - Détails d'un projet
   - Rapports d'avancement

5. **Événements**
   - Liste des événements
   - Présences
   - Comptes-rendus

### Imports de Données

#### Import de Membres
- Template Excel fourni
- Validation des données
- Détection des doublons
- Rapport d'import
- Rollback en cas d'erreur

#### Import de Cotisations
- Pour enregistrements multiples
- Validation stricte
- Réconciliation automatique
- Notifications aux membres

### Rapports Automatiques

#### Rapport Mensuel
Envoyé automatiquement au bureau:
- Résumé financier
- Cotisations du mois
- Nouveaux membres
- Événements passés et à venir
- État des projets

#### Rapport Annuel
Pour l'assemblée générale:
- Bilan financier complet
- Réalisations de l'année
- Projets accomplis
- Statistiques de participation
- Rapport moral

---

## 🔍 Logs et Traçabilité

### Système de Logs
Enregistrement de toutes les actions importantes:
- Qui a fait l'action
- Quand (date et heure exacte)
- Quoi (type d'action)
- Sur quoi (entité concernée)
- Détails (avant/après si modification)

### Actions Tracées
- Création/modification/suppression de membres
- Toutes transactions financières
- Validation de dépenses
- Modification de projets
- Changements de permissions
- Exports de données
- Connexions au système

### Consultation des Logs
- Accès réservé aux administrateurs
- Filtres multiples:
  - Par utilisateur
  - Par type d'action
  - Par période
  - Par entité
- Export des logs pour audit externe

---

## 🎨 Interface Utilisateur

### Principes de Design
- **Simplicité**: Interface intuitive
- **Clarté**: Informations organisées logiquement
- **Accessibilité**: Design responsive (mobile, tablette, desktop)
- **Performance**: Chargement rapide
- **Feedback**: Confirmations claires des actions

### Navigation
- Menu latéral pour l'administration
- Tableau de bord en page d'accueil
- Fil d'Ariane pour le contexte
- Recherche globale

### Composants Clés
- Tableaux de données avec tri et filtres
- Formulaires guidés pas à pas
- Graphiques interactifs
- Notifications en temps réel
- Modal pour actions importantes

---

## 🔔 Notifications

### Types de Notifications

#### Pour les Membres
- Rappel de cotisation à venir
- Confirmation de paiement
- Nouveaux événements
- Actualités de l'association
- Modifications de leur profil

#### Pour les Administrateurs
- Nouveau membre inscrit
- Cotisation reçue
- Dépense à valider
- Projet nécessitant attention
- Événement à venir

### Canaux
- In-app (dans la plateforme)
- Email
- SMS (optionnel, payant)

### Préférences
Chaque utilisateur peut:
- Activer/désactiver par type
- Choisir les canaux
- Définir la fréquence

---

## 📱 Version Mobile

### Fonctionnalités Prioritaires
- Consultation du tableau de bord
- Paiement des cotisations
- Voir les événements
- Consulter les projets
- Notifications push
- Profil personnel

### Design
- Application web responsive (PWA)
- Application native (phase future)
- Interface adaptée au tactile
- Mode hors-ligne limité

---

## 🔒 Sécurité

### Authentification
- Email + Mot de passe
- Validation email obligatoire
- Authentification à deux facteurs (2FA) optionnelle
- Récupération de mot de passe sécurisée

### Protection des Données
- Chiffrement des données sensibles
- SSL/TLS pour toutes communications
- Conformité RGPD
- Sauvegardes quotidiennes automatiques
- Hébergement sécurisé

### Contrôles d'Accès
- Sessions avec timeout
- Logs de connexion
- Détection d'activités suspectes
- Blocage temporaire après échecs

---

## 📈 Indicateurs de Performance

### KPIs Techniques
- Temps de chargement des pages
- Taux de disponibilité (uptime)
- Nombre d'erreurs
- Performance des requêtes

### KPIs Métier
- Taux d'adoption par association
- Nombre de transactions traitées
- Taux de paiement des cotisations
- Engagement des membres
- Satisfaction utilisateur (NPS)

---

## 🚀 Évolutions Futures

### Fonctionnalités Envisagées
- Messagerie interne
- Forum de discussion
- Bibliothèque de documents
- Intégration comptabilité externe
- Application mobile native
- Signature électronique
- Visioconférence intégrée
- Boutique en ligne pour merchandising

---

## 📝 Notes Importantes

### Points d'Attention
- La flexibilité est clé: chaque association a ses spécificités
- L'interface doit rester simple malgré la richesse fonctionnelle
- La transparence est un argument de vente majeur
- Le support multi-langues/devises est critique pour le marché cible
- La fiabilité financière est non-négociable

### Prochaines Étapes
1. Valider ce cahier des charges avec des associations pilotes
2. Prioriser les fonctionnalités du MVP
3. Créer les maquettes (wireframes)
4. Définir l'architecture technique
5. Commencer le développement