package com.ssafy.a405.domain.video.repository;

import com.ssafy.a405.domain.video.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    Optional<Video> findByYtVideoId(String ytVideoId);
}
