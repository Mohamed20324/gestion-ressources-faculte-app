package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.inventaire.AffectationDTO;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.entities.inventaire.Affectation;
import ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Enseignant;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IAffectationRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IDepartementRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IEnseignantRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IRessourceRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.IAffectationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AffectationServiceImpl implements IAffectationService {

    @Autowired
    private IAffectationRepository affectationRepository;

    @Autowired
    private IRessourceRepository ressourceRepository;

    @Autowired
    private IDepartementRepository departementRepository;

    @Autowired
    private IEnseignantRepository enseignantRepository;

    @Override
    @Transactional
    public AffectationDTO affecter(AffectationDTO dto) {
        Ressource r = ressourceRepository.findById(dto.getRessourceId())
                .orElseThrow(() -> new RuntimeException("Ressource introuvable"));
        if (!Ressource.STATUT_DISPONIBLE.equals(r.getStatut())) {
            throw new RuntimeException("La ressource n'est pas disponible pour affectation");
        }
        affectationRepository.findByRessource_Id(r.getId()).ifPresent(a -> {
            throw new RuntimeException("Cette ressource est déjà affectée");
        });
        Departement dep = departementRepository.findById(dto.getDepartementId())
                .orElseThrow(() -> new RuntimeException("Département introuvable"));
        if (!dto.isAffectationCollective() && dto.getEnseignantId() == null) {
            throw new RuntimeException("Enseignant requis pour une affectation individuelle");
        }
        Enseignant ens = null;
        if (dto.getEnseignantId() != null) {
            ens = enseignantRepository.findById(dto.getEnseignantId())
                    .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));
        }
        Affectation a = new Affectation();
        a.setRessource(r);
        a.setDepartement(dep);
        a.setEnseignant(ens);
        a.setAffectationCollective(dto.isAffectationCollective());
        a.setDateAffectation(dto.getDateAffectation() != null ? dto.getDateAffectation() : LocalDate.now());
        r.setStatut(Ressource.STATUT_AFFECTEE);
        ressourceRepository.save(r);
        return versDto(affectationRepository.save(a));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AffectationDTO> listerParDepartement(Long departementId) {
        return affectationRepository.findByDepartement_Id(departementId).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AffectationDTO getByRessource(Long ressourceId) {
        Affectation a = affectationRepository.findByRessource_Id(ressourceId)
                .orElseThrow(() -> new RuntimeException("Aucune affectation pour cette ressource"));
        return versDto(a);
    }

    @Override
    @Transactional
    public void retirerAffectation(Long affectationId) {
        Affectation a = affectationRepository.findById(affectationId)
                .orElseThrow(() -> new RuntimeException("Affectation introuvable"));
        Ressource r = a.getRessource();
        r.setStatut(Ressource.STATUT_DISPONIBLE);
        ressourceRepository.save(r);
        affectationRepository.delete(a);
    }

    private AffectationDTO versDto(Affectation a) {
        AffectationDTO d = new AffectationDTO();
        d.setId(a.getId());
        d.setRessourceId(a.getRessource().getId());
        d.setDepartementId(a.getDepartement().getId());
        if (a.getEnseignant() != null) {
            d.setEnseignantId(a.getEnseignant().getId());
        }
        d.setAffectationCollective(a.isAffectationCollective());
        d.setDateAffectation(a.getDateAffectation());
        return d;
    }
}
