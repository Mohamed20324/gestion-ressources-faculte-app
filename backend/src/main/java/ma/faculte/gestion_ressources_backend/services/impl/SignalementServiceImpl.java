package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.maintenance.SignalementPanneDTO;
import ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource;
import ma.faculte.gestion_ressources_backend.entities.maintenance.SignalementPanne;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Enseignant;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Technicien;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IAffectationRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IEnseignantRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IRessourceRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.ISignalementPanneRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.ITechnicienRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.ISignalementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SignalementServiceImpl implements ISignalementService {

    @Autowired
    private ISignalementPanneRepository signalementRepository;

    @Autowired
    private IRessourceRepository ressourceRepository;

    @Autowired
    private IEnseignantRepository enseignantRepository;

    @Autowired
    private ITechnicienRepository technicienRepository;

    @Autowired
    private IAffectationRepository affectationRepository;

    @Autowired
    private ma.faculte.gestion_ressources_backend.services.interfaces.INotificationService notificationService;

    @Override
    @Transactional
    public SignalementPanneDTO creer(SignalementPanneDTO dto) {
        Ressource r = ressourceRepository.findById(dto.getRessourceId())
                .orElseThrow(() -> new RuntimeException("Ressource introuvable"));
        Enseignant ens = enseignantRepository.findById(dto.getEnseignantId())
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));
        SignalementPanne s = new SignalementPanne();
        s.setRessource(r);
        s.setEnseignant(ens);
        s.setDescription(dto.getDescription());
        s.setDateSignalement(dto.getDateSignalement() != null ? dto.getDateSignalement() : LocalDate.now());
        s.setStatut(SignalementPanne.STATUT_SIGNALE);
        if (dto.getTechnicienId() != null) {
            Technicien t = technicienRepository.findById(dto.getTechnicienId())
                    .orElseThrow(() -> new RuntimeException("Technicien introuvable"));
            s.setTechnicien(t);
            s.setStatut(SignalementPanne.STATUT_EN_COURS);
        }
        r.setStatut(Ressource.STATUT_MAINTENANCE);
        ressourceRepository.save(r);
        
        SignalementPanne saved = signalementRepository.save(s);
        
        // Notify all technicians
        String msg = "Nouvelle panne signalée par " + ens.getNom() + " " + ens.getPrenom() + " sur le matériel " + r.getMarque();
        for (Technicien t : technicienRepository.findAll()) {
            if (notificationService != null) {
                notificationService.envoyerNotification(t.getId(), ens.getId(), msg, ma.faculte.gestion_ressources_backend.entities.appel_offre.Notification.TYPE_INFO);
            }
        }
        
        return versDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SignalementPanneDTO> listerTous() {
        return signalementRepository.findAll().stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SignalementPanneDTO getById(Long id) {
        SignalementPanne s = signalementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        return versDto(s);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SignalementPanneDTO> listerParStatut(String statut) {
        return signalementRepository.findByStatut(statut).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SignalementPanneDTO assignerTechnicien(Long signalementId, Long technicienId) {
        SignalementPanne s = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        Technicien t = technicienRepository.findById(technicienId)
                .orElseThrow(() -> new RuntimeException("Technicien introuvable"));
        s.setTechnicien(t);
        s.setStatut(SignalementPanne.STATUT_EN_COURS);
        return versDto(signalementRepository.save(s));
    }

    @Override
    @Transactional
    public SignalementPanneDTO fermer(Long signalementId) {
        SignalementPanne s = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        s.setStatut(SignalementPanne.STATUT_FERME);
        Ressource r = s.getRessource();
        String nouveau = affectationRepository.findByRessource_Id(r.getId()).isPresent()
                ? Ressource.STATUT_AFFECTEE
                : Ressource.STATUT_DISPONIBLE;
        r.setStatut(nouveau);
        ressourceRepository.save(r);
        return versDto(signalementRepository.save(s));
    }


    @Override
    @Transactional
    public SignalementPanneDTO resoudre(Long signalementId, Long technicienId) {
        SignalementPanne s = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        
        if (technicienId != null && technicienId > 0) {
            Technicien t = technicienRepository.findById(technicienId)
                    .orElseThrow(() -> new RuntimeException("Technicien introuvable"));
            s.setTechnicien(t);
        }
        
        s.setStatut(SignalementPanne.STATUT_RESOLU);
        
        Ressource r = s.getRessource();
        String nouveau = affectationRepository.findByRessource_Id(r.getId()).isPresent()
                ? Ressource.STATUT_AFFECTEE
                : Ressource.STATUT_DISPONIBLE;
        r.setStatut(nouveau);
        ressourceRepository.save(r);
        
        // Notify Enseignant
        if (s.getEnseignant() != null) {
            String name = s.getTechnicien() != null ? (s.getTechnicien().getNom() + " " + s.getTechnicien().getPrenom()) : "le fournisseur";
            Long senderId = s.getTechnicien() != null ? s.getTechnicien().getId() : 1L; // Fallback to Responsable ID
            String msg = "Votre panne sur la ressource " + r.getMarque() + " (" + r.getNumeroInventaire() + ") a été résolue par " + name + ".";
            notificationService.envoyerNotification(s.getEnseignant().getId(), senderId, msg, ma.faculte.gestion_ressources_backend.entities.appel_offre.Notification.TYPE_INFO);
        }

        return versDto(signalementRepository.save(s));
    }

    @Override
    @Transactional
    public void annuler(Long signalementId) {
        SignalementPanne s = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
                
        if (!SignalementPanne.STATUT_SIGNALE.equals(s.getStatut())) {
            throw new RuntimeException("Impossible d'annuler un signalement déjà en cours de traitement");
        }

        Ressource r = s.getRessource();
        String nouveau = affectationRepository.findByRessource_Id(r.getId()).isPresent()
                ? Ressource.STATUT_AFFECTEE
                : Ressource.STATUT_DISPONIBLE;
        r.setStatut(nouveau);
        ressourceRepository.save(r);

        signalementRepository.delete(s);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SignalementPanneDTO> listerParFournisseur(Long fournisseurId) {
        return signalementRepository.findAll().stream()
                .filter(s -> s.getRessource().getFournisseur() != null && 
                             s.getRessource().getFournisseur().getId().equals(fournisseurId))
                .filter(s -> SignalementPanne.STATUT_FOURNISSEUR.equals(s.getStatut()) || 
                             SignalementPanne.STATUT_ECHANGE.equals(s.getStatut()))
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SignalementPanneDTO programmerEchange(Long signalementId, LocalDate date) {
        SignalementPanne s = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        s.setDateLivraisonEchange(date);
        s.setStatutEchange("ACCEPTEE");
        // We keep the status as ECHANGE so it remains in the supplier's active list until received
        // s.setStatut(SignalementPanne.STATUT_RESOLU); 
        
        // Notify Responsable
        String msg = "Le fournisseur a programmé l'échange de la ressource " + s.getRessource().getMarque() + " pour le " + date;
        // In this simple system, we notify user with id 1 (Responsable) or search for it
        // For now, let's assume id 1 is the responsable
        notificationService.envoyerNotification(1L, s.getRessource().getFournisseur().getId(), msg, "INFO");
        
        return versDto(signalementRepository.save(s));
    }

    @Override
    @Transactional
    public SignalementPanneDTO receptionnerEchange(Long signalementId) {
        SignalementPanne s = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        
        Ressource r = s.getRessource();
        // Update the resource: reset status and refresh warranty
        r.setStatut(Ressource.STATUT_DISPONIBLE);
        r.setDateReception(LocalDate.now());
        // If we want to extend warranty:
        if (r.getDateFinGarantie() != null) {
            r.setDateFinGarantie(LocalDate.now().plusYears(1)); // New 1 year warranty for the exchanged item
        }
        ressourceRepository.save(r);

        s.setStatut(SignalementPanne.STATUT_RESOLU);
        s.setStatutEchange("RECUE");
        SignalementPanne saved = signalementRepository.save(s);

        // Notify Technician
        if (s.getTechnicien() != null) {
            String msgTech = "L'échange pour la ressource " + r.getMarque() + " (Inv: " + r.getNumeroInventaire() + ") a été reçu.";
            notificationService.envoyerNotification(s.getTechnicien().getId(), 1L, msgTech, "SUCCESS");
            
            // Notify Professor via Technician (as requested: "le technician informer aussi le prof")
            if (s.getEnseignant() != null) {
                String msgProf = "Bonne nouvelle ! Votre matériel " + r.getMarque() + " a été échangé et est prêt.";
                notificationService.envoyerNotification(s.getEnseignant().getId(), s.getTechnicien().getId(), msgProf, "SUCCESS");
            }
        }

        return versDto(saved);
    }

    private SignalementPanneDTO versDto(SignalementPanne s) {
        SignalementPanneDTO d = new SignalementPanneDTO();
        d.setId(s.getId());
        d.setRessourceId(s.getRessource().getId());
        d.setEnseignantId(s.getEnseignant().getId());
        if (s.getTechnicien() != null) {
            d.setTechnicienId(s.getTechnicien().getId());
        }
        d.setDescription(s.getDescription());
        d.setDateSignalement(s.getDateSignalement());
        d.setStatut(s.getStatut());
        d.setDateLivraisonEchange(s.getDateLivraisonEchange());
        d.setStatutEchange(s.getStatutEchange());
        
        if (s.getEnseignant() != null) {
            d.setEnseignantNom(s.getEnseignant().getNom() + " " + s.getEnseignant().getPrenom());
        }
        
        if (s.getTechnicien() != null) {
            d.setTechnicienNom(s.getTechnicien().getNom() + " " + s.getTechnicien().getPrenom());
        }

        if (s.getRessource() != null && s.getRessource().getTypeRessource() != null) {
            d.setRessourceType(s.getRessource().getTypeRessource().getLibelle());
        }
        
        return d;
    }
}
