package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.TypeRessourceDTO;
import java.util.List;

/*
 * INTERFACE SERVICE TYPE RESSOURCE
 *
 * LIEN MEMBRE 4 :
 * il utilisera ce service pour récupérer
 * le type d'une ressource dans l'inventaire
 */

public interface ITypeRessourceService {

    TypeRessourceDTO creerType(TypeRessourceDTO dto);
    List<TypeRessourceDTO> getAll();
    List<TypeRessourceDTO> getActifs();
    TypeRessourceDTO getByCode(String code);
}