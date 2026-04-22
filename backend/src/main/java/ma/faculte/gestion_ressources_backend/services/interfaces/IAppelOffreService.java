package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.AppelOffreDTO;

import java.util.List;

public interface IAppelOffreService {

    AppelOffreDTO creerAppelOffre(AppelOffreDTO dto);

    AppelOffreDTO ajouterBesoins(Long id, List<Long> besoinIds);

    AppelOffreDTO cloturerAppelOffre(Long id);

    AppelOffreDTO getById(Long id);

    List<AppelOffreDTO> getAllOuverts();
    List<AppelOffreDTO> getAll();
    AppelOffreDTO publierAppelOffre(Long id);
    void supprimerAppelOffre(Long id);
    AppelOffreDTO retirerBesoin(Long aoId, Long besoinId);
}
