package ma.faculte.gestion_ressources_backend.services.interfaces;

import ma.faculte.gestion_ressources_backend.dto.appel_offre.ListeNoireDTO;

import java.util.List;

public interface IListeNoireService {

    ListeNoireDTO ajouterFournisseur(Long fournisseurId, String motif);

    boolean estListeNoire(Long fournisseurId);

    List<ListeNoireDTO> getAll();
}
