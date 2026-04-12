package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.OffreDTO;

import java.util.List;

public interface IOffreService {

    OffreDTO soumettreOffre(OffreDTO dto);

    OffreDTO accepterOffre(Long id);

    OffreDTO rejeterOffre(Long id, String motif);

    OffreDTO eliminerOffre(Long id, String motif);

    List<OffreDTO> getMoinsDisant(Long appelOffreId);

    List<OffreDTO> getOffresByAppelOffre(Long appelOffreId);
}
