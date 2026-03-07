import * as htmlToImage from 'html-to-image';
import type { WindowManager } from '$lib/stores/windowStore.svelte';

/**
 * Screenshot készítése egy ablakról
 * @param windowId Az ablak azonosítója
 * @param windowManager A WindowManager példány
 * @param screenshotThumbnailHeight A screenshot magassága pixelben
 * @returns Promise<void>
 */
export async function takeWindowScreenshot(
	windowId: string,
	windowManager: WindowManager,
	screenshotThumbnailHeight: number
): Promise<void> {
	const windowElement = document.querySelector(`[data-window-id="${windowId}"]`) as HTMLElement;
	if (!windowElement) return;

	try {
		// Klónozzuk az ablakot egy off-screen konténerbe
		const clone = windowElement.cloneNode(true) as HTMLElement;

		// Off-screen konténer létrehozása
		const offscreenContainer = document.createElement('div');
		offscreenContainer.style.position = 'fixed';
		offscreenContainer.style.left = '-9999px';
		offscreenContainer.style.top = '0';
		offscreenContainer.style.zIndex = '-1';
		document.body.appendChild(offscreenContainer);

		// Klón pozícionálása a konténerben
		clone.style.position = 'relative';
		clone.style.left = '0';
		clone.style.top = '0';
		clone.style.transform = 'none';
		offscreenContainer.appendChild(clone);

		// Ablak méretének lekérése
		const window = windowManager.getWindowById(windowId);
		if (!window) {
			document.body.removeChild(offscreenContainer);
			return;
		}

		// Ablak tényleges méretének lekérése a DOM-ból
		// (maximalizált ablak esetén a windowState.size nem frissül, csak a CSS)
		const actualWidth = windowElement.offsetWidth;
		const actualHeight = windowElement.offsetHeight;

		// Ablak méretarányának kiszámítása a tényleges méret alapján
		const aspectRatio = actualWidth / actualHeight;
		const thumbnailWidth = Math.round(screenshotThumbnailHeight * aspectRatio);

		// Screenshot készítése a klónról - JPEG alacsony minőséggel (gyorsabb mint PNG)
		const screenshotData = await htmlToImage.toJpeg(clone, {
			canvasHeight: screenshotThumbnailHeight,
			canvasWidth: thumbnailWidth,
			quality: 0.8,
			skipAutoScale: true,
			pixelRatio: 1
		});

		// Takarítás
		document.body.removeChild(offscreenContainer);

		// Screenshot mentése az ablak adataiba
		windowManager.updateWindowScreenshot(windowId, screenshotData);
	} catch (error) {
		console.error('Screenshot készítés sikertelen!', error);
	}
}
