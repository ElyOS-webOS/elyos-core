<script lang="ts">
	import { onMount } from 'svelte';
	import { I18nProvider } from '$lib/i18n/components';
	import { getChatStore } from './stores/chatStore.svelte';
	import UserList from './components/UserList.svelte';
	import ConversationList from './components/ConversationList.svelte';
	import ChatWindow from './components/ChatWindow.svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { getCurrentUserId } from './chat.remote';

	const chatStore = getChatStore();

	let currentUserId = $state<number | null>(null);
	let isSidebarCollapsed = $state(false);

	// Load current user ID
	onMount(async () => {
		const result = await getCurrentUserId({});
		if (result.success && result.userId) {
			currentUserId = result.userId;
		}
	});

	// Load sidebar state from localStorage
	$effect(() => {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('chat-sidebar-collapsed');
			if (stored !== null) {
				isSidebarCollapsed = JSON.parse(stored);
			}
		}
	});

	function toggleSidebar() {
		isSidebarCollapsed = !isSidebarCollapsed;
		if (typeof window !== 'undefined') {
			localStorage.setItem('chat-sidebar-collapsed', JSON.stringify(isSidebarCollapsed));
		}
	}
</script>

<I18nProvider namespaces={['chat', 'common']}>
	<div class="chat-layout">
		<!-- Right sidebar for user list with collapse functionality -->
		<div class="chat-sidebar-container" class:collapsed={isSidebarCollapsed}>
			<div class="chat-sidebar">
				<div class="sidebar-content custom-scrollbar">
					<UserList />
				</div>
			</div>
			<button
				class="sidebar-toggle"
				onclick={toggleSidebar}
				aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				title={isSidebarCollapsed ? 'Kinyitás' : 'Becsukás'}
			>
				<span class="icon-wrapper">
					{#if isSidebarCollapsed}
						<ChevronRight size={14} />
					{:else}
						<ChevronLeft size={14} />
					{/if}
				</span>
			</button>
		</div>

		<!-- Main chat panel with conversations and messages in one rounded island -->
		<div class="chat-panel main-panel">
			<div class="conversations-section">
				<ConversationList />
			</div>
			<div class="messages-section">
				<ChatWindow {currentUserId} />
			</div>
		</div>
	</div>
</I18nProvider>

<style>
	.chat-layout {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem 0.5rem 0.5rem 0;
		height: 100%;
		overflow: hidden;
	}

	.chat-sidebar-container {
		display: flex;
		position: relative;
		align-items: stretch;
		margin-left: 0.5rem;
	}

	.chat-sidebar {
		flex-shrink: 0;
		transition:
			width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: var(--radius-md);
		background: linear-gradient(
			to bottom right,
			var(--color-neutral-200),
			var(--color-neutral-100)
		);
		width: 280px;
		max-width: 280px;
		overflow: hidden;
	}

	.chat-sidebar-container.collapsed .chat-sidebar {
		border-radius: 0;
		width: 0;
		max-width: 0;
	}

	.sidebar-content {
		padding: 1rem;
		width: 280px;
		height: 100%;
		overflow-y: auto;
	}

	.sidebar-content::-webkit-scrollbar {
		width: 4px;
	}

	.sidebar-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.sidebar-content::-webkit-scrollbar-thumb {
		border-radius: 2px;
		background: var(--color-neutral-300);
	}

	.sidebar-content::-webkit-scrollbar-thumb:hover {
		background: var(--color-neutral-400);
	}

	.sidebar-toggle {
		display: flex;
		flex: 0 0 28px;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		margin-left: 0.375rem;
		border: none;
		background: transparent;
		padding: 0;
		color: var(--color-neutral-400);
	}

	.sidebar-toggle:active {
		transform: scale(0.96);
	}

	.icon-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.2s ease-out;
		border-radius: 50%;
		width: 24px;
		height: 24px;
	}

	.sidebar-toggle:hover .icon-wrapper {
		background: var(--primary);
		color: white;
	}

	.chat-sidebar-container.collapsed .sidebar-toggle {
		margin-left: 0;
	}

	.chat-panel {
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-md);
		background: linear-gradient(
			to bottom right,
			var(--color-neutral-200),
			var(--color-neutral-100)
		);
		overflow: hidden;
	}

	.main-panel {
		display: flex;
		flex: 1;
		flex-direction: row;
		min-width: 0;
	}

	.conversations-section {
		display: flex;
		flex: 0 0 320px;
		flex-direction: column;
		border-right: 1px solid rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.messages-section {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
	}

	:global(.dark) .chat-panel,
	:global(.dark) .chat-sidebar {
		background: linear-gradient(
			to bottom right,
			var(--color-neutral-900),
			var(--color-neutral-800)
		);
	}

	:global(.dark) .conversations-section {
		border-right-color: rgba(255, 255, 255, 0.1);
	}

	:global(.dark) .sidebar-content::-webkit-scrollbar-thumb {
		background: var(--color-neutral-600);
	}

	:global(.dark) .sidebar-content::-webkit-scrollbar-thumb:hover {
		background: var(--color-neutral-500);
	}

	:global(.dark) .sidebar-toggle:hover .icon-wrapper {
		background: var(--primary);
		color: white;
	}
</style>
