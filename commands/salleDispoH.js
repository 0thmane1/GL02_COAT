const cli = require("@caporal/core").default;
const { lectureDonnees, cheminDonnees } = require("../fonctions.js");
const colors = require('colors');

// Fonction pour valider le format de l'heure
function isValidHourFormat(heure) {
    const [hour, minute] = heure.split(':');
    const isValidHour = /^\d{2}$/.test(hour) && parseInt(hour, 10) >= 0 && parseInt(hour, 10) <= 23;
    const isValidMinute = /^\d{2}$/.test(minute) && parseInt(minute, 10) >= 0 && parseInt(minute, 10) <= 59;

    return isValidHour && isValidMinute;
}

// Fonction pour valider le jour
function isValidJour(jour) {
    const joursPermis = ['L', 'MA', 'ME', 'J', 'V', 'S'];
    return joursPermis.includes(jour);
}

module.exports = cli
    //Salles disponibles à un horaire donné
    .command('dispoHo', "Affiche les salle disponibles à un horaire donné.")
    .argument('<jour>', 'Jour du créneau. (L, MA, ME, J, V, S)')
    .argument('<heure>', 'Horaire début de créneau (format: HH:MM)')
    .action(({ args, logger }) => {
        // Validation du format de l'heure
        if (!isValidHourFormat(args.heure)) {
            logger.info("Format d'heure invalide. Utilisez le format HH:MM.".red);
            return;
        }

        // Validation du jour
        if (!isValidJour(args.jour)) {
            logger.info("Jour invalide. Utilisez l'un des jours suivants : L, MA, ME, J, V, S.".red);
            return;
        }

        let parserResult = lectureDonnees(cheminDonnees);

        if (parserResult.errorCount > 0) {
            logger.info("Le fichier .cru contient une erreur".red);
            return;
        }

        const { parsedCRU, listeCreneaux, salles } = parserResult;

        // Filtrer les créneaux pour trouver ceux qui correspondent au jour et à l'heure fournis
        const creneauxFiltres = listeCreneaux.filter(creneau => {
            return creneau.jour === args.jour && (
                args.heure.split(':') >= creneau.heureDebut.split(':')[0] && args.heure.split(':') < creneau.heureFin.split(':')[0]
            );
        });

        // Liste des salles occupées à cet horaire
        const sallesOccupees = creneauxFiltres.map(creneau => creneau.salle);

        // Liste de toutes les salles disponibles
        const toutesLesSalles = Object.keys(salles);

        // Liste des salles disponibles à cet horaire
        const sallesDisponibles = toutesLesSalles.filter(salle => !sallesOccupees.includes(salle));

        sallesDisponibles.sort();

        console.log("Les salles disponibles à cet horaire sont :")
        sallesDisponibles.forEach((salle) => {
            console.log(salle);
        });
    });
