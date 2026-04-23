package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.utilisateurs.*;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.*;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.*;
import ma.faculte.gestion_ressources_backend.services.interfaces.IUtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/*
 * IMPLÉMENTATION SERVICE UTILISATEUR
 * Contient toute la logique métier liée aux utilisateurs
 *
 * RÈGLES MÉTIER IMPORTANTES :
 * 1. Seul le Responsable peut créer des utilisateurs internes
 *    cette règle sera enforced par Spring Security JWT plus tard
 *    pour l'instant c'est géré au niveau du controller
 * 2. Le Fournisseur s'inscrit seul via AuthController
 *    pas via ce service
 * 3. email doit être unique dans toute la table utilisateurs
 */

@Service
public class UtilisateurServiceImpl implements IUtilisateurService {

    @Autowired
    private IUtilisateurRepository utilisateurRepository;

    @Autowired
    private IEnseignantRepository enseignantRepository;

    @Autowired
    private IChefDepartementRepository chefRepository;

    @Autowired
    private IResponsableRepository responsableRepository;

    @Autowired
    private ITechnicienRepository technicienRepository;

    @Autowired
    private IFournisseurRepository fournisseurRepository;

    @Autowired
    private IDepartementRepository departementRepository;

    @Autowired
    private IReunionRepository reunionRepository;

    @Autowired
    private IBesoinRessourceRepository besoinRepository;

    @Autowired
    private IAffectationRepository affectationRepository;

    @Autowired
    private ISignalementPanneRepository signalementRepository;

    @Autowired
    private IConstatRepository constatRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =====================
    // CRÉATION (DTO générique)
    // =====================

    @Override
    public UtilisateurDTO creerUtilisateur(UtilisateurDTO dto) {
        if (dto.getRole() == null || dto.getRole().isBlank()) {
            throw new RuntimeException("Le rôle est obligatoire");
        }
        String role = dto.getRole().trim();
        switch (role) {
            case "ENSEIGNANT":
                return creerEnseignant(versEnseignantDTO(dto));
            case "CHEF_DEPARTEMENT":
                return creerChefDepartement(versEnseignantDTO(dto));
            case "RESPONSABLE":
                return creerResponsable(versEnseignantDTO(dto));
            case "TECHNICIEN":
                return creerTechnicien(versEnseignantDTO(dto));
            case "FOURNISSEUR":
                if (dto.getNomSociete() == null || dto.getEmail() == null
                        || dto.getMotDePasse() == null) {
                    throw new RuntimeException(
                            "nomSociete, email et motDePasse sont obligatoires pour un fournisseur");
                }
                InscriptionFournisseurDTO ins = new InscriptionFournisseurDTO();
                ins.setNomSociete(dto.getNomSociete());
                ins.setEmail(dto.getEmail());
                ins.setMotDePasse(dto.getMotDePasse());
                FournisseurDTO f = inscrireFournisseur(ins);
                return getById(f.getId());
            default:
                throw new RuntimeException("Rôle non pris en charge : " + role);
        }
    }

