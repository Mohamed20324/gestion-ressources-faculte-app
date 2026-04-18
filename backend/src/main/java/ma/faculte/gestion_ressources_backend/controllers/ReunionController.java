package ma.faculte.gestion_ressources_backend.controllers;

import ma.faculte.gestion_ressources_backend.dto.departement.ReunionDTO;
import ma.faculte.gestion_ressources_backend.services.interfaces.IReunionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reunion")
@CrossOrigin("*")
public class ReunionController {

    @Autowired
    private IReunionService reunionService;

    @GetMapping
    public List<ReunionDTO> getAll() {
        return reunionService.listerToutesLesReunions();
    }

    @PostMapping("/creer")
    public ReunionDTO creer(@RequestBody ReunionDTO dto) {
        return reunionService.creerReunion(dto);
    }

    @PutMapping("/{id}")
    public ReunionDTO update(@PathVariable Long id, @RequestBody ReunionDTO dto) {
        return reunionService.modifierReunion(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        reunionService.supprimerReunion(id);
    }

    @PutMapping("/demarrer/{id}")
    public ReunionDTO demarrer(@PathVariable Long id) {
        return reunionService.demarrerReunion(id);
    }

    @PutMapping("/valider/{id}")
    public ReunionDTO valider(@PathVariable Long id) {
        return reunionService.validerReunion(id);
    }

    @GetMapping("/departement/{id}")
    public List<ReunionDTO> getByDept(@PathVariable Long id) {
        return reunionService.getByDepartement(id);
    }
}
