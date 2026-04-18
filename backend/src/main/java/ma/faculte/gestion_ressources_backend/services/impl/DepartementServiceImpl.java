package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.departement.DepartementDTO;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.*;
import ma.faculte.gestion_ressources_backend.services.interfaces.IDepartementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartementServiceImpl implements IDepartementService {

    @Autowired
    private IDepartementRepository departementRepository;

    @Autowired
    private IEnseignantRepository enseignantRepository;

    @Autowired
    private IChefDepartementRepository chefRepository;

    @Autowired
    private IAffectationRepository affectationRepository;

    @Autowired
    private IReunionRepository reunionRepository;

    @Autowired
    private IBesoinRessourceRepository besoinRepository;

    @Override
    public DepartementDTO creerDepartement(DepartementDTO dto) {

        if (departementRepository.existsByNom(dto.getNom())) {
            throw new RuntimeException(
                    "Département déjà existant : " + dto.getNom());
        }

        Departement departement = new Departement(dto.getNom(), dto.getBudget());
        departementRepository.save(departement);
        return convertirEnDTO(departement);
    }

    @Override
    @Transactional
    public DepartementDTO modifierDepartement(Long id, DepartementDTO dto) {

        Departement departement = departementRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Département non trouvé : " + id));

        if (dto.getNom() != null) departement.setNom(dto.getNom());
        if (dto.getBudget() != null) departement.setBudget(dto.getBudget());

        // Gestion de l'affectation du chef
        if (dto.getChefId() != null) {
            // 1. Désaffecter l'ancien chef de ce département (si existant)
            chefRepository.findByDepartementGereId(id).ifPresent(ancienChef -> {
                ancienChef.setDepartementGere(null);
                chefRepository.save(ancienChef);
            });

            // 2. Si le nouveau chef gérait un autre département → le libérer
            var nouveauChef = chefRepository.findById(dto.getChefId())
                    .orElseThrow(() -> new RuntimeException(
                            "Chef non trouvé : " + dto.getChefId()));

            if (nouveauChef.getDepartementGere() != null
                    && !nouveauChef.getDepartementGere().getId().equals(id)) {
                nouveauChef.setDepartementGere(null);
                chefRepository.save(nouveauChef);
            }

            // 3. Affecter le nouveau chef à ce département
            nouveauChef.setDepartementGere(departement);
            chefRepository.save(nouveauChef);
        }

        departementRepository.save(departement);
        return convertirEnDTO(id);
    }

    @Override
    public DepartementDTO getById(Long id) {

        Departement departement = departementRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Département non trouvé : " + id));

        return convertirEnDTO(departement);
    }

    @Override
    public List<DepartementDTO> getAll() {
        return departementRepository.findAll()
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void supprimerDepartement(Long id) {
        Departement departement = departementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Département non trouvé : " + id));

        // 1. Libérer les enseignants (relation nullable)
        enseignantRepository.findByDepartementId(id).forEach(e -> {
            e.setDepartement(null);
            enseignantRepository.save(e);
        });

        // 2. Libérer le chef (relation nullable)
        chefRepository.findByDepartementGereId(id).ifPresent(chef -> {
            chef.setDepartementGere(null);
            chefRepository.save(chef);
        });

        // 3. Libérer les affectations (relation rendue nullable)
        affectationRepository.findByDepartement_Id(id).forEach(a -> {
            a.setDepartement(null);
            affectationRepository.save(a);
        });

        // 4. Libérer les réunions (relation rendue nullable)
        reunionRepository.findByDepartementId(id).forEach(r -> {
            r.setDepartement(null);
            reunionRepository.save(r);
        });

        // 5. Libérer les besoins (relation rendue nullable)
        besoinRepository.findByDepartementId(id).forEach(b -> {
            b.setDepartement(null);
            besoinRepository.save(b);
        });

        // Enfin, supprimer le département
        departementRepository.delete(departement);
    }

    private DepartementDTO convertirEnDTO(Long departementId) {
        Departement d = departementRepository.findById(departementId)
                .orElseThrow(() -> new RuntimeException("Département non trouvé : " + departementId));
        return convertirEnDTO(d);
    }

    private DepartementDTO convertirEnDTO(Departement d) {
        DepartementDTO dto = new DepartementDTO();
        dto.setId(d.getId());
        dto.setNom(d.getNom());
        dto.setBudget(d.getBudget());

        // Chercher le chef via chefRepository (sens unique, FK côté chef)
        chefRepository.findByDepartementGereId(d.getId()).ifPresent(chef -> {
            dto.setChefId(chef.getId());
            dto.setNomChef(chef.getNom() + " " + chef.getPrenom());
        });

        return dto;
    }
}