    @Override
    public UtilisateurDTO modifierUtilisateur(Long id, UtilisateurDTO dto) {
        Utilisateur utilisateur = utilisateurRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + id));
        if (dto.getNom() != null) {
            utilisateur.setNom(dto.getNom());
        }
        if (dto.getPrenom() != null) {
            utilisateur.setPrenom(dto.getPrenom());
        }
        if (dto.getEmail() != null) {
            utilisateur.setEmail(dto.getEmail());
        }
        if (dto.getActif() != null) {
            utilisateur.setActif(dto.getActif());
        }
        
        // Handling role-specific fields
        if (utilisateur instanceof ChefDepartement chef) {
            if (dto.getMatricule() != null) chef.setMatricule(dto.getMatricule());
            if (dto.getSpecialite() != null) chef.setSpecialite(dto.getSpecialite());
        } else if (utilisateur instanceof Enseignant enseignant) {
            if (dto.getMatricule() != null) enseignant.setMatricule(dto.getMatricule());
            if (dto.getSpecialite() != null) enseignant.setSpecialite(dto.getSpecialite());
        } else if (utilisateur instanceof Technicien tech) {
            if (dto.getMatricule() != null) tech.setMatricule(dto.getMatricule());
            if (dto.getSpecialite() != null) tech.setSpecialiteTechnique(dto.getSpecialite());
        } else if (utilisateur instanceof Fournisseur f) {
            if (dto.getNomSociete() != null) f.setNomSociete(dto.getNomSociete());
        }

        utilisateurRepository.save(utilisateur);
        return convertirEnDTO(utilisateur);
    }

    private EnseignantDTO versEnseignantDTO(UtilisateurDTO u) {
        EnseignantDTO e = new EnseignantDTO();
        e.setNom(u.getNom());
        e.setPrenom(u.getPrenom());
        e.setEmail(u.getEmail());
        e.setMotDePasse(u.getMotDePasse());
        e.setMatricule(u.getMatricule());
        e.setSpecialite(u.getSpecialite());
        e.setDepartementId(u.getDepartementId());
        e.setActif(u.getActif());
        e.setDisponibilite(u.getDisponibilite());
        return e;
    }

    // =====================
    // CRÉATION
    // =====================

    @Override
    public UtilisateurDTO creerEnseignant(EnseignantDTO dto) {

        /*
         * vérifier email unique avant création
         * lever exception si déjà utilisé
         */
        if (utilisateurRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + dto.getEmail());
        }

        /*
         * récupérer le département
         * lever exception si non trouvé
         */
        Departement departement = departementRepository
                .findById(dto.getDepartementId())
                .orElseThrow(() -> new RuntimeException(
                        "Département non trouvé : " + dto.getDepartementId()));

        Enseignant enseignant = new Enseignant(
                dto.getNom(),
                dto.getPrenom(),
                dto.getEmail(),
                encoderMotDePasse(dto.getMotDePasse()),
                dto.getMatricule(),
                dto.getSpecialite(),
                departement
        );

        enseignantRepository.save(enseignant);
        return convertirEnDTO(enseignant);
    }

    @Override
    public UtilisateurDTO creerTechnicien(EnseignantDTO dto) {

        if (utilisateurRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + dto.getEmail());
        }

        Technicien technicien = new Technicien(
                dto.getNom(),
                dto.getPrenom(),
                dto.getEmail(),
                encoderMotDePasse(dto.getMotDePasse()),
                dto.getMatricule(),
                dto.getSpecialite()
        );

        technicienRepository.save(technicien);
        return convertirEnDTO(technicien);
    }

    @Override
    public UtilisateurDTO creerChefDepartement(EnseignantDTO dto) {

        if (utilisateurRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + dto.getEmail());
        }

        Departement departement = departementRepository
                .findById(dto.getDepartementId())
                .orElseThrow(() -> new RuntimeException(
                        "Département non trouvé : " + dto.getDepartementId()));

        ChefDepartement chef = new ChefDepartement(
                dto.getNom(),
                dto.getPrenom(),
                dto.getEmail(),
                encoderMotDePasse(dto.getMotDePasse()),
                dto.getMatricule(),
                dto.getSpecialite(),
                departement
        );

        chefRepository.save(chef);
        return convertirEnDTO(chef);
    }

    @Override
    public UtilisateurDTO creerResponsable(EnseignantDTO dto) {

        if (utilisateurRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email déjà utilisé : " + dto.getEmail());
        }

        Responsable responsable = new Responsable(
                dto.getNom(),
                dto.getPrenom(),
                dto.getEmail(),
                encoderMotDePasse(dto.getMotDePasse()),
                dto.getMatricule(),
                dto.getSpecialite()
        );

        responsableRepository.save(responsable);
        return convertirEnDTO(responsable);
    }

    // =====================
    // MODIFICATION
    // =====================

    @Override
    public UtilisateurDTO modifierUtilisateur(Long id, EnseignantDTO dto) {

        Utilisateur utilisateur = utilisateurRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Utilisateur non trouvé : " + id));

        if (dto.getNom() != null) utilisateur.setNom(dto.getNom());
        if (dto.getPrenom() != null) utilisateur.setPrenom(dto.getPrenom());
        if (dto.getEmail() != null) utilisateur.setEmail(dto.getEmail());
        if (dto.getActif() != null) utilisateur.setActif(dto.getActif());

        // IMPORTANT: vérifier ChefDepartement AVANT Enseignant
        // car ChefDepartement extends Enseignant → les deux instanceof seraient vrais
        if (utilisateur instanceof ChefDepartement chef) {
            if (dto.getMatricule() != null) chef.setMatricule(dto.getMatricule());
            if (dto.getSpecialite() != null) chef.setSpecialite(dto.getSpecialite());
            if (dto.getDepartementId() != null) {
                Departement dept = departementRepository.findById(dto.getDepartementId())
                        .orElseThrow(() -> new RuntimeException("Département non trouvé : " + dto.getDepartementId()));
                chef.setDepartementGere(dept);
            }
        } else if (utilisateur instanceof Enseignant enseignant) {
            if (dto.getMatricule() != null) enseignant.setMatricule(dto.getMatricule());
            if (dto.getSpecialite() != null) enseignant.setSpecialite(dto.getSpecialite());

            if (dto.getDepartementId() != null) {
                Departement dept = departementRepository.findById(dto.getDepartementId())
                        .orElseThrow(() -> new RuntimeException("Département non trouvé : " + dto.getDepartementId()));
                enseignant.setDepartement(dept);
            }
        } else if (utilisateur instanceof Technicien tech) {
            if (dto.getMatricule() != null) tech.setMatricule(dto.getMatricule());
            if (dto.getSpecialite() != null) tech.setSpecialiteTechnique(dto.getSpecialite());
            if (dto.getDisponibilite() != null) tech.setDisponibilite(dto.getDisponibilite());
        }

        utilisateurRepository.save(utilisateur);
        return convertirEnDTO(utilisateur);
    }

    // =====================
    // SUPPRESSION
    // =====================

    @Override
    @Transactional
    public void supprimerUtilisateur(Long id) {

        Utilisateur utilisateur = utilisateurRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Utilisateur non trouvé : " + id));

        // 1. Libérer les relations si c'est un enseignant
        if (utilisateur instanceof Enseignant e) {
            besoinRepository.findByEnseignantId(id).forEach(b -> {
                b.setEnseignant(null);
                besoinRepository.save(b);
            });
            
            affectationRepository.findAll().stream()
                .filter(a -> a.getEnseignant() != null && a.getEnseignant().getId().equals(id))
                .forEach(a -> {
                    a.setEnseignant(null);
                    affectationRepository.save(a);
                });

            signalementRepository.findByEnseignant_Id(id).forEach(s -> {
                s.setEnseignant(null);
                signalementRepository.save(s);
            });
        }

        // 2. Libérer les relations si c'est un chef de département
        if (utilisateur instanceof ChefDepartement c) {
            if (c.getDepartementGere() != null) {
                c.setDepartementGere(null);
                chefRepository.save(c);
            }
            reunionRepository.findAll().stream()
                .filter(r -> r.getChef() != null && r.getChef().getId().equals(id))
                .forEach(r -> {
                    r.setChef(null);
                    reunionRepository.save(r);
                });
        }
        
        // 3. Libérer les relations si c'est un technicien
        if (utilisateur instanceof Technicien t) {
            signalementRepository.findByTechnicien_Id(id).forEach(s -> {
                s.setTechnicien(null);
                signalementRepository.save(s);
            });
            constatRepository.findByTechnicien_Id(id).forEach(co -> {
                co.setTechnicien(null);
                constatRepository.save(co);
            });
        }

        utilisateurRepository.delete(utilisateur);
    }

    // =====================
    // CONSULTATION
    // =====================

    @Override
    @Transactional(readOnly = true)
    public UtilisateurDTO getById(Long id) {

        // Pour les chefs de département, utiliser JOIN FETCH pour charger departementGere
        var chefOpt = chefRepository.findByIdWithDepartement(id);
        if (chefOpt.isPresent()) {
            return convertirEnDTO(chefOpt.get());
        }

        Utilisateur utilisateur = utilisateurRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Utilisateur non trouvé : " + id));

        return convertirEnDTO(utilisateur);
    }

    @Override
    public List<UtilisateurDTO> getAll() {
        return utilisateurRepository.findAll()
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilisateurDTO> getByRole(String role) {
        // Pour CHEF_DEPARTEMENT, charger departementGere en une seule requête JOIN FETCH
        if ("CHEF_DEPARTEMENT".equals(role)) {
            return chefRepository.findAllWithDepartement()
                    .stream()
                    .map(this::convertirEnDTO)
                    .collect(Collectors.toList());
        }
        return utilisateurRepository.findByRole(role)
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    // =====================
    // COMPLÉTER FOURNISSEUR
    // =====================

    @Override
    public FournisseurDTO completerInfosFournisseur(Long id, FournisseurDTO dto) {

        /*
         * IMPORTANT POUR MEMBRE 4 :
         * cette méthode est appelée après la première livraison
         * pour compléter les infos du fournisseur
         * appelle : PUT /api/utilisateurs/fournisseur/{id}/completer
         */
        Fournisseur fournisseur = fournisseurRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Fournisseur non trouvé : " + id));

        if (dto.getLieu() != null) fournisseur.setLieu(dto.getLieu());
        if (dto.getAdresse() != null) fournisseur.setAdresse(dto.getAdresse());
        if (dto.getSiteInternet() != null) fournisseur.setSiteInternet(dto.getSiteInternet());
        if (dto.getGerant() != null) fournisseur.setGerant(dto.getGerant());

        fournisseurRepository.save(fournisseur);
        return convertirFournisseurEnDTO(fournisseur);
    }

    // =====================
    // MÉTHODES PRIVÉES
    // =====================

    private UtilisateurDTO convertirEnDTO(Utilisateur u) {
        UtilisateurDTO dto = new UtilisateurDTO(
                u.getId(),
                u.getNom(),
                u.getPrenom(),
                u.getEmail(),
                u.getRole(),
                u.getDateCreation(),
                u.isActif()
        );
        dto.setMotDePasse(u.getMotDePasse());

        if (u instanceof ChefDepartement c) {
            dto.setMatricule(c.getMatricule());
            dto.setSpecialite(c.getSpecialite());
            if (c.getDepartementGere() != null) {
                dto.setDepartementId(c.getDepartementGere().getId());
                dto.setDepartementNom(c.getDepartementGere().getNom());
            }
        } else if (u instanceof Enseignant e) {
            dto.setMatricule(e.getMatricule());
            dto.setSpecialite(e.getSpecialite());
            if (e.getDepartement() != null) {
                dto.setDepartementId(e.getDepartement().getId());
                dto.setDepartementNom(e.getDepartement().getNom());
            }
        } else if (u instanceof Technicien t) {
            dto.setMatricule(t.getMatricule());
            dto.setSpecialite(t.getSpecialiteTechnique());
            dto.setDisponibilite(t.getDisponibilite());
        } else if (u instanceof Fournisseur f) {
            dto.setNomSociete(f.getNomSociete());
            dto.setEstListeNoire(f.isEstListeNoire());
            dto.setLieu(f.getLieu());
            dto.setAdresse(f.getAdresse());
            dto.setSiteInternet(f.getSiteInternet());
            dto.setGerant(f.getGerant());
        }

        return dto;
    }

    private FournisseurDTO convertirFournisseurEnDTO(Fournisseur f) {
        FournisseurDTO dto = new FournisseurDTO();
        dto.setId(f.getId());
        dto.setNomSociete(f.getNomSociete());
        dto.setEmail(f.getEmail());
        dto.setLieu(f.getLieu());
        dto.setAdresse(f.getAdresse());
        dto.setSiteInternet(f.getSiteInternet());
        dto.setGerant(f.getGerant());
        dto.setEstListeNoire(f.isEstListeNoire());
        dto.setDateInscription(f.getDateInscription());
        return dto;
    }
    /*
     * ajouter cette méthode dans UtilisateurServiceImpl
     * après la méthode completerInfosFournisseur
     */
    @Override
    public FournisseurDTO inscrireFournisseur(InscriptionFournisseurDTO dto) {

        /*
         * vérifier email unique
         */
        if (utilisateurRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException(
                    "Email déjà utilisé : " + dto.getEmail());
        }

        /*
         * vérifier nom société unique
         */
        if (fournisseurRepository.existsByNomSociete(dto.getNomSociete())) {
            throw new RuntimeException(
                    "Société déjà inscrite : " + dto.getNomSociete());
        }

        Fournisseur fournisseur = new Fournisseur(
                dto.getNomSociete(),
                dto.getEmail(),
                encoderMotDePasse(dto.getMotDePasse())
        );

        fournisseurRepository.save(fournisseur);
        return convertirFournisseurEnDTO(fournisseur);
    }

    @Override
    @Transactional
    public void changerMotDePasse(Long id, String nouveauMotDePasse) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        utilisateur.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        utilisateurRepository.save(utilisateur);
    }

    private String encoderMotDePasse(String brut) {
        if (brut == null || brut.isBlank()) {
            throw new RuntimeException("Le mot de passe est obligatoire");
        }
        // Utilisation du PasswordEncoder injecté pour hasher le mot de passe (BCrypt)
        return passwordEncoder.encode(brut);
    }
}