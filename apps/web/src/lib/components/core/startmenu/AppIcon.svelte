<!--
Alkalmazás parancsikonok komponens.
Start menüben megjelenő ikonokat mutatja.
-->
<script lang="ts">
	import { type AppMetadata } from '$lib/types/window';
	import { UniversalIcon } from '$lib/components/shared';
	interface Props {
		app: AppMetadata;
		onclick: () => void;
	}
	let { app, onclick }: Props = $props();

	function handleDragStart(e: DragEvent) {
		if (!e.dataTransfer) return;
		e.dataTransfer.effectAllowed = 'copy';
		e.dataTransfer.setData('application/x-elyos-app', app.appName);
		e.dataTransfer.setData('text/plain', app.title);
	}
</script>

<button {onclick} class="btn-click-effect" draggable="true" ondragstart={handleDragStart}>
	<div class="app-icon" class:cover={app.iconStyle === 'cover'}>
		<UniversalIcon
			icon={app.icon ?? ''}
			size={app.iconStyle === 'cover' ? 80 : 40}
			appName={app.appName}
		/>
	</div>
	<div class="app-title"><div>{app.title}</div></div>
</button>

<style>
	button {
		--btn-size: 80px;
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 5px;
		z-index: 100;
		cursor: pointer;
		aspect-ratio: 1;
		width: var(--btn-size);
		color: var(--color-foreground);

		.app-icon {
			display: flex;
			position: relative;
			justify-content: center;
			align-items: center;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

			/* Elemelkedő árnyék - primary szín nélkül */
			box-shadow:
				inset 0 1px 1px rgba(255, 255, 255, 0.2),
				0 4px 12px rgba(0, 0, 0, 0.15),
				0 2px 4px rgba(0, 0, 0, 0.1);
			border: 1px solid rgba(255, 255, 255, 0.4);
			border-radius: 20px;

			/* Világos mód - fehérebb háttér */
			background: linear-gradient(145deg, #f5f5f8, #e8e8f0);
			aspect-ratio: 1;
			width: 100%;

			/* Világos módban tompítjuk az ikont */
			:global(svg) {
				opacity: 0.7;
			}
		}

		.app-icon.cover {
			background: none;
			padding: 0;
			overflow: hidden;
		}

		.app-icon.cover :global(.universal-icon) {
			width: 100%;
			height: 100%;
		}

		.app-icon.cover :global(img) {
			border-radius: 0;
			width: 100% !important;
			height: 100% !important;
			object-fit: cover !important;
		}

		.app-icon.cover :global(.svg-container) {
			display: flex;
			justify-content: stretch;
			align-items: stretch;
			width: 100% !important;
			height: 100% !important;
		}

		.app-icon.cover :global(.svg-container svg) {
			width: 100% !important;
			height: 100% !important;
		}

		.app-title {
			width: var(--btn-size);

			& > div {
				display: -webkit-box;
				transition: color 0.25s ease-out;
				line-clamp: 2;
				-webkit-line-clamp: 2;
				overflow: hidden;
				font-size: 0.7rem;
				text-overflow: ellipsis;
				-webkit-box-orient: vertical;
				line-height: 1.5em;
				white-space: normal;
			}
		}

		&:hover {
			.app-icon {
				transform: translateY(-1px);

				box-shadow:
					inset 0 1px 2px rgba(255, 255, 255, 0.3),
					0 6px 16px rgba(0, 0, 0, 0.2),
					0 3px 6px rgba(0, 0, 0, 0.12),
					0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent);
				border-color: color-mix(in srgb, var(--color-primary) 30%, rgba(255, 255, 255, 0.5));

				/* Átlós primary színű átmenet - erősebb szürkés háttérrel */
				background:
					linear-gradient(
						135deg,
						color-mix(in srgb, var(--color-primary) 25%, transparent) 0%,
						transparent 50%
					),
					linear-gradient(145deg, #ebebf0, #dcdce5);
			}
			.app-title {
				& > div {
					color: var(--color-primary);
				}
			}
		}

		&:active {
			.app-icon {
				transform: translateY(0);
				box-shadow:
					inset 0 1px 1px rgba(255, 255, 255, 0.15),
					inset 0 -15px 15px -10px color-mix(in srgb, var(--color-primary) 30%, transparent),
					0 2px 6px rgba(0, 0, 0, 0.15);
			}
		}
	}

	/* Sötét mód - sötét szürkés-feketés */
	:global(.dark) button {
		.app-icon {
			border: 1px solid rgba(255, 255, 255, 0.1);
			background: linear-gradient(145deg, #2a2a2a, #1c1c1c);

			/* Sötét módban teljes opacity */
			:global(svg) {
				opacity: 1;
			}
		}

		&:hover {
			.app-icon {
				border-color: rgba(255, 255, 255, 0.15);

				/* Átlós primary színű átmenet sötét módban */
				background:
					linear-gradient(
						135deg,
						color-mix(in srgb, var(--color-primary) 20%, transparent) 0%,
						transparent 50%
					),
					linear-gradient(145deg, #353535, #282828);
			}
		}
	}
</style>
