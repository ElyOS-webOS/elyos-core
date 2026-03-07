<!-- Animált futurisztikus háttér -->
<div
	class="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950"
>
	<!-- Rács háttér -->
	<div class="grid-background absolute inset-0"></div>

	<!-- Fénylő körök -->
	<div class="glow-orb glow-orb-1"></div>
	<div class="glow-orb glow-orb-2"></div>
	<div class="glow-orb glow-orb-3"></div>

	<!-- Geometrikus formák -->
	<svg
		class="absolute inset-0 h-full w-full"
		viewBox="0 0 1000 1000"
		preserveAspectRatio="xMidYMid slice"
	>
		<defs>
			<linearGradient id="neon1" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style="stop-color:#5DD5E8;stop-opacity:0.8" />
				<stop offset="100%" style="stop-color:#3B9FD9;stop-opacity:0.3" />
			</linearGradient>
			<linearGradient id="neon2" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style="stop-color:#1E5BA8;stop-opacity:0.6" />
				<stop offset="100%" style="stop-color:#5DD5E8;stop-opacity:0.2" />
			</linearGradient>
			<filter id="glow">
				<feGaussianBlur stdDeviation="4" result="coloredBlur" />
				<feMerge>
					<feMergeNode in="coloredBlur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- Animált vonalak -->
		<g class="line-group">
			<line x1="0" y1="200" x2="1000" y2="250" stroke="url(#neon1)" stroke-width="1" opacity="0.3">
				<animate attributeName="x2" values="0;1000;0" dur="8s" repeatCount="indefinite" />
				<animate attributeName="opacity" values="0;0.6;0" dur="8s" repeatCount="indefinite" />
			</line>
			<line x1="1000" y1="600" x2="0" y2="650" stroke="url(#neon2)" stroke-width="1" opacity="0.3">
				<animate attributeName="x2" values="1000;0;1000" dur="10s" repeatCount="indefinite" />
				<animate attributeName="opacity" values="0;0.5;0" dur="10s" repeatCount="indefinite" />
			</line>
		</g>

		<!-- Körök és pontok -->
		<g class="circle-group">
			<circle cx="300" cy="400" r="3" fill="#5DD5E8" opacity="0.6">
				<animate attributeName="r" values="3;8;3" dur="2s" repeatCount="indefinite" />
				<animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
			</circle>
			<circle cx="700" cy="600" r="3" fill="#1E5BA8" opacity="0.5">
				<animate attributeName="r" values="3;8;3" dur="2.5s" repeatCount="indefinite" />
				<animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
			</circle>
			<circle cx="500" cy="200" r="3" fill="#3B9FD9" opacity="0.7">
				<animate attributeName="r" values="3;8;3" dur="3s" repeatCount="indefinite" />
				<animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
			</circle>
		</g>

		<!-- Futurisztikus rácsok -->
		<g class="grid-lines" opacity="0.15">
			<path d="M 100 0 L 100 1000" stroke="#5DD5E8" stroke-width="0.5" />
			<path d="M 300 0 L 300 1000" stroke="#5DD5E8" stroke-width="0.5" />
			<path d="M 500 0 L 500 1000" stroke="#5DD5E8" stroke-width="0.5" />
			<path d="M 700 0 L 700 1000" stroke="#5DD5E8" stroke-width="0.5" />
			<path d="M 900 0 L 900 1000" stroke="#5DD5E8" stroke-width="0.5" />
			<path d="M 0 100 L 1000 100" stroke="#5DD5E8" stroke-width="0.5" />
			<path d="M 0 300 L 1000 300" stroke="#5DD5E8" stroke-width="0.5" />
			<path d="M 0 500 L 1000 500" stroke="#5DD5E8" stroke-width="0.5" />
			<path d="M 0 700 L 1000 700" stroke="#5DD5E8" stroke-width="0.5" />
			<path d="M 0 900 L 1000 900" stroke="#5DD5E8" stroke-width="0.5" />
		</g>
	</svg>

	<!-- Lebegő részecskék -->
	<div class="particle particle-1"></div>
	<div class="particle particle-2"></div>
	<div class="particle particle-3"></div>
	<div class="particle particle-4"></div>
	<div class="particle particle-5"></div>
</div>

<style>
	.grid-background {
		animation: gridMove 20s linear infinite;
		background-image:
			linear-gradient(rgba(93, 213, 232, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(93, 213, 232, 0.05) 1px, transparent 1px);
		background-size: 50px 50px;
	}

	@keyframes gridMove {
		0% {
			background-position: 0 0;
		}
		100% {
			background-position: 50px 50px;
		}
	}

	.glow-orb {
		position: absolute;
		opacity: 0.3;
		filter: blur(80px);
		animation: float 8s ease-in-out infinite;
		border-radius: 50%;
	}

	.glow-orb-1 {
		top: -100px;
		left: -100px;
		animation-duration: 10s;
		background: radial-gradient(circle, #5dd5e8 0%, transparent 70%);
		width: 400px;
		height: 400px;
	}

	.glow-orb-2 {
		right: -150px;
		bottom: -150px;
		animation-duration: 12s;
		animation-delay: -2s;
		background: radial-gradient(circle, #3b9fd9 0%, transparent 70%);
		width: 500px;
		height: 500px;
	}

	.glow-orb-3 {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		animation-duration: 15s;
		animation-delay: -5s;
		background: radial-gradient(circle, #1e5ba8 0%, transparent 70%);
		width: 350px;
		height: 350px;
	}

	@keyframes float {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		33% {
			transform: translate(30px, -30px) scale(1.1);
		}
		66% {
			transform: translate(-20px, 20px) scale(0.9);
		}
	}

	.particle {
		position: absolute;
		animation: particleFloat 15s linear infinite;
		box-shadow: 0 0 10px #5dd5e8;
		border-radius: 50%;
		background: #5dd5e8;
		width: 4px;
		height: 4px;
	}

	.particle-1 {
		top: 20%;
		left: 10%;
		animation-duration: 12s;
	}

	.particle-2 {
		top: 60%;
		left: 80%;
		animation-duration: 15s;
		animation-delay: -3s;
		box-shadow: 0 0 10px #1e5ba8;
		background: #1e5ba8;
	}

	.particle-3 {
		top: 40%;
		left: 30%;
		animation-duration: 18s;
		animation-delay: -6s;
		box-shadow: 0 0 10px #3b9fd9;
		background: #3b9fd9;
	}

	.particle-4 {
		top: 80%;
		left: 60%;
		animation-duration: 14s;
		animation-delay: -9s;
	}

	.particle-5 {
		top: 30%;
		left: 90%;
		animation-duration: 16s;
		animation-delay: -12s;
		box-shadow: 0 0 10px #1e5ba8;
		background: #1e5ba8;
	}

	@keyframes particleFloat {
		0% {
			transform: translateY(0) translateX(0);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			transform: translateY(-100vh) translateX(50px);
			opacity: 0;
		}
	}
</style>
