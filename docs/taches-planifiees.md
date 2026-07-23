# Tâches planifiées

Le projet n'avait aucun ordonnanceur : tout ce qui devait se produire « au bout
de X jours » était contourné par un filtre calculé à l'affichage. Ce
contournement tient quand rien n'est détruit, comme l'archive des séjours. Il
ne tient plus dès qu'on promet à quelqu'un que ses données sont **effacées**.

## Le mécanisme

Le cron de l'hôte appelle une route HTTP protégée par un jeton. C'est la
convention déjà en service sur ce Pi pour un autre projet du parc, reprise
telle quelle : rien de nouveau à installer ni à surveiller.

Ce choix plutôt qu'un ordonnanceur dans le processus de l'application, qui ne
survivrait pas à un redémarrage tombant au mauvais moment et se comporterait mal
si l'application tournait un jour en plusieurs exemplaires. Et plutôt qu'un
conteneur dédié, qui coûterait de la mémoire en permanence sur une machine qui
n'en a que 1,9 Go de libre.

Chaque tâche est une route ordinaire, donc **déclenchable à la main** pour la
vérifier, sans attendre son heure.

## Installation, à faire une fois

1. Générer un secret et le déposer sur le Pi :

```bash
openssl rand -base64 48 | tr -d '\n' > /opt/chatpitre/.cron_secret
chmod 600 /opt/chatpitre/.cron_secret
```

2. Reporter la même valeur dans `CRON_SECRET` du `.env` de production, puis
   reconstruire le conteneur. Sans cette variable, **les routes refusent tout** :
   c'est délibéré, une route de tâche laissée ouverte serait pire que l'absence
   de tâche.

3. Ajouter les lignes de cron (`crontab -e`) :

```
# Chat-Pitre — purge des notifications lues depuis plus de 30 jours
15 4 * * * /usr/bin/curl -fsS -X POST https://chatpitre.gautierchuinard.com/api/cron/notifications-cleanup -H "Authorization: Bearer $(cat /opt/chatpitre/.cron_secret)" >> /var/log/chatpitre-cron.log 2>&1
```

L'horaire de 4h15 est choisi juste après la sauvegarde de 4h et décalé des
tâches du projet yoga, pour ne pas faire travailler le Pi sur trois fronts en
même temps.

## Vérifier qu'une tâche tourne

```bash
tail -20 /var/log/chatpitre-cron.log
```

Chaque exécution écrit ce qu'elle a fait, par exemple `{"deleted":3}`. Le
compte est renvoyé **même à zéro**, sans quoi une tâche qui ne tourne plus
depuis trois semaines serait indistinguable d'une tâche qui n'a rien à faire.

Déclenchement manuel, pour éprouver une tâche sans attendre :

```bash
curl -s -X POST https://chatpitre.gautierchuinard.com/api/cron/notifications-cleanup \
  -H "Authorization: Bearer $(cat /opt/chatpitre/.cron_secret)"
```

## Écrire une nouvelle tâche

Une route sous `app/api/cron/<nom>/route.ts`, qui appelle `isCronAuthorized`
en premier et renvoie un compte de ce qu'elle a traité. Trois règles :

- **Idempotente.** Deux exécutions rapprochées doivent donner le même résultat
  qu'une seule. Un cron peut se déclencher deux fois, ou être relancé à la main.
- **Bornée.** Une tâche qui traiterait des milliers de lignes d'un coup doit se
  limiter et se rappeler ce qu'elle a fait, plutôt que de tenir la base.
- **Bavarde.** Le compte traité dans la réponse, l'erreur dans la console.

## Tâches en service

| Route | Cadence | Ce qu'elle fait |
|---|---|---|
| `notifications-cleanup` | quotidienne, 4h15 | Supprime les notifications **lues** il y a plus de 30 jours. Une notification non lue reste, quel que soit son âge : elle porte une information que personne n'a vue. |
