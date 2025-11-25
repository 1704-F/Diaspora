# Vérification d'Email en Développement

En développement, vous ne recevez pas d'emails de vérification. Voici **3 méthodes** pour vérifier les emails :

## Option 1 : API Endpoint (Recommandé) ✅

Un endpoint spécial a été créé pour le développement :

### Utilisation avec curl :
```bash
curl -X POST http://localhost:3000/api/v1/auth/dev/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email": "votre.email@example.com"}'
```

### Utilisation avec Postman/Thunder Client :
- **Méthode** : POST
- **URL** : `http://localhost:3000/api/v1/auth/dev/verify-email`
- **Body (JSON)** :
```json
{
  "email": "votre.email@example.com"
}
```

### Réponse :
```json
{
  "message": "Email verified successfully (DEV MODE)",
  "user": {
    "email": "votre.email@example.com",
    "emailVerified": true
  }
}
```

⚠️ **Important** : Cet endpoint est **BLOQUÉ en production** pour la sécurité.

---

## Option 2 : Prisma Studio (Interface graphique)

1. Lancez Prisma Studio :
```bash
cd backend
npm run prisma:studio
```

2. Ouvrez votre navigateur sur `http://localhost:5555`

3. Cliquez sur le modèle **User**

4. Trouvez votre utilisateur par email

5. Modifiez les champs :
   - `emailVerified` : ✅ Cochez la case
   - `emailVerificationToken` : Effacez le contenu (mettez `null`)

6. Cliquez sur **Save 1 change**

---

## Option 3 : SQL Direct (Base de données)

### Avec PostgreSQL :
```sql
UPDATE "User"
SET "emailVerified" = true,
    "emailVerificationToken" = null
WHERE email = 'votre.email@example.com';
```

### Vérifier :
```sql
SELECT id, email, "emailVerified"
FROM "User"
WHERE email = 'votre.email@example.com';
```

---

## Bonus : Token de vérification récupéré à l'inscription

Lors de l'inscription en mode développement, le token est retourné dans la réponse :

```json
{
  "message": "User registered successfully. Please verify your email.",
  "user": { ... },
  "verificationToken": "abc123...xyz"
}
```

Vous pouvez utiliser ce token avec l'endpoint normal :
```bash
curl "http://localhost:3000/api/v1/auth/verify-email?token=abc123...xyz"
```

---

## Recommandation

🎯 **Utilisez l'Option 1** (API Endpoint) : C'est la plus rapide et la plus sûre pour le développement.
