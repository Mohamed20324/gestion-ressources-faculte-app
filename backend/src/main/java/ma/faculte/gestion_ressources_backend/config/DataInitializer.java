package ma.faculte.gestion_ressources_backend.config;

import ma.faculte.gestion_ressources_backend.entities.appel_offre.*;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.lignes.*;
import ma.faculte.gestion_ressources_backend.entities.besoins.*;
import ma.faculte.gestion_ressources_backend.entities.departement.*;
import ma.faculte.gestion_ressources_backend.entities.inventaire.*;
import ma.faculte.gestion_ressources_backend.entities.maintenance.*;
import ma.faculte.gestion_ressources_backend.entities.referentiel.TypeRessource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.*;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private IDepartementRepository departementRepository;
    @Autowired private IEnseignantRepository enseignantRepository;
    @Autowired private IChefDepartementRepository chefRepository;
    @Autowired private ITechnicienRepository technicienRepository;
    @Autowired private IResponsableRepository responsableRepository;
    @Autowired private IReunionRepository reunionRepository;
    @Autowired private ITypeRessourceRepository typeRessourceRepository;
    @Autowired private IFournisseurRepository fournisseurRepository;
    @Autowired private IBesoinRessourceRepository besoinRessourceRepository;
    @Autowired private IAppelOffreRepository appelOffreRepository;
    @Autowired private IOffreRepository offreRepository;
    @Autowired private IRessourceRepository ressourceRepository;
    @Autowired private ISignalementPanneRepository signalementPanneRepository;
    @Autowired private IConstatRepository constatRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (departementRepository.count() > 0) return;

        String pwd = passwordEncoder.encode("password123");

        // 1. Départements (5)
        Departement depInfo = departementRepository.save(new Departement("Informatique", 500000.0));
        Departement depMath = departementRepository.save(new Departement("Mathématiques", 300000.0));
        Departement depPhys = departementRepository.save(new Departement("Physique", 250000.0));
        Departement depChim = departementRepository.save(new Departement("Chimie", 200000.0));
        Departement depBio = departementRepository.save(new Departement("Biologie", 180000.0));

        // 2. Chefs
        ChefDepartement chefInfo = chefRepository.save(new ChefDepartement("Alami", "Ahmed", "alami@univ.ma", pwd, "CHEF001", "Génie Logiciel", depInfo));
        chefRepository.save(new ChefDepartement("Idrissi", "Karim", "idrissi@univ.ma", pwd, "CHEF002", "Algèbre", depMath));
        chefRepository.save(new ChefDepartement("Berrada", "Salma", "berrada@univ.ma", pwd, "CHEF003", "Physique Nucléaire", depPhys));

        // 3. Enseignants
        Enseignant prof1 = enseignantRepository.save(new Enseignant("Bennani", "Sami", "bennani@univ.ma", pwd, "PROF001", "Réseaux", depInfo));
        Enseignant prof2 = enseignantRepository.save(new Enseignant("Tazi", "Houda", "tazi@univ.ma", pwd, "PROF002", "Analyse", depMath));
        Enseignant prof3 = enseignantRepository.save(new Enseignant("Kadiri", "Meryem", "kadiri@univ.ma", pwd, "PROF003", "Optique", depPhys));

        // 4. Techniciens
        Technicien tech1 = technicienRepository.save(new Technicien("Saber", "Omar", "saber@univ.ma", pwd, "TECH001", "Maintenance Réseau"));
        Technicien tech2 = technicienRepository.save(new Technicien("Kasmi", "Layla", "kasmi@univ.ma", pwd, "TECH002", "Support IT"));

        // 5. Responsable
        Responsable resp = responsableRepository.save(new Responsable("Ayoub", "El Amrani", "admin@univ.ma", pwd, "ADM001", "Bureau 101"));

        // 6. Types Ressources (7)
        TypeRessource trOrd = typeRessourceRepository.save(new TypeRessource("ORDINATEUR", "Ordinateur", true));
        TypeRessource trImp = typeRessourceRepository.save(new TypeRessource("IMPRIMANTE", "Imprimante", true));
        TypeRessource trProj = typeRessourceRepository.save(new TypeRessource("PROJECTEUR", "Projecteur", false));
        TypeRessource trScan = typeRessourceRepository.save(new TypeRessource("SCANNER", "Scanner", false));
        TypeRessource trServ = typeRessourceRepository.save(new TypeRessource("SERVEUR", "Serveur", false));
        TypeRessource trTab = typeRessourceRepository.save(new TypeRessource("TABLETTE", "Tablette", false));
        TypeRessource trWifi = typeRessourceRepository.save(new TypeRessource("ROUTEUR_WIFI", "Routeur WiFi", false));

        // 7. Fournisseurs (7)
        Fournisseur f1 = new Fournisseur("Tech Solutions", "tech@solutions.ma", pwd);
        f1.setGerant("Mohammed V"); f1.setLieu("Casablanca"); f1.setAdresse("Bd Zerktouni");
        fournisseurRepository.save(f1);

        Fournisseur f2 = new Fournisseur("Alpha Systems", "alpha@systems.com", pwd);
        f2.setGerant("A. Benabdallah"); f2.setLieu("Rabat");
        fournisseurRepository.save(f2);

        fournisseurRepository.save(new Fournisseur("Bureau Pro", "contact@bureaupro.ma", pwd));
        fournisseurRepository.save(new Fournisseur("Digital Hub", "sara@digitalhub.ma", pwd));
        fournisseurRepository.save(new Fournisseur("Info Service", "info@service.ma", pwd));
        fournisseurRepository.save(new Fournisseur("Net Group", "net@group.ma", pwd));
        fournisseurRepository.save(new Fournisseur("Smart IT", "smart@it.ma", pwd));

        // 8. Réunion & Besoins (10+)
        Reunion r1 = new Reunion(); r1.setHeure("10:00"); r1.setDate(LocalDate.now().minusDays(5));
        r1.setDepartement(depInfo); r1.setStatut(Reunion.STATUT_VALIDEE);
        r1 = reunionRepository.save(r1);

        for (int i = 1; i <= 8; i++) {
            BesoinRessource b = new BesoinRessource();
            b.setTypeRessource(i % 2 == 0 ? trOrd : trImp);
            b.setQuantite(2 + i);
            b.setStatut(i < 4 ? "VALIDE" : "ENVOYE");
            b.setDepartement(i < 5 ? depInfo : depMath);
            b.setReunion(r1);
            b.setDateCreation(LocalDate.now().minusDays(10 + i));
            besoinRessourceRepository.save(b);
        }
        
        // Plus de besoins spécifiques
        BesoinRessource b9 = new BesoinRessource();
        b9.setTypeRessource(trProj); b9.setQuantite(1); b9.setStatut("EN_ATTENTE");
        b9.setDepartement(depPhys); b9.setReunion(r1); b9.setDateCreation(LocalDate.now());
        besoinRessourceRepository.save(b9);

        // 9. Appels d'Offres (Marchés) (8)
        for (int i = 1; i <= 8; i++) {
            AppelOffre ao = new AppelOffre();
            ao.setReference("AO-2026-00" + i);
            ao.setDateDebut(LocalDate.now().minusDays(10 - i));
            ao.setDateFin(LocalDate.now().plusDays(20 + i));
            ao.setStatut(i <= 2 ? "OUVERT" : (i <= 4 ? "BROUILLON" : "CLOTURE"));
            ao.setResponsable(resp);
            appelOffreRepository.save(ao);
        }

        // 10. Ressources (Inventaire) (10+)
        String[] marques = {"Dell", "HP", "Lenovo", "Apple", "Asus", "Acer"};
        for (int i = 1; i <= 12; i++) {
            Ressource res = new Ressource();
            res.setNumeroInventaire("INV-RES-00" + i);
            res.setMarque(marques[i % marques.length]);
            res.setDateReception(LocalDate.now().minusMonths(6));
            res.setStatut(i % 5 == 0 ? "EN_PANNE" : "FONCTIONNELLE");
            res.setTypeRessource(i < 6 ? trOrd : (i < 10 ? trImp : trProj));
            ressourceRepository.save(res);
        }

        // 11. Maintenance (Signalements) (8+)
        List<Ressource> pannes = ressourceRepository.findAll().stream().filter(r -> r.getStatut().equals("EN_PANNE")).toList();
        int count = 1;
        for (Ressource p : pannes) {
            SignalementPanne sig = new SignalementPanne();
            sig.setRessource(p);
            sig.setEnseignant(count % 2 == 0 ? prof1 : prof2);
            sig.setDateSignalement(LocalDate.now().minusDays(count));
            sig.setDescription("Problème critique sur la ressource " + p.getNumeroInventaire());
            sig.setStatut(count <= 2 ? SignalementPanne.STATUT_SIGNALE : SignalementPanne.STATUT_CONSTAT);
            sig = signalementPanneRepository.save(sig);

            if (sig.getStatut().equals(SignalementPanne.STATUT_CONSTAT)) {
                Constat c = new Constat();
                c.setSignalement(sig);
                c.setTechnicien(tech1);
                c.setDateConstat(LocalDate.now().minusDays(1));
                c.setExplication("Analyse technique effectuée. Nécessite une intervention.");
                c.setFrequence("MODEREE");
                c.setOrdre("REPARATION_EXTERNE");
                constatRepository.save(c);
            }
            count++;
        }

        System.out.println(">>> Initialisation MASSIVE terminée : 5 Depts, 7 Types, 7 Fours, 10+ Besoins, 8 AO, 12+ Ressources, 8+ Maintenance.");
    }
}
