package com.ssafy.a405.global.outbox.entity;

public enum OutboxStatus {
	PENDING,
	PROCESSING,
	SENT,
	DEAD
}

