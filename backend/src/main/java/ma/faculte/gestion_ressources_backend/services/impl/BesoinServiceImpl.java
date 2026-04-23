package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.departement.besoins.BesoinRessourceDTO;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinImprimante;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinOrdinateur;
import ma.faculte.gestion_ressources_backend.entities.besoins.BesoinRessource;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.entities.departement.Reunion;
import ma.faculte.gestion_ressources_backend.entities.referentiel.TypeRessource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Enseignant;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IBesoinRessourceRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IDepartementRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IEnseignantRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IReunionRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.ITypeRessourceRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.IBesoinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BesoinServiceImpl implements IBesoinService {

    @Autowired
    private IBesoinRessourceRepository besoinRessourceRepository;

    @Autowired
    private ITypeRessourceRepository typeRessourceRepository;

    @Autowired
    private IDepartementRepository departementRepository;

    @Autowired
    private IReunionRepository reunionRepository;

    @Autowired
    private IEnseignantRepository enseignantRepository;

    @Override
    @Transactional
    public BesoinRessourceDTO soumettreBesoins(BesoinRessourceDTO dto) {
        TypeRessource type = typeRessourceRepository.findById(dto.getTypeRessourceId())
                .orElseThrow(() -> new RuntimeException("Type de ressource introuvable"));
        Departement dep = departementRepository.findById(dto.getDepartementId())
                .orElseThrow(() -> new RuntimeException("Département introuvable"));
        Reunion reunion = reunionRepository.findById(dto.getReunionId())
                .orElseThrow(() -> new RuntimeException("Réunion introuvable"));

        BesoinRessource b = instancierBesoin(dto);
        b.setTypeRessource(type);
        b.setQuantite(dto.getQuantite());
        b.setDescription(dto.getDescription());
        b.setDescriptionTechnique(dto.getDescriptionTechnique());
        b.setStatut(dto.getStatut() != null ? dto.getStatut() : BesoinRessource.STATUT_EN_ATTENTE);
        b.setEstCollectif(dto.isEstCollectif());
        b.setDepartement(dep);
        b.setReunion(reunion);
        if (dto.getEnseignantId() != null) {
            Enseignant ens = enseignantRepository.findById(dto.getEnseignantId())
                    .orElseThrow(() -> new RuntimeException("Enseignant introuvable"));
            b.setEnseignant(ens);
        }
        return versDto(besoinRessourceRepository.save(b));
    }

    private BesoinRessource instancierBesoin(BesoinRessourceDTO dto) {
        String cat = dto.getCategorie() != null ? dto.getCategorie().trim() : "STANDARD";
        if ("ORDINATEUR".equalsIgnoreCase(cat)) {
            BesoinOrdinateur bo = new BesoinOrdinateur();
            bo.setCpu(dto.getCpu());
            bo.setRam(dto.getRam());
            bo.setDisqueDur(dto.getDisqueDur());
            bo.setEcran(dto.getEcran());
            bo.setMarque(dto.getMarque());
            return bo;
        }
        if ("IMPRIMANTE".equalsIgnoreCase(cat)) {
            BesoinImprimante bi = new BesoinImprimante();
            bi.setVitesseImpression(dto.getVitesseImpression());
            bi.setResolution(dto.getResolution());
            bi.setMarque(dto.getMarque());
            return bi;
        }
        return new BesoinRessource();
    }

    @Override
    @Transactional
    public BesoinRessourceDTO modifierBesoin(Long id, BesoinRessourceDTO dto) {
        BesoinRessource b = besoinRessourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Besoin introuvable"));
        if (!Reunion.STATUT_EN_COURS.equals(b.getReunion().getStatut())) {
            throw new RuntimeException("Modification impossible : la réunion n'est pas EN_COURS");
        }
        if (dto.getQuantite() > 0) {
            b.setQuantite(dto.getQuantite());
        }
        if (dto.getDescription() != null) {
            b.setDescription(dto.getDescription());
        }
        if (dto.getDescriptionTechnique() != null) {
            b.setDescriptionTechnique(dto.getDescriptionTechnique());
        }
        if (dto.getStatut() != null) {
            b.setStatut(dto.getStatut());
        }
        if (dto.getTypeRessourceId() != null) {
            TypeRessource type = typeRessourceRepository.findById(dto.getTypeRessourceId())
                    .orElseThrow(() -> new RuntimeException("Type de ressource introuvable"));
            b.setTypeRessource(type);
        }
        if (b instanceof BesoinOrdinateur bo) {
            if (dto.getCpu() != null) {
                bo.setCpu(dto.getCpu());
            }
            if (dto.getRam() != null) {
                bo.setRam(dto.getRam());
            }
            if (dto.getDisqueDur() != null) {
                bo.setDisqueDur(dto.getDisqueDur());
            }
            if (dto.getEcran() != null) {
                bo.setEcran(dto.getEcran());
            }
            if (dto.getMarque() != null) {
                bo.setMarque(dto.getMarque());
            }
        } else if (b instanceof BesoinImprimante bi) {
            if (dto.getVitesseImpression() > 0) {
                bi.setVitesseImpression(dto.getVitesseImpression());
            }
            if (dto.getResolution() != null) {
                bi.setResolution(dto.getResolution());
            }
            if (dto.getMarque() != null) {
                bi.setMarque(dto.getMarque());
            }
        }
        return versDto(besoinRessourceRepository.save(b));
    }

    @Override
    @Transactional
    public void supprimerBesoin(Long id) {
        if (!besoinRessourceRepository.existsById(id)) {
            throw new RuntimeException("Besoin introuvable");
        }
        besoinRessourceRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BesoinRessourceDTO> getBesoinsByDepartement(Long departementId) {
        return besoinRessourceRepository.findByDepartementId(departementId).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BesoinRessourceDTO> getBesoinsByStatut(String statut) {
        return besoinRessourceRepository.findByStatut(statut).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BesoinRessourceDTO> getBesoinsByEnseignant(Long enseignantId) {
        return besoinRessourceRepository.findByEnseignantId(enseignantId).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BesoinRessourceDTO> getAllBesoins() {
        return besoinRessourceRepository.findAll().stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    private BesoinRessourceDTO versDto(BesoinRessource b) {
        BesoinRessourceDTO d = new BesoinRessourceDTO();
        d.setId(b.getId());
        d.setTypeRessourceId(b.getTypeRessource().getId());
        d.setQuantite(b.getQuantite());
        d.setDescription(b.getDescription());
        d.setDescriptionTechnique(b.getDescriptionTechnique());
        d.setStatut(b.getStatut());
        d.setEstCollectif(b.isEstCollectif());
        if (b.getEnseignant() != null) {
            d.setEnseignantId(b.getEnseignant().getId());
        }
        d.setDepartementId(b.getDepartement().getId());
        d.setReunionId(b.getReunion().getId());
        if (b instanceof BesoinOrdinateur bo) {
            d.setCategorie("ORDINATEUR");
            d.setCpu(bo.getCpu());
            d.setRam(bo.getRam());
            d.setDisqueDur(bo.getDisqueDur());
            d.setEcran(bo.getEcran());
            d.setMarque(bo.getMarque());
        } else if (b instanceof BesoinImprimante bi) {
            d.setCategorie("IMPRIMANTE");
            d.setVitesseImpression(bi.getVitesseImpression());
            d.setResolution(bi.getResolution());
            d.setMarque(bi.getMarque());
        } else {
            d.setCategorie("STANDARD");
        }

        if (b.getAppelsOffre() != null && !b.getAppelsOffre().isEmpty()) {
            d.setAppelOffreId(b.getAppelsOffre().get(0).getId());
        }

        return d;
    }
}
