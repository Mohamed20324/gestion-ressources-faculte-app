package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.departement.DepartementDTO;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IDepartementRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.IDepartementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartementServiceImpl implements IDepartementService {

    @Autowired
    private IDepartementRepository departementRepository;

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
    public DepartementDTO modifierDepartement(Long id, DepartementDTO dto) {

        Departement departement = departementRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Département non trouvé : " + id));

        if (dto.getNom() != null) departement.setNom(dto.getNom());
        if (dto.getBudget() != null) departement.setBudget(dto.getBudget());

        departementRepository.save(departement);
        return convertirEnDTO(departement);
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

    private DepartementDTO convertirEnDTO(Departement d) {
        DepartementDTO dto = new DepartementDTO();
        dto.setId(d.getId());
        dto.setNom(d.getNom());
        dto.setBudget(d.getBudget());

        /*
         * on récupère le nom du chef si existant
         * sans charger l'objet complet
         */
        if (d.getChef() != null) {
            dto.setChefId(d.getChef().getId());
            dto.setNomChef(d.getChef().getNom()
                    + " " + d.getChef().getPrenom());
        }

        return dto;
    }
}