package com.ssafy.a405.domain.video.repository;

import com.ssafy.a405.domain.video.entity.VideoScript;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoScriptRepository extends JpaRepository<VideoScript, Long> {
    Optional<VideoScript> findByVideoId(Long videoId);
}
