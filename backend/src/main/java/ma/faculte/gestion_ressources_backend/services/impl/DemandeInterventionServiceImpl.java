package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.intervention.DemandeInterventionDTO;
import ma.faculte.gestion_ressources_backend.entities.intervention.DemandeIntervention;
import ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Fournisseur;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Responsable;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IDemandeInterventionRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IFournisseurRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IRessourceRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IResponsableRepository;
import ma.faculte.gestion_ressources_backend.security.SecurityUtils;
import ma.faculte.gestion_ressources_backend.services.interfaces.IDemandeInterventionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandeInterventionServiceImpl implements IDemandeInterventionService {

    @Autowired
    private IDemandeInterventionRepository demandeInterventionRepository;

    @Autowired
    private IResponsableRepository responsableRepository;

    @Autowired
    private IFournisseurRepository fournisseurRepository;

    @Autowired
    private IRessourceRepository ressourceRepository;

    @Override
    @Transactional
    public DemandeInterventionDTO creer(DemandeInterventionDTO dto) {
        Long uid = SecurityUtils.requireUserId();
        Responsable resp = responsableRepository.findById(uid)
                .orElseThrow(() -> new RuntimeException("Seul un responsable peut créer une demande d'intervention"));
        Fournisseur f = fournisseurRepository.findById(dto.getFournisseurId())
                .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));
        if (f.isEstListeNoire()) {
            throw new RuntimeException("Impossible d'adresser une demande à un fournisseur en liste noire");
        }
        DemandeIntervention d = new DemandeIntervention();
        d.setResponsable(resp);
        d.setFournisseur(f);
        d.setObjet(dto.getObjet().trim());
        d.setDescription(dto.getDescription().trim());
        d.setDateDemande(LocalDate.now());
        d.setStatut(DemandeIntervention.STATUT_ENVOYEE);
        if (dto.getRessourceId() != null) {
            Ressource r = ressourceRepository.findById(dto.getRessourceId())
                    .orElseThrow(() -> new RuntimeException("Ressource introuvable"));
            d.setRessource(r);
        }
        return versDto(demandeInterventionRepository.save(d));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DemandeInterventionDTO> listerPourUtilisateurConnecte() {
        Long uid = SecurityUtils.requireUserId();
        String role = SecurityUtils.primaryRole().orElse("");
        if ("FOURNISSEUR".equals(role)) {
            return demandeInterventionRepository.findByFournisseur_IdOrderByDateDemandeDesc(uid).stream()
                    .map(this::versDto)
                    .collect(Collectors.toList());
        }
        if ("RESPONSABLE".equals(role)) {
            return demandeInterventionRepository.findByResponsable_IdOrderByDateDemandeDesc(uid).stream()
                    .map(this::versDto)
                    .collect(Collectors.toList());
        }
        throw new RuntimeException("Rôle non autorisé pour consulter les demandes d'intervention");
    }

    @Override
    @Transactional(readOnly = true)
    public DemandeInterventionDTO getById(Long id) {
        DemandeIntervention d = demandeInterventionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));
        assertAccessible(d);
        return versDto(d);
    }

    @Override
    @Transactional
    public DemandeInterventionDTO changerStatut(Long id, String nouveauStatut) {
        if (nouveauStatut == null || nouveauStatut.isBlank()) {
            throw new RuntimeException("Statut requis");
        }
        String statut = nouveauStatut.trim().toUpperCase();
        DemandeIntervention d = demandeInterventionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));
        Long uid = SecurityUtils.requireUserId();
        String role = SecurityUtils.primaryRole().orElse("");

        if ("FOURNISSEUR".equals(role)) {
            if (!d.getFournisseur().getId().equals(uid)) {
                throw new RuntimeException("Accès refusé à cette demande");
            }
            if (DemandeIntervention.STATUT_ACCEPTEE.equals(statut)
                    || DemandeIntervention.STATUT_REFUSEE.equals(statut)) {
                if (!DemandeIntervention.STATUT_ENVOYEE.equals(d.getStatut())) {
                    throw new RuntimeException("La demande n'est plus modifiable par le fournisseur");
                }
                d.setStatut(statut);
                return versDto(demandeInterventionRepository.save(d));
            }
            throw new RuntimeException("Statut non autorisé pour le fournisseur (ACCEPTEE ou REFUSEE)");
        }

        if ("RESPONSABLE".equals(role)) {
            if (!d.getResponsable().getId().equals(uid)) {
                throw new RuntimeException("Accès refusé à cette demande");
            }
            if (DemandeIntervention.STATUT_TERMINEE.equals(statut)
                    || DemandeIntervention.STATUT_ANNULEE.equals(statut)) {
                d.setStatut(statut);
                return versDto(demandeInterventionRepository.save(d));
            }
            throw new RuntimeException("Statut non autorisé pour le responsable (TERMINEE ou ANNULEE)");
        }

        throw new RuntimeException("Rôle non autorisé pour modifier le statut");
    }

    private void assertAccessible(DemandeIntervention d) {
        Long uid = SecurityUtils.requireUserId();
        String role = SecurityUtils.primaryRole().orElse("");
        if ("FOURNISSEUR".equals(role) && !d.getFournisseur().getId().equals(uid)) {
            throw new RuntimeException("Accès refusé à cette demande");
        }
        if ("RESPONSABLE".equals(role) && !d.getResponsable().getId().equals(uid)) {
            throw new RuntimeException("Accès refusé à cette demande");
        }
        if (!"FOURNISSEUR".equals(role) && !"RESPONSABLE".equals(role)) {
            throw new RuntimeException("Rôle non autorisé");
        }
    }

    private DemandeInterventionDTO versDto(DemandeIntervention d) {
        DemandeInterventionDTO dto = new DemandeInterventionDTO();
        dto.setId(d.getId());
        dto.setResponsableId(d.getResponsable().getId());
        dto.setFournisseurId(d.getFournisseur().getId());
        if (d.getRessource() != null) {
            dto.setRessourceId(d.getRessource().getId());
        }
        dto.setObjet(d.getObjet());
        dto.setDescription(d.getDescription());
        dto.setDateDemande(d.getDateDemande());
        dto.setStatut(d.getStatut());
        return dto;
    }
}
