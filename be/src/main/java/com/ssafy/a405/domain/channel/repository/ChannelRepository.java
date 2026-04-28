package com.ssafy.a405.domain.channel.repository;

import com.ssafy.a405.domain.channel.entity.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {
    Optional<Channel> findByYtChannelId(String ytChannelId);
}
