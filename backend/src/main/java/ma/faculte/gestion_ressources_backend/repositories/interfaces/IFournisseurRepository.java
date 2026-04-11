package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/*
 * REPOSITORY FOURNISSEUR
 *
 * UTILISÉ PAR :
 * - UtilisateurServiceImpl (inscription, compléter infos)
 * - ListeNoireServiceImpl (blacklister)
 * - OffreServiceImpl (vérifier liste noire)
 *
 * LIEN MEMBRE 4 :
 * il utilisera ce repository dans
 * DemandeInterventionServiceImpl
 */

@Repository
public interface IFournisseurRepository
        extends JpaRepository<Fournisseur, Long> {

    /*
     * récupérer fournisseurs blacklistés ou non
     */
    List<Fournisseur> findByEstListeNoire(boolean estListeNoire);

    Optional<Fournisseur> findByNomSociete(String nomSociete);

    boolean existsByNomSociete(String nomSociete);
}