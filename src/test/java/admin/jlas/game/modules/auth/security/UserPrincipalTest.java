package admin.jlas.game.modules.auth.security;

import admin.jlas.game.modules.auth.enums.RoleName;
import admin.jlas.game.modules.auth.model.Role;
import admin.jlas.game.modules.auth.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Role của user phải map đúng sang authority ROLE_* mà hasAnyRole(...) đọc. */
class UserPrincipalTest {

    private static User user(Role role) {
        return User.builder()
                .userId(7L)
                .email("someone@jlas.local")
                .passwordHash("hash")
                .fullName("Someone")
                .role(role)
                .isBan(false)
                .build();
    }

    private static Role role(RoleName name) {
        return Role.builder().roleId(1L).name(name).description(name.name()).build();
    }

    private static List<String> authorities(User user) {
        return UserPrincipal.from(user).getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
    }

    @Test
    @DisplayName("ADMIN -> ROLE_ADMIN và isAdministrative()")
    void adminMapsToRoleAdmin() {
        User admin = user(role(RoleName.ADMIN));
        assertEquals(List.of("ROLE_ADMIN"), authorities(admin));
        assertTrue(UserPrincipal.from(admin).isAdministrative());
    }

    @Test
    @DisplayName("SUPER_ADMIN cũng là quyền quản trị")
    void superAdminIsAdministrative() {
        UserPrincipal principal = UserPrincipal.from(user(role(RoleName.SUPER_ADMIN)));
        assertEquals(List.of("ROLE_SUPER_ADMIN"),
                principal.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
        assertTrue(principal.isAdministrative());
    }

    @Test
    @DisplayName("USER không có quyền quản trị")
    void userIsNotAdministrative() {
        UserPrincipal principal = UserPrincipal.from(user(role(RoleName.USER)));
        assertEquals(List.of("ROLE_USER"),
                principal.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
        assertFalse(principal.isAdministrative());
    }

    @Test
    @DisplayName("Row cũ chưa có role_id được coi là USER, không crash")
    void nullRoleFallsBackToUser() {
        UserPrincipal principal = UserPrincipal.from(user(null));
        assertEquals(RoleName.USER, principal.getRole());
        assertEquals(List.of("ROLE_USER"),
                principal.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
        assertFalse(principal.isAdministrative());
    }

    @Test
    @DisplayName("Tài khoản bị ban -> accountNonLocked = false")
    void bannedUserIsLocked() {
        User banned = user(role(RoleName.USER));
        banned.setIsBan(true);
        assertFalse(UserPrincipal.from(banned).isAccountNonLocked());
    }
}
