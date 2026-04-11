package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.TypeRessourceDTO;
import ma.faculte.gestion_ressources_backend.entities.referentiel.TypeRessource;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.ITypeRessourceRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.ITypeRessourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TypeRessourceServiceImpl implements ITypeRessourceService {

    @Autowired
    private ITypeRessourceRepository typeRessourceRepository;

    @Override
    public TypeRessourceDTO creerType(TypeRessourceDTO dto) {

        if (typeRessourceRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException(
                    "Type déjà existant : " + dto.getCode());
        }

        TypeRessource type = new TypeRessource(
                dto.getCode(),
                dto.getLibelle(),
                dto.isEstStandard()
        );

        typeRessourceRepository.save(type);
        return convertirEnDTO(type);
    }

    @Override
    public List<TypeRessourceDTO> getAll() {
        return typeRessourceRepository.findAll()
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TypeRessourceDTO> getActifs() {
        return typeRessourceRepository.findByActif(true)
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TypeRessourceDTO getByCode(String code) {
        TypeRessource type = typeRessourceRepository
                .findByCode(code)
                .orElseThrow(() -> new RuntimeException(
                        "Type non trouvé : " + code));
        return convertirEnDTO(type);
    }

    private TypeRessourceDTO convertirEnDTO(TypeRessource t) {
        TypeRessourceDTO dto = new TypeRessourceDTO();
        dto.setId(t.getId());
        dto.setCode(t.getCode());
        dto.setLibelle(t.getLibelle());
        dto.setEstStandard(t.isEstStandard());
        dto.setActif(t.isActif());
        return dto;
    }
}