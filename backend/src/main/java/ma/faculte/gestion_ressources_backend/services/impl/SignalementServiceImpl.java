package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.maintenance.SignalementPanneDTO;
import ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource;
import ma.faculte.gestion_ressources_backend.entities.maintenance.SignalementPanne;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Enseignant;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Technicien;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IAffectationRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IEnseignantRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IRessourceRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.ISignalementPanneRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.ITechnicienRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.ISignalementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SignalementServiceImpl implements ISignalementService {

    @Autowired
    private ISignalementPanneRepository signalementRepository;

    @Autowired
    private IRessourceRepository ressourceRepository;

    @Autowired
    private IEnseignantRepository enseignantRepository;

    @Autowired
    private ITechnicienRepository technicienRepository;

    @Autowired
    private IAffectationRepository affectationRepository;

    @Override
    @Transactional
    public SignalementPanneDTO creer(SignalementPanneDTO dto) {
        Ressource r = ressourceRepository.findById(dto.getRessourceId())
                .orElseThrow(() -> new RuntimeException("Ressource introuvable"));
        Enseignant ens = enseignantRepository.findById(dto.getEnseignantId())
                .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));
        SignalementPanne s = new SignalementPanne();
        s.setRessource(r);
        s.setEnseignant(ens);
        s.setDescription(dto.getDescription());
        s.setDateSignalement(dto.getDateSignalement() != null ? dto.getDateSignalement() : LocalDate.now());
        s.setStatut(SignalementPanne.STATUT_SIGNALE);
        if (dto.getTechnicienId() != null) {
            Technicien t = technicienRepository.findById(dto.getTechnicienId())
                    .orElseThrow(() -> new RuntimeException("Technicien introuvable"));
            s.setTechnicien(t);
            s.setStatut(SignalementPanne.STATUT_EN_COURS);
        }
        r.setStatut(Ressource.STATUT_MAINTENANCE);
        ressourceRepository.save(r);
        return versDto(signalementRepository.save(s));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SignalementPanneDTO> listerTous() {
        return signalementRepository.findAll().stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SignalementPanneDTO getById(Long id) {
        SignalementPanne s = signalementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        return versDto(s);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SignalementPanneDTO> listerParStatut(String statut) {
        return signalementRepository.findByStatut(statut).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SignalementPanneDTO assignerTechnicien(Long signalementId, Long technicienId) {
        SignalementPanne s = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        Technicien t = technicienRepository.findById(technicienId)
                .orElseThrow(() -> new RuntimeException("Technicien introuvable"));
        s.setTechnicien(t);
        s.setStatut(SignalementPanne.STATUT_EN_COURS);
        return versDto(signalementRepository.save(s));
    }

    @Override
    @Transactional
    public SignalementPanneDTO fermer(Long signalementId) {
        SignalementPanne s = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable"));
        s.setStatut(SignalementPanne.STATUT_FERME);
        Ressource r = s.getRessource();
        String nouveau = affectationRepository.findByRessource_Id(r.getId()).isPresent()
                ? Ressource.STATUT_AFFECTEE
                : Ressource.STATUT_DISPONIBLE;
        r.setStatut(nouveau);
        ressourceRepository.save(r);
        return versDto(signalementRepository.save(s));
    }

    private SignalementPanneDTO versDto(SignalementPanne s) {
        SignalementPanneDTO d = new SignalementPanneDTO();
        d.setId(s.getId());
        d.setRessourceId(s.getRessource().getId());
        d.setEnseignantId(s.getEnseignant().getId());
        if (s.getTechnicien() != null) {
            d.setTechnicienId(s.getTechnicien().getId());
        }
        d.setDescription(s.getDescription());
        d.setDateSignalement(s.getDateSignalement());
        d.setStatut(s.getStatut());
        return d;
    }
}
