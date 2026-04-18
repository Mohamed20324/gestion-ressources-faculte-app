package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.TypeRessourceDTO;
import java.util.List;

public interface ITypeRessourceService {

    TypeRessourceDTO creerType(TypeRessourceDTO dto);
    TypeRessourceDTO modifierType(Long id, TypeRessourceDTO dto);
    void supprimerType(Long id);
    List<TypeRessourceDTO> getAll();
    List<TypeRessourceDTO> getActifs();
    TypeRessourceDTO getByCode(String code);
}