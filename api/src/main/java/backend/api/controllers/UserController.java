package backend.api.controllers;

import backend.api.auth.JwtUtils;
import backend.api.db.UserRepository;
import backend.api.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private record UserSummary(String id, String email, String username) {}

    private UserSummary toSummary(User user) {
        return new UserSummary(user.getId(), user.getEmail(), user.getUsername());
    }

    private List<String> safeList(List<String> ids) {
        return ids == null ? new ArrayList<>() : ids;
    }

    private Optional<User> getAuthenticatedUser(Authentication authentication) {
        if (authentication == null) {
            return Optional.empty();
        }
        String token = (String) authentication.getPrincipal();
        String userId = jwtUtils.getUserIdFromToken(token);
        return userRepository.findById(userId);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        String token = (String) authentication.getPrincipal();
        String userId = jwtUtils.getUserIdFromToken(token);
        Optional<User> user = userRepository.findById(userId);
        return user.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id,
                                         @RequestBody User updatedUser,
                                         Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        User user = existingUser.get();
        if (updatedUser.getUsername() != null) user.setUsername(updatedUser.getUsername());
        if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
        user.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/friends")
    public ResponseEntity<?> getFriends(Authentication authentication) {
        Optional<User> userOpt = getAuthenticatedUser(authentication);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        List<String> friendIds = userOpt.get().getFriendIds();
        if (friendIds == null || friendIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<UserSummary> friends = userRepository.findAllById(friendIds)
                .stream()
                .map(this::toSummary)
                .toList();
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/friend-requests/incoming")
    public ResponseEntity<?> getIncomingFriendRequests(Authentication authentication) {
        Optional<User> userOpt = getAuthenticatedUser(authentication);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        List<String> requestIds = safeList(userOpt.get().getIncomingFriendRequestIds());
        if (requestIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<UserSummary> requests = userRepository.findAllById(requestIds)
                .stream()
                .map(this::toSummary)
                .toList();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/friend-requests/outgoing")
    public ResponseEntity<?> getOutgoingFriendRequests(Authentication authentication) {
        Optional<User> userOpt = getAuthenticatedUser(authentication);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        List<String> requestIds = safeList(userOpt.get().getOutgoingFriendRequestIds());
        if (requestIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<UserSummary> requests = userRepository.findAllById(requestIds)
                .stream()
                .map(this::toSummary)
                .toList();
        return ResponseEntity.ok(requests);
    }

    @PostMapping({"/friends", "/friend-requests"})
    public ResponseEntity<?> sendFriendRequest(@RequestBody Map<String, String> body,
                                               Authentication authentication) {
        Optional<User> userOpt = getAuthenticatedUser(authentication);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String username = body.get("username");
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }

        User user = userOpt.get();
        Optional<User> friendOpt = userRepository.findByUsernameIgnoreCase(username.trim());
        if (friendOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User friend = friendOpt.get();
        if (friend.getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body("You cannot add yourself as a friend");
        }

        List<String> friendIds = safeList(user.getFriendIds());
        user.setFriendIds(friendIds);
        if (friendIds.contains(friend.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Already in your friends list");
        }

        List<String> outgoingRequestIds = safeList(user.getOutgoingFriendRequestIds());
        List<String> incomingRequestIds = safeList(friend.getIncomingFriendRequestIds());
        user.setOutgoingFriendRequestIds(outgoingRequestIds);
        friend.setIncomingFriendRequestIds(incomingRequestIds);

        if (outgoingRequestIds.contains(friend.getId()) || incomingRequestIds.contains(user.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Friend request already sent");
        }

        List<String> reciprocalRequestIds = safeList(user.getIncomingFriendRequestIds());
        if (reciprocalRequestIds.contains(friend.getId())) {
            return acceptFriendRequest(friend.getId(), authentication);
        }

        outgoingRequestIds.add(friend.getId());
        incomingRequestIds.add(user.getId());
        user.setUpdatedAt(LocalDateTime.now());
        friend.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        userRepository.save(friend);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Friend request sent",
                "user", toSummary(friend)
        ));
    }

    @PostMapping("/friend-requests/{requesterId}/accept")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable String requesterId,
                                                 Authentication authentication) {
        Optional<User> userOpt = getAuthenticatedUser(authentication);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        Optional<User> requesterOpt = userRepository.findById(requesterId);
        if (requesterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Requesting user not found");
        }

        User user = userOpt.get();
        User requester = requesterOpt.get();
        List<String> incomingRequestIds = safeList(user.getIncomingFriendRequestIds());
        List<String> outgoingRequestIds = safeList(requester.getOutgoingFriendRequestIds());
        user.setIncomingFriendRequestIds(incomingRequestIds);
        requester.setOutgoingFriendRequestIds(outgoingRequestIds);

        if (!incomingRequestIds.contains(requester.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Friend request not found");
        }

        List<String> userFriendIds = safeList(user.getFriendIds());
        List<String> requesterFriendIds = safeList(requester.getFriendIds());
        user.setFriendIds(userFriendIds);
        requester.setFriendIds(requesterFriendIds);

        if (!userFriendIds.contains(requester.getId())) {
            userFriendIds.add(requester.getId());
        }
        if (!requesterFriendIds.contains(user.getId())) {
            requesterFriendIds.add(user.getId());
        }

        incomingRequestIds.remove(requester.getId());
        outgoingRequestIds.remove(user.getId());
        user.setUpdatedAt(LocalDateTime.now());
        requester.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        userRepository.save(requester);

        return ResponseEntity.ok(toSummary(requester));
    }

    @DeleteMapping("/friend-requests/{requesterId}")
    public ResponseEntity<?> declineFriendRequest(@PathVariable String requesterId,
                                                  Authentication authentication) {
        Optional<User> userOpt = getAuthenticatedUser(authentication);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        Optional<User> requesterOpt = userRepository.findById(requesterId);
        if (requesterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Requesting user not found");
        }

        User user = userOpt.get();
        User requester = requesterOpt.get();
        List<String> incomingRequestIds = safeList(user.getIncomingFriendRequestIds());
        List<String> outgoingRequestIds = safeList(requester.getOutgoingFriendRequestIds());
        user.setIncomingFriendRequestIds(incomingRequestIds);
        requester.setOutgoingFriendRequestIds(outgoingRequestIds);

        if (!incomingRequestIds.remove(requester.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Friend request not found");
        }
        outgoingRequestIds.remove(user.getId());

        user.setUpdatedAt(LocalDateTime.now());
        requester.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        userRepository.save(requester);
        return ResponseEntity.ok("Friend request declined");
    }

    @DeleteMapping("/friend-requests/outgoing/{recipientId}")
    public ResponseEntity<?> cancelFriendRequest(@PathVariable String recipientId,
                                                 Authentication authentication) {
        Optional<User> userOpt = getAuthenticatedUser(authentication);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        Optional<User> recipientOpt = userRepository.findById(recipientId);
        if (recipientOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recipient user not found");
        }

        User user = userOpt.get();
        User recipient = recipientOpt.get();
        List<String> outgoingRequestIds = safeList(user.getOutgoingFriendRequestIds());
        List<String> incomingRequestIds = safeList(recipient.getIncomingFriendRequestIds());
        user.setOutgoingFriendRequestIds(outgoingRequestIds);
        recipient.setIncomingFriendRequestIds(incomingRequestIds);

        if (!outgoingRequestIds.remove(recipient.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Friend request not found");
        }
        incomingRequestIds.remove(user.getId());

        user.setUpdatedAt(LocalDateTime.now());
        recipient.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        userRepository.save(recipient);
        return ResponseEntity.ok("Friend request canceled");
    }

    @DeleteMapping("/friends/{friendId}")
    public ResponseEntity<?> removeFriend(@PathVariable String friendId,
                                          Authentication authentication) {
        Optional<User> userOpt = getAuthenticatedUser(authentication);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        User user = userOpt.get();
        List<String> friendIds = safeList(user.getFriendIds());
        user.setFriendIds(friendIds);
        if (friendIds == null || !friendIds.remove(friendId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Friend not found");
        }

        userRepository.findById(friendId).ifPresent(friend -> {
            List<String> reciprocalFriendIds = safeList(friend.getFriendIds());
            friend.setFriendIds(reciprocalFriendIds);
            reciprocalFriendIds.remove(user.getId());
            friend.setUpdatedAt(LocalDateTime.now());
            userRepository.save(friend);
        });

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok("Friend removed");
    }
}
