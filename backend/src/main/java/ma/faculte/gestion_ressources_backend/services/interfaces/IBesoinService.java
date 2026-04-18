package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.departement.besoins.BesoinRessourceDTO;

import java.util.List;

public interface IBesoinService {

    BesoinRessourceDTO soumettreBesoins(BesoinRessourceDTO dto);

    BesoinRessourceDTO modifierBesoin(Long id, BesoinRessourceDTO dto);

    void supprimerBesoin(Long id);

    List<BesoinRessourceDTO> getBesoinsByDepartement(Long departementId);

    List<BesoinRessourceDTO> getBesoinsByStatut(String statut);

    List<BesoinRessourceDTO> getBesoinsByEnseignant(Long enseignantId);
    List<BesoinRessourceDTO> getAllBesoins();
}
