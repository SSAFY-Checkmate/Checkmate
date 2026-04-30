package com.ssafy.a405.domain.community;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.a405.domain.analysis.entity.AnalysisResult;
import com.ssafy.a405.domain.analysis.repository.AnalysisResultRepository;
import com.ssafy.a405.domain.auth.security.CustomUserDetail;
import com.ssafy.a405.domain.channel.entity.Channel;
import com.ssafy.a405.domain.channel.repository.ChannelRepository;
import com.ssafy.a405.domain.user.entity.User;
import com.ssafy.a405.domain.user.repository.UserRepository;
import com.ssafy.a405.domain.video.entity.Video;
import com.ssafy.a405.domain.video.repository.VideoRepository;
import com.ssafy.a405.global.common.enums.TrustGrade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@Transactional
@SpringBootTest
@AutoConfigureMockMvc
class CommunityCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private AnalysisResultRepository analysisResultRepository;

    private User user;
    private AnalysisResult analysisResult;

    @BeforeEach
    void setUp() {
        user = userRepository.save(User.builder()
                .email("user@test.com")
                .name("tester")
                .googleSubId("google-sub-id")
                .build());

        Channel channel = channelRepository.save(Channel.builder()
                .channelName("channel")
                .trustGrade(TrustGrade.GOOD)
                .totalViolationCount(0)
                .ytChannelId("yt-channel-id")
                .build());

        Video video = videoRepository.save(Video.builder()
                .channel(channel)
                .title("video")
                .thumbnailUrl("thumbnail")
                .description("description")
                .publishedAt(LocalDateTime.now())
                .ytVideoId("yt-video-id")
                .build());

        analysisResult = analysisResultRepository.save(AnalysisResult.builder()
                .video(video)
                .confidenceScore(80)
                .status(TrustGrade.GOOD)
                .summary("summary")
                .modelVersion("v1")
                .build());
    }

    @Test
    void reactionCrudWorks() throws Exception {
        Long reactionId = extractId(mockMvc.perform(post("/community/reactions")
                        .with(authenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "analysisId": %d,
                                  "reactionType": true
                                }
                                """.formatted(analysisResult.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.reactionType").value(true))
                .andReturn());

        mockMvc.perform(get("/community/reactions/{reactionId}", reactionId).with(authenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(reactionId));

        mockMvc.perform(get("/community/reactions").with(authenticatedUser()).param("analysisId", analysisResult.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(put("/community/reactions/{reactionId}", reactionId)
                        .with(authenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reactionType": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reactionType").value(false));

        mockMvc.perform(delete("/community/reactions/{reactionId}", reactionId).with(authenticatedUser()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/community/reactions/{reactionId}", reactionId).with(authenticatedUser()))
                .andExpect(status().isNotFound());
    }

    @Test
    void userFeedbackCrudWorks() throws Exception {
        Long userFeedbackId = extractId(mockMvc.perform(post("/community/feedbacks")
                        .with(authenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "analysisId": %d,
                                  "reason": "reason",
                                  "isCorrect": true
                                }
                                """.formatted(analysisResult.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.isCorrect").value(true))
                .andReturn());

        mockMvc.perform(get("/community/feedbacks/{userFeedbackId}", userFeedbackId).with(authenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(userFeedbackId));

        mockMvc.perform(get("/community/feedbacks").with(authenticatedUser()).param("analysisId", analysisResult.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(put("/community/feedbacks/{userFeedbackId}", userFeedbackId)
                        .with(authenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reason": "updated reason",
                                  "isCorrect": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.reason").value("updated reason"))
                .andExpect(jsonPath("$.data.isCorrect").value(false));

        mockMvc.perform(delete("/community/feedbacks/{userFeedbackId}", userFeedbackId).with(authenticatedUser()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/community/feedbacks/{userFeedbackId}", userFeedbackId).with(authenticatedUser()))
                .andExpect(status().isNotFound());
    }

    @Test
    void commentCrudWorks() throws Exception {
        Long commentId = extractId(mockMvc.perform(post("/community/comments")
                        .with(authenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "analysisId": %d,
                                  "content": "first comment"
                                }
                                """.formatted(analysisResult.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.content").value("first comment"))
                .andReturn());

        mockMvc.perform(get("/community/comments/{commentId}", commentId).with(authenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(commentId));

        mockMvc.perform(get("/community/comments").with(authenticatedUser()).param("analysisId", analysisResult.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(10))
                .andExpect(jsonPath("$.data.content.length()").value(1));

        mockMvc.perform(put("/community/comments/{commentId}", commentId)
                        .with(authenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "content": "updated comment"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").value("updated comment"));

        mockMvc.perform(delete("/community/comments/{commentId}", commentId).with(authenticatedUser()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/community/comments/{commentId}", commentId).with(authenticatedUser()))
                .andExpect(status().isNotFound());
    }

    @Test
    void commentListIsPaginatedByTen() throws Exception {
        for (int i = 1; i <= 15; i++) {
            mockMvc.perform(post("/community/comments")
                            .with(authenticatedUser())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {
                                      "analysisId": %d,
                                      "content": "comment-%d"
                                    }
                                    """.formatted(analysisResult.getId(), i)))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(get("/community/comments")
                        .with(authenticatedUser())
                        .param("analysisId", analysisResult.getId().toString())
                        .param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(10))
                .andExpect(jsonPath("$.data.totalPages").value(2))
                .andExpect(jsonPath("$.data.totalElements").value(15))
                .andExpect(jsonPath("$.data.hasNext").value(true))
                .andExpect(jsonPath("$.data.content.length()").value(10));

        mockMvc.perform(get("/community/comments")
                        .with(authenticatedUser())
                        .param("analysisId", analysisResult.getId().toString())
                        .param("page", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.size").value(10))
                .andExpect(jsonPath("$.data.totalPages").value(2))
                .andExpect(jsonPath("$.data.totalElements").value(15))
                .andExpect(jsonPath("$.data.hasNext").value(false))
                .andExpect(jsonPath("$.data.content.length()").value(5));
    }

    private RequestPostProcessor authenticatedUser() {
        CustomUserDetail userDetail = new CustomUserDetail(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetail, null, userDetail.getAuthorities());
        return SecurityMockMvcRequestPostProcessors.authentication(authentication);
    }

    private Long extractId(MvcResult mvcResult) throws Exception {
        JsonNode jsonNode = objectMapper.readTree(mvcResult.getResponse().getContentAsString());
        return jsonNode.path("data").path("id").asLong();
    }
}
