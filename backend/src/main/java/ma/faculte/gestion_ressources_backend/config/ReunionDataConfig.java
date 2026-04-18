package ma.faculte.gestion_ressources_backend.config;

import ma.faculte.gestion_ressources_backend.dto.departement.ReunionDTO;
import ma.faculte.gestion_ressources_backend.entities.departement.Departement;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IChefDepartementRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IDepartementRepository;
import ma.faculte.gestion_ressources_backend.repositories.interfaces.IReunionRepository;
import ma.faculte.gestion_ressources_backend.services.interfaces.IReunionService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class ReunionDataConfig {

    @Bean
    CommandLineRunner initReunions(IReunionService reunionService, 
                                   IReunionRepository reunionRepository,
                                   IDepartementRepository departementRepository,
                                   IChefDepartementRepository chefDepartementRepository) {
        return args -> {
            if (reunionRepository.count() == 0) {
                // Récupérer des départements existants
                var depts = departementRepository.findAll();
                
                if (!depts.isEmpty()) {
                    Departement d1 = depts.get(0);
                    
                    // Trouver un chef pour ce département (requis par votre service)
                    var chefs = chefDepartementRepository.findAll().stream()
                            .filter(c -> c.getDepartementGere() != null && c.getDepartementGere().getId().equals(d1.getId()))
                            .toList();
                    
                    if (!chefs.isEmpty()) {
                        Long chefId = chefs.get(0).getId();

                        ReunionDTO r1 = new ReunionDTO();
                        r1.setDate(LocalDate.now().plusDays(2));
                        r1.setHeure("10:00");
                        r1.setStatut("PLANIFIEE");
                        r1.setDepartementId(d1.getId());
                        r1.setChefId(chefId);
                        reunionService.creerReunion(r1);

                        ReunionDTO r2 = new ReunionDTO();
                        r2.setDate(LocalDate.now().plusDays(5));
                        r2.setHeure("14:30");
                        r2.setStatut("PLANIFIEE");
                        r2.setDepartementId(d1.getId());
                        r2.setChefId(chefId);
                        reunionService.creerReunion(r2);
                    }
                }
            }
        };
    }
}
