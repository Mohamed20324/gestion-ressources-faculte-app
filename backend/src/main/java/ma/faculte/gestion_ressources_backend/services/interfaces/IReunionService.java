package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.departement.ReunionDTO;

import java.util.List;

public interface IReunionService {

    ReunionDTO creerReunion(ReunionDTO dto);

    ReunionDTO demarrerReunion(Long id);

    ReunionDTO validerReunion(Long id);

    List<ReunionDTO> getByDepartement(Long departementId);
}
