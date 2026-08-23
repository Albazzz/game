package admin.jlas.game.modules.arena.controller;

import admin.jlas.game.modules.arena.domain.GameRuleMetadata;
import admin.jlas.game.modules.arena.mapper.ArenaViewMapper;
import admin.jlas.game.modules.auth.service.GoogleTokenService;
import admin.jlas.game.config.AppProperties;
import admin.jlas.game.config.GameProperties;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/** View controller Thymeleaf cho Arena. */
@Controller
public class ArenaViewController {

    private final ArenaViewMapper viewMapper;
    private final AppProperties appProperties;
    private final GameProperties gameProperties;
    private final GoogleTokenService googleTokenService;

    public ArenaViewController(ArenaViewMapper viewMapper,
                               AppProperties appProperties,
                               GameProperties gameProperties,
                               GoogleTokenService googleTokenService) {
        this.viewMapper = viewMapper;
        this.appProperties = appProperties;
        this.gameProperties = gameProperties;
        this.googleTokenService = googleTokenService;
    }

    @GetMapping("/")
    public String home() {
        return "redirect:/games";
    }

    @GetMapping("/login")
    public String login(Model model) {
        addLoginPageAttributes(model);
        return "auth/login";
    }

    @GetMapping("/register")
    public String register(Model model) {
        addLoginPageAttributes(model);
        return "auth/login";
    }

    private void addLoginPageAttributes(Model model) {
        model.addAttribute("googleEnabled", googleTokenService.isEnabled());
        model.addAttribute("googleClientId", appProperties.getGoogle().getClientId());
        GameProperties.Demo demo = gameProperties.getDemo();
        model.addAttribute("demoLoginEnabled", demo.isSeedEnabled());
        model.addAttribute("demoPassword", demo.getPassword());
    }

    @GetMapping("/games")
    public String games(Model model) {
        model.addAttribute("games", GameRuleMetadata.all().stream()
                .map(viewMapper::toCatalogItem)
                .toList());
        return "arena/games";
    }

    @GetMapping("/games/lobby")
    public String lobby() {
        return "arena/lobby";
    }

    @GetMapping("/games/room/{roomId}")
    public String room(@PathVariable String roomId, Model model) {
        model.addAttribute("roomId", roomId);
        return "arena/room";
    }

    /** Bàn chơi Memory Match; sessionId do server phát ra khi tạo ván. */
    @GetMapping("/games/memory/{sessionId}")
    public String memory(@PathVariable String sessionId, Model model) {
        model.addAttribute("sessionId", sessionId);
        return "memory/board";
    }

    /** Trang chủ game Air Defence (Command Deck, Hangar, Shop, Talent, Queue). */
    @GetMapping("/games/air-defense")
    public String airDefenseHome(Model model) {
        model.addAttribute("sessionId", "");
        return "air-defense/board";
    }

    /** Phòng chơi / Match session Air Defence. */
    @GetMapping("/games/air-defense/{sessionId}")
    public String airDefenseSession(@PathVariable String sessionId, Model model) {
        model.addAttribute("sessionId", sessionId != null ? sessionId : "");
        return "air-defense/board";
    }
}
