package admin.jlas.game.modules.auth.security;

import admin.jlas.game.modules.auth.enums.RoleName;
import admin.jlas.game.modules.auth.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Long userId;
    private final String email;
    private final String password;
    private final String displayName;
    private final String avatar;
    private final RoleName role;
    private final boolean accountNonLocked;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(User user) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.displayName = user.getFullName() != null && !user.getFullName().isBlank()
                ? user.getFullName()
                : user.getEmail();
        this.avatar = user.getAvatar();
        this.role = user.getRoleName();
        this.accountNonLocked = !Boolean.TRUE.equals(user.getIsBan());
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
    }

    public static UserPrincipal from(User user) {
        return new UserPrincipal(user);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getAvatar() {
        return avatar;
    }

    public RoleName getRole() {
        return role;
    }

    /** ADMIN / SUPER_ADMIN — dùng cho các action quản trị Arena. */
    public boolean isAdministrative() {
        return role.isAdministrative();
    }
}
