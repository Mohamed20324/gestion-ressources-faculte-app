package ma.faculte.gestion_ressources_backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping
    public String direBonjour() {
        return "Félicitations ! Le serveur de la Faculté fonctionne parfaitement !";
    }
}