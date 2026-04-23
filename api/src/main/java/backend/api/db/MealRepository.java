package backend.api.db;

import backend.api.models.Meal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MealRepository extends MongoRepository<Meal, String> {
    
    List<Meal> findByUserId(String userId);
    
    void deleteByIdAndUserId(String id, String userId);
}
