import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  fr: {
    translation: {
      common: {
        welcome: 'Bienvenue',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        add: 'Ajouter',
        search: 'Rechercher',
        filter: 'Filtrer',
        export: 'Exporter',
        import: 'Importer',
      },
      auth: {
        login: 'Connexion',
        logout: 'Déconnexion',
        register: 'Inscription',
        email: 'Email',
        password: 'Mot de passe',
        forgotPassword: 'Mot de passe oublié ?',
      },
      dashboard: {
        title: 'Tableau de bord',
        overview: 'Vue d\'ensemble',
        statistics: 'Statistiques',
      },
      // Add more translations as needed
    },
  },
  en: {
    translation: {
      common: {
        welcome: 'Welcome',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
      },
      auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot password?',
      },
      dashboard: {
        title: 'Dashboard',
        overview: 'Overview',
        statistics: 'Statistics',
      },
      // Add more translations as needed
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Default language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
