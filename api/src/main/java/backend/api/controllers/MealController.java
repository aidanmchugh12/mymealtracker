package backend.api.controllers;

import backend.api.auth.JwtUtils;
import backend.api.db.MealRepository;
import backend.api.db.UserRepository;
import backend.api.models.Meal;
import backend.api.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/meals")
public class MealController {

    @Autowired
    private MealRepository mealRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private String getUserIdFromAuth(Authentication authentication) {
        String token = (String) authentication.getPrincipal();
        return jwtUtils.getUserIdFromToken(token);
    }

    @PostMapping
    public ResponseEntity<?> logMeal(@RequestBody Meal meal, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        meal.setUserId(getUserIdFromAuth(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(mealRepository.save(meal));
    }

    @GetMapping
    public ResponseEntity<?> getUserMeals(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        String userId = getUserIdFromAuth(authentication);
        List<Meal> meals = mealRepository.findByUserId(userId);
        return ResponseEntity.ok(meals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMealById(@PathVariable String id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        Optional<Meal> meal = mealRepository.findById(id);
        if (meal.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Meal not found");
        if (!meal.get().getUserId().equals(getUserIdFromAuth(authentication)))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
        return ResponseEntity.ok(meal.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMeal(@PathVariable String id, @RequestBody Meal updatedMeal, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        Optional<Meal> existingMeal = mealRepository.findById(id);
        if (existingMeal.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Meal not found");
        if (!existingMeal.get().getUserId().equals(getUserIdFromAuth(authentication)))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
        Meal meal = existingMeal.get();
        if (updatedMeal.getFoodName() != null) meal.setFoodName(updatedMeal.getFoodName());
        if (updatedMeal.getCalories() > 0) meal.setCalories(updatedMeal.getCalories());
        if (updatedMeal.getProtein() >= 0) meal.setProtein(updatedMeal.getProtein());
        if (updatedMeal.getCarbs() >= 0) meal.setCarbs(updatedMeal.getCarbs());
        if (updatedMeal.getFat() >= 0) meal.setFat(updatedMeal.getFat());
        return ResponseEntity.ok(mealRepository.save(meal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMeal(@PathVariable String id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        Optional<Meal> meal = mealRepository.findById(id);
        if (meal.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Meal not found");
        if (!meal.get().getUserId().equals(getUserIdFromAuth(authentication)))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized");
        mealRepository.deleteById(id);
        return ResponseEntity.ok("Meal deleted");
    }
}