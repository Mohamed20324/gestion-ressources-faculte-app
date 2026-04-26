package ma.faculte.gestion_ressources_backend.services.impl;

import ma.faculte.gestion_ressources_backend.dto.inventaire.RessourceDTO;
import ma.faculte.gestion_ressources_backend.entities.appel_offre.Offre;
import ma.faculte.gestion_ressources_backend.entities.inventaire.Ressource;
import ma.faculte.gestion_ressources_backend.entities.inventaire.RessourceImprimante;
import ma.faculte.gestion_ressources_backend.entities.inventaire.RessourceOrdinateur;
import ma.faculte.gestion_ressources_backend.entities.referentiel.TypeRessource;
import ma.faculte.gestion_ressources_backend.entities.utilisateurs.Fournisseur;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IAffectationRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IDepartementRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IFournisseurRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IOffreRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IRessourceRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.ITypeRessourceRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.IRessourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RessourceServiceImpl implements IRessourceService {

    @Autowired
    private IRessourceRepository ressourceRepository;

    @Autowired
    private ITypeRessourceRepository typeRessourceRepository;

    @Autowired
    private IFournisseurRepository fournisseurRepository;

    @Autowired
    private IOffreRepository offreRepository;

    @Autowired
    private IAffectationRepository affectationRepository;

    @Autowired
    private IDepartementRepository departementRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RessourceDTO> lister() {
        return ressourceRepository.findAll().stream().map(this::versDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RessourceDTO getById(Long id) {
        Ressource r = ressourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ressource introuvable : " + id));
        return versDto(r);
    }

    @Override
    @Transactional
    public RessourceDTO creer(RessourceDTO dto) {
        if (dto.getNumeroInventaire() == null || dto.getNumeroInventaire().isBlank()) {
            throw new RuntimeException("Le numéro d'inventaire est obligatoire");
        }
        ressourceRepository.findByNumeroInventaire(dto.getNumeroInventaire().trim()).ifPresent(r -> {
            throw new RuntimeException("Numéro d'inventaire déjà utilisé");
        });
        TypeRessource type = typeRessourceRepository.findById(dto.getTypeRessourceId())
                .orElseThrow(() -> new RuntimeException("Type de ressource introuvable"));

        Ressource r = instancier(dto);
        r.setNumeroInventaire(dto.getNumeroInventaire().trim());
        r.setCodeBarres(dto.getCodeBarres());
        r.setMarque(dto.getMarque());
        r.setTypeRessource(type);
        r.setDateReception(dto.getDateReception() != null ? dto.getDateReception() : LocalDate.now());
        r.setDateFinGarantie(dto.getDateFinGarantie());
        r.setStatut(dto.getStatut() != null ? dto.getStatut() : Ressource.STATUT_DISPONIBLE);

        if (dto.getFournisseurId() != null) {
            Fournisseur f = fournisseurRepository.findById(dto.getFournisseurId())
                    .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));
            r.setFournisseur(f);
        }
        if (dto.getOffreOrigineId() != null) {
            Offre o = offreRepository.findById(dto.getOffreOrigineId())
                    .orElseThrow(() -> new RuntimeException("Offre introuvable"));
            r.setOffreOrigine(o);
        }
        if (dto.getDepartementId() != null) {
            r.setDepartement(departementRepository.findById(dto.getDepartementId())
                    .orElseThrow(() -> new RuntimeException("Département introuvable")));
        }

        // Handle requester department if provided
        if (dto.getDepartementDemandeurNom() != null) {
            // Find by name or ID if needed, but usually we just set it from the need process
            // For now, let's assume we might have an ID in a real scenario
        }

        return versDto(ressourceRepository.save(r));
    }

    @Override
    @Transactional
    public RessourceDTO modifier(Long id, RessourceDTO dto) {
        Ressource r = ressourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ressource introuvable : " + id));
        if (dto.getNumeroInventaire() != null && !dto.getNumeroInventaire().isBlank()) {
            String n = dto.getNumeroInventaire().trim();
            ressourceRepository.findByNumeroInventaire(n).ifPresent(other -> {
                if (!other.getId().equals(id)) {
                    throw new RuntimeException("Numéro d'inventaire déjà utilisé");
                }
            });
            r.setNumeroInventaire(n);
        }
        if (dto.getCodeBarres() != null) {
            r.setCodeBarres(dto.getCodeBarres());
        }
        if (dto.getMarque() != null) {
            r.setMarque(dto.getMarque());
        }
        if (dto.getTypeRessourceId() != null) {
            TypeRessource type = typeRessourceRepository.findById(dto.getTypeRessourceId())
                    .orElseThrow(() -> new RuntimeException("Type de ressource introuvable"));
            r.setTypeRessource(type);
        }
        if (dto.getDateReception() != null) {
            r.setDateReception(dto.getDateReception());
        }
        if (dto.getDateFinGarantie() != null) {
            r.setDateFinGarantie(dto.getDateFinGarantie());
        }
        if (dto.getFournisseurId() != null) {
            Fournisseur f = fournisseurRepository.findById(dto.getFournisseurId())
                    .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));
            r.setFournisseur(f);
        }
        if (dto.getOffreOrigineId() != null) {
            Offre o = offreRepository.findById(dto.getOffreOrigineId())
                    .orElseThrow(() -> new RuntimeException("Offre introuvable"));
            r.setOffreOrigine(o);
        }
        if (dto.getStatut() != null) {
            r.setStatut(dto.getStatut());
        }
        if (dto.getDepartementId() != null) {
            r.setDepartement(departementRepository.findById(dto.getDepartementId())
                    .orElseThrow(() -> new RuntimeException("Département introuvable")));
        }
        if (r instanceof RessourceOrdinateur ro) {
            if (dto.getCpu() != null) {
                ro.setCpu(dto.getCpu());
            }
            if (dto.getRam() != null) {
                ro.setRam(dto.getRam());
            }
            if (dto.getDisqueDur() != null) {
                ro.setDisqueDur(dto.getDisqueDur());
            }
            if (dto.getEcran() != null) {
                ro.setEcran(dto.getEcran());
            }
        } else if (r instanceof RessourceImprimante ri) {
            if (dto.getVitesseImpression() != null) {
                ri.setVitesseImpression(dto.getVitesseImpression());
            }
            if (dto.getResolution() != null) {
                ri.setResolution(dto.getResolution());
            }
        }
        return versDto(ressourceRepository.save(r));
    }

    @Override
    @Transactional
    public void supprimer(Long id) {
        Ressource r = ressourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ressource introuvable"));
        if (affectationRepository.findByRessource_Id(id).isPresent()) {
            throw new RuntimeException("Impossible de supprimer : ressource affectée");
        }
        if (!Ressource.STATUT_DISPONIBLE.equals(r.getStatut())
                && !Ressource.STATUT_REFORME.equals(r.getStatut())) {
            throw new RuntimeException("Suppression autorisée seulement pour ressource DISPONIBLE ou REFORME");
        }
        ressourceRepository.delete(r);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RessourceDTO> listerParStatut(String statut) {
        return ressourceRepository.findByStatut(statut).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RessourceDTO modifierStatut(Long id, String statut) {
        Ressource r = ressourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ressource introuvable"));
        r.setStatut(statut);
        return versDto(ressourceRepository.save(r));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RessourceDTO> listerParDepartement(Long departementId) {
        // Find resources directly linked to department
        List<Ressource> directlyLinked = ressourceRepository.findByDepartement_Id(departementId);
        
        // Find resources linked via affectations (to handle legacy data or double-linkage)
        List<Ressource> linkedViaAffectation = affectationRepository.findByDepartement_Id(departementId)
                .stream()
                .map(ma.faculte.gestion_ressources_backend.entities.inventaire.Affectation::getRessource)
                .collect(Collectors.toList());
        
        // Merge and convert to DTO
        java.util.Set<Long> ids = new java.util.HashSet<>();
        List<RessourceDTO> results = new java.util.ArrayList<>();
        
        directlyLinked.forEach(r -> {
            if (ids.add(r.getId())) results.add(versDto(r));
        });
        
        linkedViaAffectation.forEach(r -> {
            if (ids.add(r.getId())) results.add(versDto(r));
        });
        
        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RessourceDTO> listerParOffre(Long offreId) {
        return ressourceRepository.findByOffreOrigine_Id(offreId).stream()
                .map(this::versDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void supprimerParOffre(Long offreId) {
        List<Ressource> ressources = ressourceRepository.findByOffreOrigine_Id(offreId);
        for (Ressource r : ressources) {
            // Check if affected
            if (affectationRepository.findByRessource_Id(r.getId()).isPresent()) {
                throw new RuntimeException("Impossible d'annuler : La ressource " + r.getNumeroInventaire() + " est déjà affectée.");
            }
            ressourceRepository.delete(r);
        }
    }

    private Ressource instancier(RessourceDTO dto) {
        String cat = dto.getCategorie() != null ? dto.getCategorie().trim() : "STANDARD";
        if ("ORDINATEUR".equalsIgnoreCase(cat)) {
            RessourceOrdinateur ro = new RessourceOrdinateur();
            ro.setCpu(dto.getCpu());
            ro.setRam(dto.getRam());
            ro.setDisqueDur(dto.getDisqueDur());
            ro.setEcran(dto.getEcran());
            return ro;
        }
        if ("IMPRIMANTE".equalsIgnoreCase(cat)) {
            RessourceImprimante ri = new RessourceImprimante();
            ri.setVitesseImpression(dto.getVitesseImpression());
            ri.setResolution(dto.getResolution());
            return ri;
        }
        return new Ressource();
    }

    private RessourceDTO versDto(Ressource r) {
        RessourceDTO d = new RessourceDTO();
        d.setId(r.getId());
        d.setNumeroInventaire(r.getNumeroInventaire());
        d.setCodeBarres(r.getCodeBarres());
        d.setMarque(r.getMarque());
        d.setTypeRessourceId(r.getTypeRessource().getId());
        if (r.getFournisseur() != null) {
            d.setFournisseurId(r.getFournisseur().getId());
            d.setFournisseurNom(r.getFournisseur().getNomSociete() != null ? r.getFournisseur().getNomSociete() : r.getFournisseur().getNom());
        }
        if (r.getOffreOrigine() != null) {
            d.setOffreOrigineId(r.getOffreOrigine().getId());
        }
        if (r.getDepartement() != null) {
            d.setDepartementId(r.getDepartement().getId());
        }
        if (r.getDepartementDemandeur() != null) {
            d.setDepartementDemandeurNom(r.getDepartementDemandeur().getNom());
        }
        if (r.getEnseignantDemandeur() != null) {
            d.setEnseignantDemandeurNom(r.getEnseignantDemandeur().getNom() + " " + r.getEnseignantDemandeur().getPrenom());
        }
        d.setDateReception(r.getDateReception());
        d.setDateFinGarantie(r.getDateFinGarantie());
        d.setStatut(r.getStatut());
        if (r instanceof RessourceOrdinateur ro) {
            d.setCategorie("ORDINATEUR");
            d.setCpu(ro.getCpu());
            d.setRam(ro.getRam());
            d.setDisqueDur(ro.getDisqueDur());
            d.setEcran(ro.getEcran());
        } else if (r instanceof RessourceImprimante ri) {
            d.setCategorie("IMPRIMANTE");
            d.setVitesseImpression(ri.getVitesseImpression());
            d.setResolution(ri.getResolution());
        } else {
            d.setCategorie("STANDARD");
        }
        return d;
    }
}
