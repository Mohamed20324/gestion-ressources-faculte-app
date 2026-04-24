package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.inventaire.RessourceDTO;

import java.util.List;

public interface IRessourceService {

    List<RessourceDTO> lister();

    RessourceDTO getById(Long id);

    RessourceDTO creer(RessourceDTO dto);

    RessourceDTO modifier(Long id, RessourceDTO dto);

    void supprimer(Long id);

    List<RessourceDTO> listerParStatut(String statut);

    RessourceDTO modifierStatut(Long id, String statut);

    List<RessourceDTO> listerParDepartement(Long departementId);
    List<RessourceDTO> listerParOffre(Long offreId);
    void supprimerParOffre(Long offreId);
}
