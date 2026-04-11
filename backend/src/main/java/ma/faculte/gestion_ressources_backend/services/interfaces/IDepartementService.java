package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.departement.DepartementDTO;
import java.util.List;

/*
 * INTERFACE SERVICE DÉPARTEMENT
 */

public interface IDepartementService {

    DepartementDTO creerDepartement(DepartementDTO dto);
    DepartementDTO modifierDepartement(Long id, DepartementDTO dto);
    DepartementDTO getById(Long id);
    List<DepartementDTO> getAll();
}