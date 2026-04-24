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
import java.util.Arrays;
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
    @Autowired private IAffectationRepository affectationRepository;
    @Autowired private ISignalementPanneRepository signalementPanneRepository;
    @Autowired private IConstatRepository constatRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (departementRepository.count() > 0) return;

        String pwd = passwordEncoder.encode("password123");

        // 1. Responsable (1)
        Responsable resp = responsableRepository.save(new Responsable("Responsable", "Admin", "admin@univ.ma", pwd, "ADM001", "Bureau Central"));

        // 2. Départements (3)
        Departement depInfo = departementRepository.save(new Departement("Informatique", 1000000.0));
        Departement depBio = departementRepository.save(new Departement("Biologie", 800000.0));
        Departement depPhys = departementRepository.save(new Departement("Physique", 750000.0));
        List<Departement> depts = Arrays.asList(depInfo, depBio, depPhys);

        // 3. Chefs de Département (3 - 1 par département)
        chefRepository.save(new ChefDepartement("Alami", "Ahmed", "chef.info@univ.ma", pwd, "CHEF001", "Génie Logiciel", depInfo));
        chefRepository.save(new ChefDepartement("Bennani", "Sami", "chef.bio@univ.ma", pwd, "CHEF002", "Génétique", depBio));
        chefRepository.save(new ChefDepartement("Kadiri", "Meryem", "chef.phys@univ.ma", pwd, "CHEF003", "Optique", depPhys));

        // 4. Enseignants (2 par département = 6)
        List<Enseignant> allProfs = new ArrayList<>();
        for (int i = 0; i < depts.size(); i++) {
            Departement d = depts.get(i);
            allProfs.add(enseignantRepository.save(new Enseignant("Prof" + (i*2 + 1), "Nom" + (i*2 + 1), "prof" + (i*2 + 1) + "@univ.ma", pwd, "P00" + (i*2 + 1), "Spécialité A", d)));
            allProfs.add(enseignantRepository.save(new Enseignant("Prof" + (i*2 + 2), "Nom" + (i*2 + 2), "prof" + (i*2 + 2) + "@univ.ma", pwd, "P00" + (i*2 + 2), "Spécialité B", d)));
        }

        // 5. Techniciens (3)
        Technicien tech1 = technicienRepository.save(new Technicien("Saber", "Omar", "tech1@univ.ma", pwd, "TECH001", "Réseau"));
        technicienRepository.save(new Technicien("Kasmi", "Layla", "tech2@univ.ma", pwd, "TECH002", "Matériel"));
        technicienRepository.save(new Technicien("Drissi", "Youssef", "tech3@univ.ma", pwd, "TECH003", "Logiciel"));

        // 6. Fournisseurs (3)
        Fournisseur f1 = new Fournisseur("Tech Solutions", "four1@solutions.ma", pwd);
        f1.setGerant("M. Alami"); f1.setLieu("Casablanca"); fournisseurRepository.save(f1);
        Fournisseur f2 = new Fournisseur("Alpha IT", "four2@alpha.ma", pwd);
        f2.setGerant("S. Bennani"); f2.setLieu("Rabat"); fournisseurRepository.save(f2);
        Fournisseur f3 = new Fournisseur("Buro Pro", "four3@buro.ma", pwd);
        f3.setGerant("A. Kadiri"); f3.setLieu("Tanger"); fournisseurRepository.save(f3);

        // 7. Types de Ressources
        TypeRessource tPC = typeRessourceRepository.save(new TypeRessource("ORDINATEUR", "Ordinateur", true));
        TypeRessource tImp = typeRessourceRepository.save(new TypeRessource("IMPRIMANTE", "Imprimante", true));

        // 8. 2 Besoins par enseignant (12 total) SANS réunion
        List<BesoinRessource> pendingBesoins = new ArrayList<>();
        for (Enseignant p : allProfs) {
            // Premier besoin : Ordinateur
            BesoinOrdinateur bo = new BesoinOrdinateur();
            bo.setTypeRessource(tPC); bo.setQuantite(1); bo.setStatut("EN_ATTENTE");
            bo.setDepartement(p.getDepartement()); bo.setEnseignant(p);
            bo.setCpu("i7"); bo.setRam("16GB"); bo.setDisqueDur("512GB SSD"); bo.setMarque("Dell");
            pendingBesoins.add(besoinRessourceRepository.save(bo));

            // Deuxième besoin : Imprimante
            BesoinImprimante bi = new BesoinImprimante();
            bi.setTypeRessource(tImp); bi.setQuantite(1); bi.setStatut("EN_ATTENTE");
            bi.setDepartement(p.getDepartement()); bi.setEnseignant(p);
            bi.setMarque("HP"); bi.setVitesseImpression(30); bi.setResolution("1200x1200dpi");
            pendingBesoins.add(besoinRessourceRepository.save(bi));
        }

        // 9. Réunions (2)
        Reunion rValide = new Reunion(); rValide.setHeure("09:00"); rValide.setDate(LocalDate.now().minusDays(2));
        rValide.setDepartement(depInfo); rValide.setStatut(Reunion.STATUT_VALIDEE);
        reunionRepository.save(rValide);

        Reunion rPlanifiee = new Reunion(); rPlanifiee.setHeure("14:30"); rPlanifiee.setDate(LocalDate.now().plusDays(5));
        rPlanifiee.setDepartement(depBio); rPlanifiee.setStatut(Reunion.STATUT_PLANIFIEE);
        reunionRepository.save(rPlanifiee);

        // 10. Appels d'Offres (3)
        // AO1: TRAITE (Livraison passée, besoins validés du Dpt Informatique)
        AppelOffre aoValide = new AppelOffre();
        aoValide.setReference("AO-2026-INFO-LIVRE");
        aoValide.setDateDebut(LocalDate.now().minusMonths(1));
        aoValide.setDateFin(LocalDate.now().minusDays(15));
        aoValide.setStatut(AppelOffre.STATUT_TRAITE);
        aoValide.setResponsable(resp);
        
        // Besoins de l'Informatique (Prof1 et Prof2)
        List<BesoinRessource> ao1Besoins = new ArrayList<>();
        BesoinOrdinateur bAO1_1 = (BesoinOrdinateur) pendingBesoins.get(0); // Prof1 Info
        bAO1_1.setStatut("VALIDE");
        bAO1_1.setReunion(rValide);
        ao1Besoins.add(besoinRessourceRepository.save(bAO1_1));
        
        BesoinImprimante bAO1_2 = (BesoinImprimante) pendingBesoins.get(1); // Prof1 Info
        bAO1_2.setStatut("VALIDE");
        bAO1_2.setReunion(rValide);
        ao1Besoins.add(besoinRessourceRepository.save(bAO1_2));
        
        aoValide.setBesoins(ao1Besoins);
        aoValide = appelOffreRepository.save(aoValide);

        // Offre acceptée pour AO1
        Offre oAO1 = new Offre();
        oAO1.setAppelOffre(aoValide);
        oAO1.setFournisseur(f3);
        oAO1.setPrixTotal(28000.0);
        oAO1.setStatut(Offre.STATUT_LIVREE);
        oAO1.setDateSoumission(LocalDate.now().minusDays(20));
        oAO1.setDateLivraison(LocalDate.now().minusDays(5));
        oAO1.setDureeGarantie(36); // 3 years warranty to avoid expiration for test data
        oAO1 = offreRepository.save(oAO1);

        // 11. Ressources LIVREES mais PAS ENCORE AFFECTEES (Status: DISPONIBLE)
        // 1 PC livré pour le Dpt Info (issu de bAO1_1)
        Ressource resLivre1 = new Ressource();
        resLivre1.setNumeroInventaire("INV-INFO-PC-001");
        resLivre1.setStatut(Ressource.STATUT_DISPONIBLE); // PRÊT pour affectation
        resLivre1.setMarque("Dell Latitude");
        resLivre1.setTypeRessource(tPC);
        resLivre1.setDateReception(LocalDate.now().minusDays(5));
        resLivre1.setOffreOrigine(oAO1);
        resLivre1.setFournisseur(f1); // Force supplier 1
        resLivre1.setDepartement(depInfo);
        ressourceRepository.save(resLivre1);

        // 1 Imprimante livrée pour le Dpt Info (issu de bAO1_2)
        Ressource resLivre2 = new Ressource();
        resLivre2.setNumeroInventaire("INV-INFO-IMP-001");
        resLivre2.setStatut(Ressource.STATUT_DISPONIBLE); // PRÊT pour affectation
        resLivre2.setMarque("HP LaserJet Pro");
        resLivre2.setTypeRessource(tImp);
        resLivre2.setDateReception(LocalDate.now().minusDays(5));
        resLivre2.setOffreOrigine(oAO1);
        resLivre2.setFournisseur(f1); // Force supplier 1
        resLivre2.setDepartement(depInfo);
        ressourceRepository.save(resLivre2);
        
        // --- NEW: AFFECTATION FOR PROF 1 (As requested) ---
        // Affect resLivre1 (PC Dell) to Prof 1 (allProfs.get(0))
        resLivre1.setStatut(Ressource.STATUT_AFFECTEE);
        resLivre1.setDateFinGarantie(LocalDate.now().plusYears(2));
        ressourceRepository.save(resLivre1);

        Affectation affProf1 = new Affectation();
        affProf1.setRessource(resLivre1);
        affProf1.setEnseignant(allProfs.get(0));
        affProf1.setDateAffectation(LocalDate.now().minusDays(2));
        affectationRepository.save(affProf1);

        // AO2: OUVERT (Publié avec 2 besoins et 2 consultations/offres)
        AppelOffre aoOuvert = new AppelOffre();
        aoOuvert.setReference("AO-2026-PUBLISH");
        aoOuvert.setDateDebut(LocalDate.now().minusDays(5));
        aoOuvert.setDateFin(LocalDate.now().plusDays(10));
        aoOuvert.setStatut(AppelOffre.STATUT_OUVERT);
        aoOuvert.setResponsable(resp);
        List<BesoinRessource> ao2Besoins = new ArrayList<>();
        BesoinOrdinateur bAO2_1 = (BesoinOrdinateur) pendingBesoins.get(2);
        bAO2_1.setStatut("ENVOYE");
        ao2Besoins.add(besoinRessourceRepository.save(bAO2_1));
        BesoinImprimante bAO2_2 = (BesoinImprimante) pendingBesoins.get(3);
        bAO2_2.setStatut("ENVOYE");
        ao2Besoins.add(besoinRessourceRepository.save(bAO2_2));
        aoOuvert.setBesoins(ao2Besoins);
        aoOuvert = appelOffreRepository.save(aoOuvert);

        // Consultation (Offres) pour AO2
        Offre o1 = new Offre(); o1.setAppelOffre(aoOuvert); o1.setFournisseur(f1); o1.setPrixTotal(15000.0); o1.setStatut(Offre.STATUT_SOUMISE);
        o1.setDateSoumission(LocalDate.now());
        offreRepository.save(o1);
        Offre o2 = new Offre(); o2.setAppelOffre(aoOuvert); o2.setFournisseur(f2); o2.setPrixTotal(14500.0); o2.setStatut(Offre.STATUT_SOUMISE);
        o2.setDateSoumission(LocalDate.now());
        offreRepository.save(o2);

        // AO3: BROUILLON
        AppelOffre aoBrouillon = new AppelOffre();
        aoBrouillon.setReference("AO-2026-BROUILLON");
        aoBrouillon.setDateDebut(LocalDate.now().plusDays(1));
        aoBrouillon.setDateFin(LocalDate.now().plusDays(20));
        aoBrouillon.setStatut(AppelOffre.STATUT_BROUILLON);
        aoBrouillon.setResponsable(resp);
        appelOffreRepository.save(aoBrouillon);

        // 11. Ressources Affectées (Inventaire)
        // PC déjà affecté à un enseignant
        Ressource res1 = new Ressource();
        res1.setNumeroInventaire("INV-PC-AFF-001");
        res1.setStatut(Ressource.STATUT_AFFECTEE);
        res1.setMarque("Lenovo ThinkPad");
        res1.setTypeRessource(tPC);
        res1.setDateReception(LocalDate.now().minusMonths(6));
        res1.setFournisseur(f1);
        res1.setDateFinGarantie(LocalDate.now().plusYears(2));
        res1 = ressourceRepository.save(res1);

        Affectation aff1 = new Affectation();
        aff1.setRessource(res1);
        aff1.setEnseignant(allProfs.get(0));
        aff1.setDateAffectation(LocalDate.now().minusMonths(6));
        affectationRepository.save(aff1);

        // Une autre ressource en panne
        Ressource resPanne = new Ressource();
        resPanne.setNumeroInventaire("INV-IMP-PANNE-001");
        resPanne.setStatut(Ressource.STATUT_MAINTENANCE);
        resPanne.setMarque("HP LaserJet");
        resPanne.setTypeRessource(tImp);
        resPanne.setDateReception(LocalDate.now().minusYears(1));
        resPanne.setFournisseur(f1);
        resPanne.setDateFinGarantie(LocalDate.now().plusYears(1));
        resPanne = ressourceRepository.save(resPanne);

        Affectation aff2 = new Affectation();
        aff2.setRessource(resPanne);
        aff2.setEnseignant(allProfs.get(1));
        aff2.setDateAffectation(LocalDate.now().minusYears(1));
        affectationRepository.save(aff2);

        // 12. Maintenance
        // 2 Déclarations en panne au technicien
        SignalementPanne sig1 = new SignalementPanne();
        sig1.setRessource(resPanne); sig1.setEnseignant(allProfs.get(1));
        sig1.setDateSignalement(LocalDate.now().minusDays(3));
        sig1.setDescription("Bourrage papier constant et fumée");
        sig1.setStatut(SignalementPanne.STATUT_SIGNALE);
        signalementPanneRepository.save(sig1);

        SignalementPanne sig2 = new SignalementPanne();
        sig2.setRessource(res1); sig2.setEnseignant(allProfs.get(0));
        sig2.setDateSignalement(LocalDate.now().minusDays(1));
        sig2.setDescription("Écran bleu au démarrage");
        sig2.setStatut(SignalementPanne.STATUT_SIGNALE);
        signalementPanneRepository.save(sig2);

        // 1 Déclaration (Constat) du technicien au responsable
        SignalementPanne sig3 = new SignalementPanne();
        sig3.setRessource(resPanne); sig3.setEnseignant(allProfs.get(1));
        sig3.setStatut(SignalementPanne.STATUT_CONSTAT);
        sig3.setDateSignalement(LocalDate.now().minusDays(10));
        sig3.setDescription("Panne majeure constatée par l'enseignant");
        sig3 = signalementPanneRepository.save(sig3);

        Constat c1 = new Constat();
        c1.setSignalement(sig3);
        c1.setTechnicien(tech1);
        c1.setDateConstat(LocalDate.now());
        c1.setDateApparition(LocalDate.now().minusDays(15));
        c1.setExplication("Le tambour est mort, réparation trop coûteuse.");
        c1.setFrequence(Constat.FREQ_PERMANENTE);
        c1.setOrdre(Constat.ORDRE_MATERIEL);
        c1.setEnvoyeAuResponsable(true);
        constatRepository.save(c1);

        System.out.println(">>> Initialisation complète terminée selon les spécifications utilisateur.");
    }
}
