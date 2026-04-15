<!--
  RaccoonScene.svelte — A GLB modell animációs logikája Threlte Canvas-on belül.
-->
<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';
	import type { EmotionState } from '../types/index.js';

	interface Props {
		model: THREE.Group;
		emotionState: EmotionState;
		canvasWrapper?: HTMLDivElement;
		enableMouseTracking?: boolean;
		panelRef?: HTMLDivElement;
	}

	let {
		model,
		emotionState,
		canvasWrapper,
		enableMouseTracking = true,
		panelRef
	}: Props = $props();

	// Wrapper group referencia — ezen fut az animáció
	let groupRef: THREE.Group | undefined = $state();

	let lastEmotion: EmotionState = 'neutral';
	let animStartTime = 0;

	// Egér követés
	let targetRotX = 0;
	let targetRotY = 0;
	let currentMouseRotX = 0;
	let currentMouseRotY = 0;
	let isMouseOverPanel = false;

	let curRotX = 0,
		curRotY = 0,
		curRotZ = 0,
		curPosY = 0,
		curPosX = 0,
		curPosZ = 0,
		curScale = 1;
	let tgtRotX = 0,
		tgtRotY = 0,
		tgtRotZ = 0,
		tgtPosY = 0,
		tgtPosX = 0,
		tgtPosZ = 0,
		tgtScale = 1;

	function lerp(a: number, b: number, t: number): number {
		return a + (b - a) * Math.min(t, 1);
	}

	// Egér mozgás követése
	function handleMouseMove(event: MouseEvent) {
		if (!enableMouseTracking) return;

		// A panel referenciát használjuk (ha van), különben a canvas wrappet
		const trackingElement = panelRef || canvasWrapper;
		if (!trackingElement) return;

		// Panel/Canvas pozíciója és mérete
		const rect = trackingElement.getBoundingClientRect();

		// Ellenőrizzük, hogy az egér a panel felett van-e
		const isOver =
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom;

		isMouseOverPanel = isOver;

		if (!isOver) {
			// Ha az egér nincs a panel felett, lassan térjen vissza a semleges pozícióba
			// A targetRotX/Y értékek fokozatosan 0-ra állnak a useTask lerp-je miatt
			targetRotX = 0;
			targetRotY = 0;
			return;
		}

		// Canvas középpontja a képernyőn (a 3D modell pozíciója)
		const canvasRect = canvasWrapper?.getBoundingClientRect();
		if (!canvasRect) return;

		const canvasCenterX = canvasRect.left + canvasRect.width / 2;
		const canvasCenterY = canvasRect.top + canvasRect.height / 2;

		// Egér távolsága a canvas középpontjától pixelben
		const deltaX = event.clientX - canvasCenterX;
		const deltaY = event.clientY - canvasCenterY;

		// Normalizáljuk a canvas méretéhez képest
		const normalizedX = Math.max(-1.5, Math.min(1.5, deltaX / (canvasRect.width / 2)));
		const normalizedY = Math.max(-1.5, Math.min(1.5, deltaY / (canvasRect.height / 2)));

		// Korlátozzuk a rotációt
		targetRotY = normalizedX * 0.8; // Jobbra-balra
		targetRotX = normalizedY * 0.6 - 0.15; // Fel-le (kis offset hogy feljebb nézzen)
	}

	// Egér követés bekapcsolása
	$effect(() => {
		if (!enableMouseTracking) {
			// Ha ki van kapcsolva, nullázzuk a target értékeket
			targetRotX = 0;
			targetRotY = 0;
			return;
		}

		window.addEventListener('mousemove', handleMouseMove);
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
		};
	});

	function applyEmotionTarget(emotion: EmotionState) {
		animStartTime = performance.now();
		switch (emotion) {
			case 'happy':
				// Helyeslő bólogatás alaphelyzete (előre dől kicsit)
				tgtRotX = -0.2;
				tgtRotY = 0;
				tgtRotZ = 0;
				tgtPosY = 0;
				tgtPosX = 0;
				tgtPosZ = 0;
				tgtScale = 1.0;
				break;
			case 'confused':
				// Fejrázás alaphelyzete (semleges)
				tgtRotX = 0;
				tgtRotY = 0;
				tgtRotZ = 0;
				tgtPosY = 0;
				tgtPosX = 0;
				tgtPosZ = 0;
				tgtScale = 1.0;
				break;
			case 'thinking':
				// Oldalra billentett fej (elgondolkodik)
				tgtRotX = 0;
				tgtRotY = 0;
				tgtRotZ = 0.4;
				tgtPosY = 0;
				tgtPosX = 0;
				tgtPosZ = 0;
				tgtScale = 1.0;
				break;
			case 'surprised':
				// Hirtelen hátraugrás
				tgtRotX = 0.1;
				tgtRotY = 0;
				tgtRotZ = 0;
				tgtPosY = 0.1;
				tgtPosX = 0;
				tgtPosZ = -0.2;
				tgtScale = 1.05;
				break;
			default:
				// Neutral - alaphelyzet
				tgtRotX = 0;
				tgtRotY = 0;
				tgtRotZ = 0;
				tgtPosY = 0;
				tgtPosX = 0;
				tgtPosZ = 0;
				tgtScale = 1.0;
		}
	}

	useTask(() => {
		if (!groupRef) return;

		if (emotionState !== lastEmotion) {
			applyEmotionTarget(emotionState);
			lastEmotion = emotionState;
		}

		const now = performance.now();
		const elapsed = now - animStartTime;
		const t = Math.min(elapsed / 400, 1);

		// Smooth lerp az alapértékekhez
		curRotX = lerp(curRotX, tgtRotX, t * 0.1);
		curRotY = lerp(curRotY, tgtRotY, t * 0.1);
		curRotZ = lerp(curRotZ, tgtRotZ, t * 0.1);
		curPosY = lerp(curPosY, tgtPosY, t * 0.1);
		curPosX = lerp(curPosX, tgtPosX, t * 0.1);
		curPosZ = lerp(curPosZ, tgtPosZ, t * 0.1);
		curScale = lerp(curScale, tgtScale, t * 0.1);

		const time = now * 0.001;
		let extraRotX = 0,
			extraRotY = 0,
			extraRotZ = 0,
			extraPosY = 0,
			extraPosX = 0,
			extraPosZ = 0,
			extraScale = 1;

		switch (lastEmotion) {
			case 'neutral':
				// Finom lélegzés animáció
				extraPosY = Math.sin(time * 1.5) * 0.015;
				extraScale = 1 + Math.sin(time * 1.5) * 0.008;
				break;

			case 'happy':
				// Helyeslő bólogatás (fel-le)
				const nodSpeed = 2.5;
				extraRotX = Math.sin(time * nodSpeed) * 0.3; // Fel-le bólogatás
				extraPosY = Math.sin(time * nodSpeed) * 0.05; // Kicsit fel-le mozog
				break;

			case 'confused':
				// Tagadó fejrázás (jobbra-balra)
				const shakeSpeed = 3;
				extraRotY = Math.sin(time * shakeSpeed) * 0.4; // Jobbra-balra rázás
				break;

			case 'thinking':
				// Oldalra billentett fej + finom pulzálás
				extraRotZ = 0.4 + Math.sin(time * 0.8) * 0.1; // Finom billegés
				extraPosY = Math.sin(time * 1.0) * 0.02;
				break;

			case 'surprised':
				// Hirtelen hátraugrás után remegés
				if (t < 1) {
					// Gyors hátraugrás
					extraPosZ = -0.15 * (1 - t);
					extraRotX = 0.15 * (1 - t);
				} else {
					// Finom remegés a meglepetéstől
					const trembleSpeed = 12;
					extraRotX = Math.sin(time * trembleSpeed) * 0.02;
					extraRotY = Math.sin(time * trembleSpeed * 1.3) * 0.015;
				}
				break;
		}

		// Alkalmazzuk az összes transzformációt (egér követés + érzelem animáció)
		// Egér követés smooth lerp - fokozatos átmenet az egér pozíciójához vagy vissza az alaphelyzetbe
		const mouseLerpSpeed = isMouseOverPanel ? 0.15 : 0.08; // Gyorsabb követés, lassabb visszatérés
		currentMouseRotX = lerp(currentMouseRotX, targetRotX, mouseLerpSpeed);
		currentMouseRotY = lerp(currentMouseRotY, targetRotY, mouseLerpSpeed);

		const mouseInfluence = 0.5; // 50% hatás
		const smoothMouseRotX = currentMouseRotX * mouseInfluence;
		const smoothMouseRotY = currentMouseRotY * mouseInfluence;

		groupRef.rotation.x = smoothMouseRotX + extraRotX;
		groupRef.rotation.y = smoothMouseRotY + extraRotY;
		groupRef.rotation.z = curRotZ + extraRotZ;
		groupRef.position.x = curPosX + extraPosX;
		groupRef.position.y = curPosY + extraPosY;
		groupRef.position.z = curPosZ + extraPosZ;

		// Scale egyszerűen
		groupRef.scale.setScalar(curScale * extraScale);
	});
</script>

<!-- Wrapper group az animációhoz, benne a modell fix Y rotációval -->
<T.Group bind:ref={groupRef}>
	<T is={model} rotation.y={-Math.PI / 2} />
</T.Group>
