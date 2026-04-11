package ma.faculte.gestion_ressources_backend.repositories.interfaces;

import ma.faculte.gestion_ressources_backend.entities.referentiel.TypeRessource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/*
 * REPOSITORY TYPE RESSOURCE
 *
 * UTILISÉ PAR :
 * - TypeRessourceServiceImpl
 * - BesoinServiceImpl
 * - OffreServiceImpl
 *
 * LIEN MEMBRE 4 :
 * il utilisera ce repository dans RessourceServiceImpl
 * pour typer chaque ressource de l'inventaire
 */

@Repository
public interface ITypeRessourceRepository
        extends JpaRepository<TypeRessource, Long> {

    List<TypeRessource> findByActif(boolean actif);

    Optional<TypeRessource> findByCode(String code);

    boolean existsByCode(String code);
}