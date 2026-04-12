package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.utilisateurs.*;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.*;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.*;
import ma.faculte.gestion_ressources_backend.services.interfaces.IUtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
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

        utilisateurRepository.save(utilisateur);
        return convertirEnDTO(utilisateur);
    }

    // =====================
    // SUPPRESSION
    // =====================

    @Override
    public void supprimerUtilisateur(Long id) {

        Utilisateur utilisateur = utilisateurRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Utilisateur non trouvé : " + id));

        /*
         * on désactive le compte plutôt que de supprimer
         * pour garder l'historique en base de données
         */
        utilisateur.setActif(false);
        utilisateurRepository.save(utilisateur);
    }

    // =====================
    // CONSULTATION
    // =====================

    @Override
    public UtilisateurDTO getById(Long id) {

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
    public List<UtilisateurDTO> getByRole(String role) {
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
        return new UtilisateurDTO(
                u.getId(),
                u.getNom(),
                u.getPrenom(),
                u.getEmail(),
                u.getRole(),
                u.getDateCreation(),
                u.isActif()
        );
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

    private String encoderMotDePasse(String brut) {
        if (brut == null || brut.isBlank()) {
            throw new RuntimeException("Le mot de passe est obligatoire");
        }
        return passwordEncoder.encode(brut);
    }
}