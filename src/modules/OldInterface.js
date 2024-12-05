import { World } from "./Core/World.js";

export function initRenderers(renderers) {
	window.ctx = {};

	Object.values(renderers).forEach(renderer => {
		renderer.width = window.innerWidth;
		renderer.height = window.innerHeight;
		window.ctx[`${renderer.id}`] = renderer.getContext("2d");
	});
}

export function listenUserActions(parameters, world) {
	listenParameters(parameters, world);
	listenStreamControls(parameters, world);
	listenInspector(world);
}

function listenParameters(parameters, world) {
	const parametersChanged = new CustomEvent('parametersChanged');
	const geometryOptions = document.querySelectorAll('input[name="geometry"]');

	const possibleGeometry = {};
	geometryOptions.forEach((geometryOption, index) => {
		possibleGeometry[geometryOption.id] = index;
	});


	document.addEventListener("parametersChanged", (e) => {
		const parameterChanged = e.target.activeElement.name;
		if (parameterChanged === "population") {
			world.population.length = parameters.population;
		} else {
			world[`${parameterChanged}`] = parameters[`${parameterChanged}`];
		}
	});

	window.population.addEventListener('change', (event) => {
		parameters.population = parseInt(event.target.value);
		document.dispatchEvent(parametersChanged);
	});

	geometryOptions.forEach(option => {
		option.addEventListener("change", (event) => {
			parameters.geometry = possibleGeometry[`${event.target.id}`];
			document.dispatchEvent(parametersChanged);
		});
	});
}

function listenStreamControls(parameters, world) {
	const parametersContainer = document.querySelector('.parameters__container');
	let animationID;

	const playSimulation = () => {
		if (world.isAnimating) return;
		world.isAnimating = true;
		animationID = world.animate();
		parametersContainer.classList.add('hidden');
		window.inspector.classList.add("hidden");
		window["play-btn"].parentElement.classList.add('hidden');
		window["play-btn"].classList.add('hidden');
		window["pause-btn"].classList.remove('hidden');
	}
	const pauseSimulation = () => {
		world.isAnimating = false;
		window.cancelAnimationFrame(animationID);
		window["play-btn"].parentElement.classList.remove('hidden');
		// window.inspector.classList.remove("hidden");
		window["play-btn"].classList.remove('hidden');
		window["pause-btn"].classList.add('hidden');
	}

	window["play-btn"].addEventListener('click', playSimulation);
	window["pause-btn"].addEventListener('click', pauseSimulation);
	window["next-frame-btn"].addEventListener('click', () => {
		if (world.isAnimating) return;
		world.simulateNextFrame();
		world.renderCurrentFrame();
	});
	window["stop-btn"].addEventListener('click', () => {
		parametersContainer.classList.remove('hidden');
		window.inspector.classList.remove("hidden");
		window["play-btn"].classList.remove('hidden');
		window["pause-btn"].classList.add('hidden');
		window["play-btn"].parentElement.classList.remove('hidden');

		world.isAnimating = false;
		window.cancelAnimationFrame(animationID);
		world = new World(parameters);
		world.init();
	});
}

function listenInspector(world) {
	let selectedLayer = window["layer-selector"].value;
	let observing = null;

	window["inspect-trigger"].addEventListener('click', toggleInspectorMode);

	// select inspecting layer
	window["layer-selector"].addEventListener("change", (event) => {
		const prevLayer = selectedLayer;
		selectedLayer = event.target.value;
		// switch visible content area
		toggleInspectorSection(prevLayer, selectedLayer);

		// in case simulation is stopped and inspector mode is off
		if (!observing) {
			toggleInspectorMode();
		} else {
			handleInteractiveLayers({
				disable: observing,
				enable: window[`${selectedLayer}`]
			});
		}
	});

	function toggleInspectorMode() {
		document.body.classList.toggle("inspecting");
		window.inspector.classList.toggle("pinned");

		if (observing) {
			return handleInteractiveLayers({ disable: window[`${selectedLayer}`] });
		}

		handleInteractiveLayers({
			disable: Array.from(window["layer-selector"].children),
			enable: window[`${selectedLayer}`],
		});
	}

	function handleInteractiveLayers({ disable, enable }) {
		// disable all on first enter to inspector mode
		if (disable && Array.isArray(disable)) {
			disable.forEach(layer => window[`${layer.value}`].style.pointerEvents = "none");
		} else if (disable) {
			disable.removeEventListener("click", event => handleInspect(event, world));
			disable.style.pointerEvents = "none";
			observing = null;
		}
		if (enable) {
			enable.addEventListener("click", event => handleInspect(event, world));
			enable.style.pointerEvents = "all";
			observing = enable;
		}
	}
}

function toggleInspectorSection(layerToHide, layerToShow) {
	const node = window.inspector.querySelector(`.inspector__section[data-layer="${layerToHide}"]`);
	node.classList.add("hidden");

	if (layerToShow) {
		const node = window.inspector.querySelector(`.inspector__section[data-layer="${layerToShow}"]`);
		node.classList.remove("hidden");
	}
}

function handleInspect(event, world) {
	const currentState = inspect(event, world);
	// if (world.isAnimating) 
}

function inspect(event, world) {
	const rect = event.target.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;
	let target;	// идентефикатор субъекта отслеживания в окне

	switch (event.target.id) {
		case "world":
			console.log("world layer clicked");
			console.dir(world);
			break;
		case "environment":
			console.log("Environment layer clicked");
			for (const object of world.environment) {
				if (mouseX >= object.x - object.size && mouseX <= object.x + object.size &&
					mouseY >= object.y - object.size && mouseY <= object.y + object.size) {
					console.dir(object);
					break;
				}
			}
			break;
		case "beings":
			console.log("beings layer clicked");
			for (const bot of world.population) {
				if (mouseX >= bot.x - bot.size && mouseX <= bot.x + bot.size &&
					mouseY >= bot.y - bot.size && mouseY <= bot.y + bot.size) {
					console.dir(bot);
					break;
				}
			}
			// передать targetID в функцию апдейта окна инспектора
			// апдейт по таймеру раз в пару сек + с ручным обновлением
			break;
	}

	return target;
}