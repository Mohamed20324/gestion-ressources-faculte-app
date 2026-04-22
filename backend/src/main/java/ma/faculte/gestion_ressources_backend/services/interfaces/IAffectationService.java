package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.inventaire.AffectationDTO;

import java.util.List;

public interface IAffectationService {

    AffectationDTO affecter(AffectationDTO dto);

    List<AffectationDTO> listerParDepartement(Long departementId);

    AffectationDTO getByRessource(Long ressourceId);

    void retirerAffectation(Long affectationId);

    List<AffectationDTO> listerParEnseignant(Long enseignantId);
}
