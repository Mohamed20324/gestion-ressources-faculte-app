package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.intervention.DemandeInterventionDTO;

import java.util.List;

public interface IDemandeInterventionService {

    DemandeInterventionDTO creer(DemandeInterventionDTO dto);

    List<DemandeInterventionDTO> listerPourUtilisateurConnecte();

    DemandeInterventionDTO getById(Long id);

    DemandeInterventionDTO changerStatut(Long id, String nouveauStatut);
}
