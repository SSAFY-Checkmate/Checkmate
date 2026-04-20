//package com.ssafy.a405.global.common.base;
//
//import jakarta.persistence.Column;
//import jakarta.persistence.MappedSuperclass;
//import jakarta.persistence.PrePersist;
//import jakarta.persistence.PreUpdate;
//import lombok.Getter;
//
//import java.sql.Timestamp;
//
//@Getter
//@MappedSuperclass
//public abstract class BaseTimeEntity {
//
//	@Column(name = "created_at", nullable = false, updatable = false)
//	private Timestamp createdAt;
//
//	@Column(name = "updated_at", nullable = false)
//	private Timestamp updatedAt;
//
//	@PrePersist
//	protected void onCreate() {
//		Timestamp now = new Timestamp(System.currentTimeMillis());
//		this.createdAt = now;
//		this.updatedAt = now;
//	}
//
//	@PreUpdate
//	protected void onUpdate() {
//		this.updatedAt = new Timestamp(System.currentTimeMillis());
//	}
//}
