package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.maintenance.ConstatDTO;

public interface IConstatService {

    ConstatDTO rediger(ConstatDTO dto);

    ConstatDTO getById(Long id);

    ConstatDTO getBySignalementId(Long signalementId);
}
