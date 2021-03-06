package mannschaft_knust.classrep;

import android.arch.lifecycle.LiveData;
import android.arch.persistence.room.Dao;
import android.arch.persistence.room.Delete;
import android.arch.persistence.room.Insert;
import android.arch.persistence.room.OnConflictStrategy;
import android.arch.persistence.room.Query;
import android.arch.persistence.room.RoomWarnings;
import android.arch.persistence.room.Update;

import java.util.List;

@Dao
public interface DatabaseDao {
    //course list operations
    @SuppressWarnings(RoomWarnings.CURSOR_MISMATCH)
    @Query("SELECT * FROM CourseSession")
    LiveData<List<Course>> getCourseList();

    //course post operations
    @Query("SELECT * FROM CoursePost")
    LiveData<List<CoursePost>> getCoursePosts();
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCoursePost(CoursePost coursePost);
    @Query("DELETE FROM coursepost")
    void deleteAllCoursePosts();

    //course session operations
    @Query("SELECT * FROM CourseSession")
    LiveData<List<CourseSession>> getCourseSessions();
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCourseSession(CourseSession courseSession);
    @Query("DELETE FROM coursesession")
    void deleteAllCourseSessions();
}
