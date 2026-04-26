package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.inventaire.AffectationDTO;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.entities.inventaire.Affectation;
import ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Enseignant;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.ChefDepartement;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IAffectationRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IDepartementRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IEnseignantRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IRessourceRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IResponsableRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IChefDepartementRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.IAffectationService;
import ma.faculte.gestion_ressources_backend.services.interfaces.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AffectationServiceImpl implements IAffectationService {

    @Autowired
    private IAffectationRepository affectationRepository;

    @Autowired
    private IRessourceRepository ressourceRepository;

    @Autowired
    private IDepartementRepository departementRepository;

    @Autowired
    private IEnseignantRepository enseignantRepository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private IResponsableRepository responsableRepository;

    @Autowired
    private IChefDepartementRepository chefDepartementRepository;

    @Override
    @Transactional
    public AffectationDTO affecter(AffectationDTO dto) {
        Ressource r = ressourceRepository.findById(dto.getRessourceId())
                .orElseThrow(() -> new RuntimeException("Ressource introuvable"));
        
        Affectation aff = affectationRepository.findByRessource_Id(r.getId()).orElse(null);
        
        if (aff == null && !Ressource.STATUT_DISPONIBLE.equals(r.getStatut())) {
            throw new RuntimeException("La ressource n'est pas disponible pour affectation");
        }
        
        if (aff == null) {
            aff = new Affectation();
            aff.setRessource(r);
        }

        Departement dep = departementRepository.findById(dto.getDepartementId())
                .orElseThrow(() -> new RuntimeException("Département introuvable"));
                
        if (!dto.isAffectationCollective() && dto.getEnseignantId() == null) {
            throw new RuntimeException("Enseignant requis pour une affectation individuelle");
        }
        
        Enseignant ens = null;
        if (dto.getEnseignantId() != null) {
            ens = enseignantRepository.findById(dto.getEnseignantId())
                    .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));
        }
        
        aff.setDepartement(dep);
        aff.setEnseignant(ens);
        aff.setAffectationCollective(dto.isAffectationCollective());
        aff.setDateAffectation(dto.getDateAffectation() != null ? dto.getDateAffectation() : LocalDate.now());
        
        r.setStatut(Ressource.STATUT_AFFECTEE);
        r.setDepartement(dep);
        ressourceRepository.save(r);
        
        Affectation saved = affectationRepository.save(aff);
        
        // Notifications
        Long senderId = dto.getExpediteurId();
        if (senderId == null) {
            senderId = responsableRepository.findAll().get(0).getId(); // Fallback to Admin
        }
        
        final Long finalSenderId = senderId;
        
        if (ens != null) {
            notificationService.envoyerAffectation(ens.getId(), finalSenderId, r.getMarque());
        }
        
        // Notify Chef if it was a Responsable affecting to department
        // Or notify that it's now collective if Chef unassigned it
        chefDepartementRepository.findByDepartementGereId(dep.getId()).ifPresent(chef -> {
            if (!chef.getId().equals(finalSenderId)) {
                String msg = "La ressource (" + r.getMarque() + ") a été mise à jour dans votre département.";
                notificationService.envoyerNotification(chef.getId(), finalSenderId, msg, "AFFECTATION");
            }
        });

        return versDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AffectationDTO> listerParDepartement(Long departementId) {
        return affectationRepository.findByDepartement_Id(departementId).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AffectationDTO getByRessource(Long ressourceId) {
        Affectation a = affectationRepository.findByRessource_Id(ressourceId)
                .orElseThrow(() -> new RuntimeException("Aucune affectation pour cette ressource"));
        return versDto(a);
    }

    @Override
    @Transactional
    public void retirerAffectation(Long affectationId) {
        Affectation a = affectationRepository.findById(affectationId)
                .orElseThrow(() -> new RuntimeException("Affectation introuvable"));
        Ressource r = a.getRessource();
        r.setStatut(Ressource.STATUT_DISPONIBLE);
        r.setDepartement(null);
        ressourceRepository.save(r);
        affectationRepository.delete(a);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AffectationDTO> listerParEnseignant(Long enseignantId) {
        Enseignant ens = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));
        
        List<Affectation> ind = new java.util.ArrayList<>(affectationRepository.findByEnseignant_Id(enseignantId));
        if (ens.getDepartement() != null) {
            List<Affectation> coll = affectationRepository.findByDepartement_Id(ens.getDepartement().getId())
                    .stream().filter(Affectation::isAffectationCollective).collect(Collectors.toList());
            ind.addAll(coll);
        }
        return ind.stream().map(this::versDto).collect(Collectors.toList());
    }

    private AffectationDTO versDto(Affectation a) {
        AffectationDTO d = new AffectationDTO();
        d.setId(a.getId());
        d.setRessourceId(a.getRessource().getId());
        if (a.getDepartement() != null) {
            d.setDepartementId(a.getDepartement().getId());
        }
        if (a.getEnseignant() != null) {
            d.setEnseignantId(a.getEnseignant().getId());
        }
        d.setAffectationCollective(a.isAffectationCollective());
        d.setDateAffectation(a.getDateAffectation());
        
        // Populate resource details
        if (a.getRessource() != null) {
            d.setRessourceMarque(a.getRessource().getMarque());
            if (a.getRessource().getTypeRessource() != null) {
                d.setRessourceCategorie(a.getRessource().getTypeRessource().getLibelle());
            }
            d.setRessourceNumeroInventaire(a.getRessource().getNumeroInventaire());
            d.setRessourceStatut(a.getRessource().getStatut());
        }
        
        return d;
    }
}
