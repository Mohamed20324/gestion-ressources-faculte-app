package ma.faculte.gestion_ressources_backend.config;

import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.entities.referentiel.TypeRessource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.*;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private IDepartementRepository departementRepository;

    @Autowired
    private IEnseignantRepository enseignantRepository;

    @Autowired
    private IChefDepartementRepository chefRepository;

    @Autowired
    private ITechnicienRepository technicienRepository;

    @Autowired
    private IResponsableRepository responsableRepository;

    @Autowired
    private IReunionRepository reunionRepository;

    @Autowired
    private ITypeRessourceRepository typeRessourceRepository;

    @Autowired
    private IFournisseurRepository fournisseurRepository;

    @Autowired
    private IBesoinRessourceRepository besoinRessourceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (departementRepository.count() > 0) {
            return; // Déjà initialisé
        }

        // 1. Création des 5 départements
        Departement depInfo = departementRepository.save(new Departement("Informatique", 500000.0));
        Departement depMath = departementRepository.save(new Departement("Mathématiques", 300000.0));
        Departement depPhys = departementRepository.save(new Departement("Physique", 250000.0));
        Departement depChim = departementRepository.save(new Departement("Chimie", 200000.0));
        Departement depBio = departementRepository.save(new Departement("Biologie", 180000.0));

        // 2. Création des 8 Chefs de département
        // Note: 5 avec département, 3 sans département pour le test
        String pwd = passwordEncoder.encode("password123");
        
        chefRepository.save(new ChefDepartement("Alami", "Ahmed", "alami@univ.ma", pwd, "CHEF001", "Génie Logiciel", depInfo));
        chefRepository.save(new ChefDepartement("Idrissi", "Karim", "idrissi@univ.ma", pwd, "CHEF002", "Algèbre", depMath));
        chefRepository.save(new ChefDepartement("Berrada", "Salma", "berrada@univ.ma", pwd, "CHEF003", "Physique Nucléaire", depPhys));
        chefRepository.save(new ChefDepartement("Tahiri", "Youssef", "tahiri@univ.ma", pwd, "CHEF004", "Chimie Organique", depChim));
        chefRepository.save(new ChefDepartement("Mansouri", "Nisrine", "mansouri@univ.ma", pwd, "CHEF005", "Génétique", depBio));
        chefRepository.save(new ChefDepartement("Zouhair", "Amine", "zouhair@univ.ma", pwd, "CHEF006", "Data Science", null));
        chefRepository.save(new ChefDepartement("Chraibi", "Fatiha", "chraibi@univ.ma", pwd, "CHEF007", "Topologie", null));
        chefRepository.save(new ChefDepartement("Slaoui", "Khalid", "slaoui@univ.ma", pwd, "CHEF008", "Mécanique", null));

        // 3. Création des 8 Enseignants
        enseignantRepository.save(new Enseignant("Bennani", "Sami", "bennani@univ.ma", pwd, "PROF001", "Réseaux", depInfo));
        enseignantRepository.save(new Enseignant("Tazi", "Houda", "tazi@univ.ma", pwd, "PROF002", "Analyse", depMath));
        enseignantRepository.save(new Enseignant("Kadiri", "Meryem", "kadiri@univ.ma", pwd, "PROF003", "Optique", depPhys));
        enseignantRepository.save(new Enseignant("Jebli", "Adnane", "jebli@univ.ma", pwd, "PROF004", "Thermodynamique", depChim));
        enseignantRepository.save(new Enseignant("Radi", "Imane", "radi@univ.ma", pwd, "PROF005", "Biochimie", depBio));
        enseignantRepository.save(new Enseignant("Haddad", "Mehdi", "haddad@univ.ma", pwd, "PROF006", "Intelligence Artificielle", depInfo));
        enseignantRepository.save(new Enseignant("Fassi", "Asmaa", "fassi@univ.ma", pwd, "PROF007", "Statistiques", depMath));
        enseignantRepository.save(new Enseignant("Kabbaj", "Rachid", "kabbaj@univ.ma", pwd, "PROF008", "Électronique", depPhys));

        // 4. Création des 8 Techniciens
        technicienRepository.save(new Technicien("Saber", "Omar", "saber@univ.ma", pwd, "TECH001", "Maintenance Réseau"));
        technicienRepository.save(new Technicien("Kasmi", "Layla", "kasmi@univ.ma", pwd, "TECH002", "Support IT"));
        technicienRepository.save(new Technicien("Amrani", "Said", "amrani@univ.ma", pwd, "TECH003", "Gestion de Parc"));
        technicienRepository.save(new Technicien("Filali", "Zineb", "filali@univ.ma", pwd, "TECH004", "Installation Logiciels"));
        technicienRepository.save(new Technicien("Malki", "Hassan", "malki@univ.ma", pwd, "TECH005", "Réparation Matériel"));
        technicienRepository.save(new Technicien("Naji", "Sanaa", "naji@univ.ma", pwd, "TECH006", "Sécurité Système"));
        technicienRepository.save(new Technicien("Ghazali", "Driss", "ghazali@univ.ma", pwd, "TECH007", "Câblage"));
        technicienRepository.save(new Technicien("Benjelloun", "Hind", "benjelloun@univ.ma", pwd, "TECH008", "Helpdesk"));

        // 5. Création du Responsable (Admin)
        Responsable resp = new Responsable(
                "Ayoub", "El Amrani", "admin@univ.ma",
                pwd, "ADM001", "Bureau 101"
        );
        responsableRepository.save(resp);

        // 6. Création des types de ressources
        typeRessourceRepository.save(new TypeRessource("ORDINATEUR", "Ordinateur", true));
        typeRessourceRepository.save(new TypeRessource("IMPRIMANTE", "Imprimante", true));
        typeRessourceRepository.save(new TypeRessource("PROJECTEUR", "Projecteur", false));
        typeRessourceRepository.save(new TypeRessource("SCANNER", "Scanner", false));
        typeRessourceRepository.save(new TypeRessource("SERVEUR", "Serveur", false));
        typeRessourceRepository.save(new TypeRessource("TABLETTE", "Tablette", false));
        typeRessourceRepository.save(new TypeRessource("PHOTOCOPIEUSE", "Photocopieuse", false));

        // 7. Création des Fournisseurs
        Fournisseur f1 = new Fournisseur("Tech Solutions", "tech@solutions.ma", pwd);
        f1.setGerant("Mohammed V");
        f1.setLieu("Casablanca");
        f1.setAdresse("Rue 123");
        fournisseurRepository.save(f1);

        Fournisseur f2 = new Fournisseur("Alpha Systems", "alpha@systems.com", pwd);
        f2.setGerant("A. Benabdallah");
        f2.setLieu("Rabat");
        fournisseurRepository.save(f2);

        Fournisseur f3 = new Fournisseur("Bureau Pro", "contact@bureaupro.ma", pwd);
        f3.setGerant("Hassan II");
        f3.setLieu("Marrakech");
        fournisseurRepository.save(f3);

        Fournisseur f4 = new Fournisseur("Digital Hub", "sara@digitalhub.ma", pwd);
        f4.setGerant("Sara Naji");
        f4.setLieu("Tanger");
        fournisseurRepository.save(f4);

        // 8. Création de quelques Besoins initiaux
        TypeRessource trOrd = typeRessourceRepository.findByCode("ORDINATEUR").orElse(null);
        TypeRessource trImp = typeRessourceRepository.findByCode("IMPRIMANTE").orElse(null);

        if (trOrd != null && trImp != null) {
            // Créer une réunion par défaut pour les besoins (obligatoire selon l'entité)
            ma.faculte.gestion_ressources_backend.entities.departement.Reunion r = new ma.faculte.gestion_ressources_backend.entities.departement.Reunion();
            r.setHeure("10:00");
            r.setDate(LocalDate.now());
            r.setDepartement(depInfo);
            r.setStatut(ma.faculte.gestion_ressources_backend.entities.departement.Reunion.STATUT_VALIDEE);
            r = reunionRepository.save(r);

            // Besoin 1
            ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource b1 = new ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource();
            b1.setTypeRessource(trOrd);
            b1.setQuantite(12);
            b1.setStatut("VALIDE");
            b1.setDepartement(depInfo);
            b1.setReunion(r);
            b1.setDateCreation(LocalDate.now());
            besoinRessourceRepository.save(b1);

            // Besoin 2
            ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource b2 = new ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource();
            b2.setTypeRessource(trImp);
            b2.setQuantite(5);
            b2.setStatut("VALIDE");
            b2.setDepartement(depInfo);
            b2.setReunion(r);
            b2.setDateCreation(LocalDate.now());
            besoinRessourceRepository.save(b2);

            // Besoin 3
            ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource b3 = new ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource();
            b3.setTypeRessource(trOrd);
            b3.setQuantite(8);
            b3.setStatut("ENVOYE");
            b3.setDepartement(depMath);
            b3.setReunion(r);
            b3.setDateCreation(LocalDate.now());
            besoinRessourceRepository.save(b3);
        }

        System.out.println(">>> Données initialisées : 5 Départements, 8 Chefs, 8 Enseignants, 8 Techniciens, 7 Types Ressources, 4 Fournisseurs, 3 Besoins.");
    }
}
