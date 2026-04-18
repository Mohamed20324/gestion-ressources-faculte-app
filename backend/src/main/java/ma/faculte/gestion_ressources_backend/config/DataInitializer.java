package ma.faculte.gestion_ressources_backend.config;

import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.*;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
    private IUtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (departementRepository.count() > 0) {
            return; // Déjà initialisé
        }

        // 1. Création des départements
        Departement depInfo = new Departement("Informatique", 500000.0);
        Departement depMath = new Departement("Mathématiques", 300000.0);
        Departement depPhys = new Departement("Physique", 250000.0);

        departementRepository.save(depInfo);
        departementRepository.save(depMath);
        departementRepository.save(depPhys);

        // 2. Création des Chefs de département
        ChefDepartement chefInfo = new ChefDepartement(
                "Alami", "Ahmed", "alami@univ.ma",
                passwordEncoder.encode("password123"), "MAT001", "Génie Logiciel", depInfo
        );
        chefRepository.save(chefInfo);

        ChefDepartement chefMath = new ChefDepartement(
                "Idrissi", "Karim", "idrissi@univ.ma",
                passwordEncoder.encode("password123"), "MAT002", "Algèbre", depMath
        );
        chefRepository.save(chefMath);

        // 3. Création des Enseignants
        Enseignant prof1 = new Enseignant(
                "Bennani", "Sami", "bennani@univ.ma",
                passwordEncoder.encode("password123"), "MAT003", "Réseaux", depInfo
        );
        enseignantRepository.save(prof1);

        Enseignant prof2 = new Enseignant(
                "Tazi", "Houda", "tazi@univ.ma",
                passwordEncoder.encode("password123"), "MAT004", "Analyse", depMath
        );
        enseignantRepository.save(prof2);

        Enseignant prof3 = new Enseignant(
                "Mansouri", "Yassine", "mansouri@univ.ma",
                passwordEncoder.encode("password123"), "MAT005", "Physique Quantique", depPhys
        );
        enseignantRepository.save(prof3);

        // 4. Création des Techniciens
        Technicien tech1 = new Technicien(
                "Saber", "Omar", "saber@univ.ma",
                passwordEncoder.encode("password123"), "MAT006", "Maintenance Réseau"
        );
        technicienRepository.save(tech1);

        Technicien tech2 = new Technicien(
                "Kasmi", "Layla", "kasmi@univ.ma",
                passwordEncoder.encode("password123"), "MAT007", "Support IT"
        );
        technicienRepository.save(tech2);

        // 5. Création du Responsable
        Responsable resp = new Responsable(
                "Ayoub", "El Amrani", "admin@univ.ma",
                passwordEncoder.encode("password123"), "ADM001", "Bureau 101"
        );
        responsableRepository.save(resp);

        System.out.println(">>> Données initialisées avec succès.");
    }
}
