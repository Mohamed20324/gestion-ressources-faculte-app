package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.maintenance.ConstatDTO;
import java.util.List;

public interface IConstatService {

    ConstatDTO rediger(ConstatDTO dto);

    ConstatDTO getById(Long id);

    ConstatDTO getBySignalementId(Long signalementId);

    List<ConstatDTO> getAll();

    ConstatDTO envoyerAuFournisseur(Long constatId);

    ConstatDTO demanderEchange(Long constatId);
}
