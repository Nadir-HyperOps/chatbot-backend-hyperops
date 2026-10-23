# Instructions de contribution

- Lire le README et inspecter Git avant toute modification. Préserver le travail existant.
- Travailler sur `main` par défaut, sans branche ni Pull Request systématique. Synchroniser un checkout propre par `git pull --ff-only origin main`.
- Réserver une branche temporaire à une expérimentation, une Preview ou des travaux concurrents. Une seule tâche écrit à la fois dans un checkout. Intégrer le résultat vérifié, supprimer la branche terminée et ne pas la réutiliser.
- Vérifier le changement, committer uniquement les fichiers de la tâche, pousser et comparer le SHA local au SHA distant. Ne pas forcer un push ou réinitialiser du travail existant pour résoudre une divergence.
- Le dépôt est public : aucun secret, fichier d'environnement local, donnée personnelle ou documentation interne ne doit être ajouté.
- Les traces GitHub montrent une ancienne intégration Railway, dont le dernier statut de déploiement consulté le 23 octobre 2026 est `inactive`. Vérifier les réglages réels et l'effet d'un push avant une livraison ; ne pas présumer l'état d'exploitation actuel. Toute activation ou modification de production nécessite le mandat correspondant.
- `npm start` lance le service. Aucun script de test ni workflow CI n'est actuellement déclaré ; ne pas annoncer un test non exécuté.
