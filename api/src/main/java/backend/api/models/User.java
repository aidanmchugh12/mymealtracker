package backend.api.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String username;
    private String passwordHash;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> friendIds = new ArrayList<>();
    private List<String> incomingFriendRequestIds = new ArrayList<>();
    private List<String> outgoingFriendRequestIds = new ArrayList<>();

    public User() {}

    public User(String email, String username, String passwordHash) {
        this.email = email;
        this.username = username;
        this.passwordHash = passwordHash;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<String> getFriendIds() { return friendIds; }
    public void setFriendIds(List<String> friendIds) { this.friendIds = friendIds; }
    public List<String> getIncomingFriendRequestIds() { return incomingFriendRequestIds; }
    public void setIncomingFriendRequestIds(List<String> incomingFriendRequestIds) { this.incomingFriendRequestIds = incomingFriendRequestIds; }
    public List<String> getOutgoingFriendRequestIds() { return outgoingFriendRequestIds; }
    public void setOutgoingFriendRequestIds(List<String> outgoingFriendRequestIds) { this.outgoingFriendRequestIds = outgoingFriendRequestIds; }
}
