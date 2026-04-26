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
import java.util.Random;
import java.util.stream.Collectors;

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

    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        if (departementRepository.count() > 0) {
            // Si la base est déjà pleine, on s'assure juste que les ressources ont un demandeur
            List<Departement> depts = departementRepository.findAll();
            List<Enseignant> teachers = enseignantRepository.findAll();
            if (!depts.isEmpty()) {
                ressourceRepository.findAll().stream()
                    .filter(r -> r.getDepartementDemandeur() == null || r.getEnseignantDemandeur() == null)
                    .forEach(r -> {
                        if (r.getDepartementDemandeur() == null) {
                            r.setDepartementDemandeur(depts.get(random.nextInt(depts.size())));
                        }
                        if (r.getEnseignantDemandeur() == null && !teachers.isEmpty()) {
                            r.setEnseignantDemandeur(teachers.get(random.nextInt(teachers.size())));
                        }
                        ressourceRepository.save(r);
                    });

                // Backfill AO departement
                appelOffreRepository.findAll().stream()
                    .filter(ao -> ao.getDepartement() == null)
                    .forEach(ao -> {
                        ao.setDepartement(depts.get(random.nextInt(depts.size())));
                        appelOffreRepository.save(ao);
                    });

                // Backfill Constat dateApparition
                constatRepository.findAll().stream()
                    .filter(c -> c.getDateApparition() == null)
                    .forEach(c -> {
                        c.setDateApparition(c.getDateConstat() != null ? c.getDateConstat() : LocalDate.now());
                        constatRepository.save(c);
                    });
            }
            return;
        }

        System.out.println(">>> Démarrage d'une initialisation massive et parfaite de la base de données...");
        String pwd = passwordEncoder.encode("password123");
        
        // ... (rest of the existing logic)
        // Note: I will only replace the top part and then ensure the loop part is also correct.

        // 1. Responsable
        Responsable resp = responsableRepository.save(new Responsable("Admin", "Responsable", "admin@univ.ma", pwd, "ADM-001", "Bureau Central A102"));

        // 2. Départements (8)
        List<Departement> depts = new ArrayList<>();
        String[] deptNames = {"Informatique", "Physique", "Biologie", "Chimie", "Mathématiques", "Géologie", "Économie", "Lettres"};
        Double[] budgets = {3000000.0, 2000000.0, 1800000.0, 1500000.0, 1200000.0, 900000.0, 1400000.0, 800000.0};
        for (int i = 0; i < deptNames.length; i++) {
            depts.add(departementRepository.save(new Departement(deptNames[i], budgets[i])));
        }

        // 3. Chefs de Département
        String[] chefNoms = {"Alami", "Bennani", "Kadiri", "Sami", "Drissi", "Zaid", "Hassan", "Fahmi"};
        for (int i = 0; i < depts.size(); i++) {
            chefRepository.save(new ChefDepartement(chefNoms[i], "Pr. " + chefNoms[i], "chef." + depts.get(i).getNom().toLowerCase() + "@univ.ma", pwd, "CHEF-00" + (i + 1), "Doyen de " + depts.get(i).getNom(), depts.get(i)));
        }

        // 4. Enseignants (10 par département = 80)
        List<Enseignant> allProfs = new ArrayList<>();
        for (Departement d : depts) {
            for (int i = 1; i <= 10; i++) {
                String nom = "Prof" + i + "_" + d.getNom().substring(0, 3);
                allProfs.add(enseignantRepository.save(new Enseignant(nom, "Enseignant", nom.toLowerCase() + i + "@univ.ma", pwd, "P-" + d.getNom().substring(0,1).toUpperCase() + "-" + String.format("%03d", i), "Spécialité " + i, d)));
            }
        }

        // 5. Techniciens (6)
        List<Technicien> techs = new ArrayList<>();
        String[] techSpecs = {"Hardware", "Réseau", "Logiciel", "Support", "Télécom", "Électronique"};
        for (int i = 0; i < techSpecs.length; i++) {
            techs.add(technicienRepository.save(new Technicien("TechNom" + i, "TechPrenom" + i, "tech" + (i + 1) + "@univ.ma", pwd, "T-00" + (i + 1), techSpecs[i])));
        }

        // 6. Fournisseurs (10)
        String[] fNames = {"Mega Tech", "Alpha Systems", "Buro Plus", "Connect IT", "Smart Solutions", "Global IT", "Expert Systems", "Digital Mar", "Rabat Tech", "Casa Soft"};
        List<Fournisseur> suppliers = new ArrayList<>();
        for (int i = 0; i < fNames.length; i++) {
            Fournisseur f = new Fournisseur(fNames[i], "contact@" + fNames[i].toLowerCase().replace(" ", "") + ".ma", pwd);
            f.setGerant("Directeur " + fNames[i]);
            f.setLieu(i % 2 == 0 ? "Casablanca" : "Rabat");
            suppliers.add(fournisseurRepository.save(f));
        }

        // 7. Types de Ressources (Seulement 2 basés sur l'héritage existant)
        TypeRessource tPC = typeRessourceRepository.save(new TypeRessource("ORDINATEUR", "Ordinateur Portable / Fixe", true));
        TypeRessource tImp = typeRessourceRepository.save(new TypeRessource("IMPRIMANTE", "Imprimante Laser / Jet d'encre", true));

        // 8. Cycle de Besoins et Réunions (Ordinateurs et Imprimantes seulement)
        List<BesoinRessource> allBesoins = new ArrayList<>();
        for (Departement d : depts) {
            Reunion r = new Reunion();
            r.setDate(LocalDate.now().minusWeeks(random.nextInt(4) + 1));
            r.setHeure("10:00");
            r.setDepartement(d);
            r.setStatut(Reunion.STATUT_VALIDEE);
            r = reunionRepository.save(r);

            for (int i = 0; i < 8; i++) {
                Enseignant p = allProfs.get(random.nextInt(allProfs.size()));
                if (random.nextBoolean()) {
                    BesoinOrdinateur bo = new BesoinOrdinateur();
                    bo.setTypeRessource(tPC); bo.setQuantite(1); bo.setStatut("VALIDE");
                    bo.setDepartement(d); bo.setEnseignant(p); bo.setReunion(r);
                    bo.setCpu("i7"); bo.setRam("32GB"); bo.setDisqueDur("1TB SSD");
                    allBesoins.add(besoinRessourceRepository.save(bo));
                } else {
                    BesoinImprimante bi = new BesoinImprimante();
                    bi.setTypeRessource(tImp); bi.setQuantite(1); bi.setStatut("VALIDE");
                    bi.setDepartement(d); bi.setEnseignant(p); bi.setReunion(r);
                    bi.setMarque("Canon"); bi.setResolution("2400 DPI");
                    allBesoins.add(besoinRessourceRepository.save(bi));
                }
            }
        }

        // 9. Appels d'Offres & Offres (Massif)
        for (int i = 1; i <= 10; i++) {
            Departement aoDept = depts.get(random.nextInt(depts.size()));
            AppelOffre ao = new AppelOffre();
            ao.setReference("AO-2025-" + String.format("%03d", i));
            ao.setDateDebut(LocalDate.now().minusMonths(i));
            ao.setDateFin(LocalDate.now().minusMonths(i).plusDays(20));
            ao.setStatut(i < 5 ? AppelOffre.STATUT_TRAITE : (i < 8 ? AppelOffre.STATUT_OUVERT : AppelOffre.STATUT_BROUILLON));
            ao.setResponsable(resp);
            ao.setDepartement(aoDept);
            ao = appelOffreRepository.save(ao);

            // Filtrer les besoins pour ce département spécifique
            List<BesoinRessource> deptBesoins = allBesoins.stream()
                .filter(b -> b.getDepartement().getId().equals(aoDept.getId()))
                .collect(Collectors.toList());

            if ((ao.getStatut().equals(AppelOffre.STATUT_TRAITE) || ao.getStatut().equals(AppelOffre.STATUT_OUVERT)) && !deptBesoins.isEmpty()) {
                for (int j = 0; j < 3; j++) {
                    Offre o = new Offre();
                    o.setAppelOffre(ao); 
                    o.setFournisseur(suppliers.get(random.nextInt(suppliers.size())));
                    o.setPrixTotal(50000.0 + random.nextInt(150000));
                    o.setStatut(ao.getStatut().equals(AppelOffre.STATUT_TRAITE) && j == 0 ? Offre.STATUT_LIVREE : Offre.STATUT_SOUMISE);
                    o.setDateSoumission(ao.getDateDebut().plusDays(5));
                    o.setDureeGarantie(24);
                    
                    if (o.getStatut().equals(Offre.STATUT_LIVREE)) {
                        o.setDateLivraison(ao.getDateFin().plusDays(10));
                    }
                    
                    o = offreRepository.save(o);

                    for (int k = 0; k < 2; k++) {
                        LigneOffreOrdinateur lo = new LigneOffreOrdinateur();
                        lo.setOffre(o);
                        lo.setTypeRessource(tPC);
                        lo.setBesoin(deptBesoins.get(random.nextInt(deptBesoins.size())));
                        lo.setPrixUnitaire(12000.0);
                        lo.setQuantite(2);
                        lo.setMarque("Dell Precision");
                        lo.setCpu("i9 Gen 13");
                        lo.setRam("64GB");
                        lo.setDisqueDur("2TB SSD");
                        o.getLignes().add(lo);
                    }
                    offreRepository.save(o);
                }
            }
        }

        // 10. Parc de Ressources (200 unités - Uniquement Ordinateurs et Imprimantes)
        List<Ressource> inventory = new ArrayList<>();
        for (int i = 1; i <= 200; i++) {
            Ressource res;
            if (random.nextBoolean()) { // ORDINATEUR
                RessourceOrdinateur pc = new RessourceOrdinateur();
                pc.setCpu(i % 2 == 0 ? "Intel i7-12700K" : "AMD Ryzen 7 5800X");
                pc.setRam(i % 2 == 0 ? "16GB DDR4" : "32GB DDR4");
                pc.setDisqueDur(i % 2 == 0 ? "512GB NVMe SSD" : "1TB NVMe SSD");
                pc.setEcran(i % 2 == 0 ? "15.6\" FHD" : "14\" QHD");
                pc.setTypeRessource(tPC);
                res = pc;
            } else { // IMPRIMANTE
                RessourceImprimante imp = new RessourceImprimante();
                imp.setVitesseImpression(i % 2 == 0 ? 35 : 50);
                imp.setResolution(i % 2 == 0 ? "1200 x 1200 DPI" : "2400 x 600 DPI");
                imp.setTypeRessource(tImp);
                res = imp;
            }

            res.setNumeroInventaire("INV-" + String.format("%04d", i));
            res.setMarque(i % 3 == 0 ? "Dell" : (i % 3 == 1 ? "HP" : "Lenovo"));
            res.setDateReception(LocalDate.now().minusMonths(random.nextInt(36)));
            res.setFournisseur(suppliers.get(random.nextInt(suppliers.size())));
            res.setPrix(5000.0 + random.nextInt(15000));
            res.setDateFinGarantie(LocalDate.now().plusMonths(random.nextInt(24) - 6));
            
            int rnd = random.nextInt(100);
            if (rnd < 70) {
                res.setStatut(Ressource.STATUT_AFFECTEE);
            } else if (rnd < 85) {
                res.setStatut(Ressource.STATUT_DISPONIBLE);
            } else if (rnd < 95) {
                res.setStatut(Ressource.STATUT_MAINTENANCE);
            } else {
                res.setStatut(Ressource.STATUT_EN_PANNE);
            }
            
            res.setDepartement(depts.get(random.nextInt(depts.size())));
            
            // Simulation systématique d'une demande d'origine pour toutes les ressources
            res.setDepartementDemandeur(depts.get(random.nextInt(depts.size())));
            if (!allProfs.isEmpty()) {
                res.setEnseignantDemandeur(allProfs.get(random.nextInt(allProfs.size())));
            }
            
            inventory.add(ressourceRepository.save(res));
        }

        // 11. Affectations Réelles (140 affectations)
        for (int i = 0; i < 140; i++) {
            Ressource res = inventory.get(i);
            Enseignant p = allProfs.get(i % allProfs.size());
            Affectation aff = new Affectation();
            aff.setRessource(res);
            aff.setEnseignant(p);
            aff.setDateAffectation(res.getDateReception().plusDays(random.nextInt(10) + 1));
            aff.setDepartement(p.getDepartement());
            affectationRepository.save(aff);
        }

        // 12. Historique de Maintenance (Vaste historique)
        for (int i = 0; i < 20; i++) {
            Ressource res = inventory.get(random.nextInt(140));
            SignalementPanne sig = new SignalementPanne();
            sig.setRessource(res);
            sig.setEnseignant(allProfs.get(random.nextInt(allProfs.size())));
            sig.setDateSignalement(LocalDate.now().minusDays(random.nextInt(30)));
            sig.setDescription("Panne critique #" + i + " : " + (i % 2 == 0 ? "Problème carte mère" : "Surchauffe processeur"));
            
            if (i < 10) {
                sig.setStatut(SignalementPanne.STATUT_SIGNALE);
            } else {
                sig.setStatut(SignalementPanne.STATUT_CONSTAT);
                sig = signalementPanneRepository.save(sig);
                
                Constat c = new Constat();
                c.setSignalement(sig);
                c.setTechnicien(techs.get(random.nextInt(techs.size())));
                c.setDateConstat(LocalDate.now().minusDays(1));
                c.setDateApparition(LocalDate.now().minusDays(3));
                c.setExplication("Expertise technique #" + i + " : Remplacement nécessaire.");
                c.setOrdre(Constat.ORDRE_MATERIEL);
                c.setFrequence(Constat.FREQ_PERMANENTE);
                c.setEnvoyeAuResponsable(true);
                c.setTechnicien(techs.get(random.nextInt(techs.size())));
                constatRepository.save(c);
            }
            signalementPanneRepository.save(sig);
        }

        System.out.println(">>> Initialisation parfaite terminée : 5 Depts, 20 Profs, 5 Fournisseurs, 50 Ressources, Cycle complet simulé.");
    }
}
