import { Being } from "./Simulation/Core/Being.js";
import { Organic, Remains } from "./Simulation/Core/EnvironmentObjects.js";

export function initRenderers(renderers) {
	window.ctx = {};

	Object.values(renderers).forEach(renderer => {
		renderer.width = window.innerWidth;
		renderer.height = window.innerHeight;
		window.ctx[`${renderer.id}`] = renderer.getContext("2d");
	});
}

const targetSelectEvent = new CustomEvent("targetSelect");
let inspectorAnimationID = null;
let inspectorTarget = null;
let inspectedLayer = window["layer-selector"].value;

export function initUserInterface(BIOM_CONSTRUCTORS) {
	initParameters();
	listenParameters(BIOM_CONSTRUCTORS);
	listenStreamControls(BIOM_CONSTRUCTORS);
	initInspector();
}

function initParameters() {
	window["save-last-config"].checked = window.PARAMETERS.saveLastConfig;
	window["use-last-config"].checked = window.PARAMETERS.useLastConfig;

	Array.from(document.querySelectorAll("input[name='geometry']")).forEach(
		input => {
			if (input.value === window.PARAMETERS.geometry) {
				return input.checked = true;
			}
		}
	);

	Array.from(window.biom.children).forEach(node => {
		if (node.value === window.PARAMETERS.biom) node.selected = true;
	});
	Array.from(window["target-selection"].children).forEach(node => {
		if (node.value === window.PARAMETERS.targetSelectionStrategy) node.selected = true;
	});

	window["population-size"].value = window.PARAMETERS.population;
	window["organic-count"].value = window.PARAMETERS.organic;

	Array.from(document.querySelectorAll("input[name='paint']")).forEach(
		input => {
			if (input.value === window.PARAMETERS.paintScheme) {
				return input.checked = true;
			}
		}
	);

	window.fov.checked = window.PARAMETERS.drawFOV;
	window.ros.checked = window.PARAMETERS.drawRangeOfSight;
	window.roi.checked = window.PARAMETERS.drawRangeOfInteract;

	window.memSize.value = window.PARAMETERS.memSize;

	window.growth.checked = window.PARAMETERS.allowGrowth;
	window["continuous-movement"].checked = window.PARAMETERS.continuousMovement;
}

function listenParameters(BIOM_CONSTRUCTORS) {
	const geometryOptions = document.querySelectorAll('input[name="geometry"]');
	const paintOptions = document.querySelectorAll('input[name="paint"]');

	window["save-last-config"].addEventListener("change", event => {
		window.PARAMETERS.saveLastConfig = event.target.checked;
		localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
	});

	window["use-last-config"].addEventListener("change", event => {
		window.PARAMETERS.useLastConfig = event.target.checked;

		localStorage.setItem("use-last-config", JSON.stringify(event.target.checked));

		if (window.PARAMETERS.saveLastConfig) {
			localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
		}
	});

	geometryOptions.forEach(option => {
		option.addEventListener("change", (event) => {
			window.PARAMETERS.geometry = event.target.value;
			if (window.PARAMETERS.saveLastConfig) {
				localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
			}
		});
	});

	window["biom-confirm"].addEventListener("click", () => {
		if (window.simulation instanceof BIOM_CONSTRUCTORS[window.biom.value]) return;
		window.PARAMETERS.biom = window.biom.value;
		stopSimulation(BIOM_CONSTRUCTORS);
		if (window.PARAMETERS.saveLastConfig) {
			localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
		}
	});

	window["population-size"].addEventListener('change', (event) => {
		window.PARAMETERS.population = parseInt(event.target.value);
		if (window.PARAMETERS.saveLastConfig) {
			localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
		}
	});
	window["organic-count"].addEventListener('change', (event) => {
		const newValue = parseInt(event.target.value);

		if (newValue > window.PARAMETERS.organic) {
			let diff = newValue - window.PARAMETERS.organic;
			for (let i = 0; i < diff; i++) {
				let [x, y] = window.simulation.getPointOutsideArea(4, window.simulation.environment);
				window.simulation.environment.push(new Organic(`${Date.now()}-${Math.random().toString(36).substring(2, 15)}`, x, y));
			}
		} else {
			let count = 0;
			window.simulation.environment.forEach(entry => {
				if (entry instanceof Organic || entry instanceof Remains) count = count + 1;
			});

			for (let i = window.simulation.environment.length - 1; i >= 0; i--) {
				const entry = window.simulation.environment[i];
				if (entry instanceof Organic || entry instanceof Remains) {
					window.simulation.environment.splice(i, 1);
					count = count - 1;
				}
				if (count <= newValue) break;
			}
		}

		window.PARAMETERS.organic = newValue;
		if (window.PARAMETERS.saveLastConfig) {
			localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
		}
	});

	paintOptions.forEach(scheme => {
		scheme.addEventListener("change", (event) => {
			window.PARAMETERS.paintScheme = event.target.id;
			switch (window.PARAMETERS.paintScheme) {
				case "default":
					window.simulation.population.forEach(being => being.color = `${being.c_red}, ${being.c_green}, ${being.c_blue}`);
					break;
				case "smell":
					window.simulation.population.forEach(being => being.paintSmell);
					break;
				case "energy":
					window.simulation.population.forEach(being => being.paintEnergy());
					break;
			}
			window.simulation.drawBeings();
			if (window.PARAMETERS.saveLastConfig) {
				localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
			}
		});
	});

	window.fov.addEventListener("change", event => handleRenderOptions(event, "drawFOV"));
	window.ros.addEventListener("change", event => handleRenderOptions(event, "drawRangeOfSight"));
	window.roi.addEventListener("change", event => handleRenderOptions(event, "drawRangeOfInteract"));

	window["target-selection"].addEventListener("change", event => {
		window.PARAMETERS.targetSelectionStrategy = event.target.value;
		if (window.PARAMETERS.saveLastConfig) {
			localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
		}
	});

	window.memSize.addEventListener('change', (event) => {
		window.PARAMETERS.memSize = parseInt(event.target.value);
		if (window.PARAMETERS.saveLastConfig) {
			localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
		}
	});

	window.growth.addEventListener("change", event => {
		window.PARAMETERS.allowGrowth = event.target.checked;
		window.simulation.population.forEach(bot => bot.updateSize(event.target.checked));
		window.simulation.drawBeings();
		if (window.PARAMETERS.saveLastConfig) {
			localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
		}
	});
	window["continuous-movement"].addEventListener("change", event => {
		window.PARAMETERS.continuousMovement = event.target.checked;
		if (window.PARAMETERS.saveLastConfig) {
			localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
		}
	});
}

function handleRenderOptions(event, parameterToHandle) {
	window.PARAMETERS[`${parameterToHandle}`] = event.target.checked;
	window.simulation.drawBeings();
	if (window.PARAMETERS.saveLastConfig) {
		localStorage.setItem("last-config", JSON.stringify(window.PARAMETERS));
	}
}

function listenStreamControls(BIOM_CONSTRUCTORS) {
	const parametersContainer = document.querySelector('.parameters__container');
	const streamArea = document.querySelector(".stream__area");

	const playSimulation = () => {
		if (window.simulation.isLive) return;
		window.simulation.isLive = true;
		window.simulation.animate();
		if (document.body.classList.contains("inspecting")) {
			inspectorAnimationID = animateInspector(window.simulation);
		}
		streamArea.classList.remove("transparent");
		parametersContainer.classList.add('hidden');
		// doesn't affect enabled inspector mode
		// class .pinned has higher priority
		window.inspector.classList.add("hidden");
		window["play-btn"].parentElement.classList.add('hidden');
		window["play-btn"].classList.add('hidden');
		window["pause-btn"].classList.remove('hidden');
	}
	const pauseSimulation = () => {
		if (inspectorAnimationID) {
			window.cancelAnimationFrame(inspectorAnimationID);
			inspectorAnimationID = null;
		}
		window.simulation.isLive = false;
		streamArea.classList.add("transparent");
		window["play-btn"].parentElement.classList.remove('hidden');
		window["play-btn"].classList.remove('hidden');
		window["pause-btn"].classList.add('hidden');
	}

	window["play-btn"].addEventListener('click', playSimulation);
	window["pause-btn"].addEventListener('click', pauseSimulation);
	window["next-frame-btn"].addEventListener('click', () => {
		if (window.simulation.isLive) return;
		window.simulation.simulateNextFrame();
		window.simulation.renderCurrentFrame();
		if (document.body.classList.contains("inspecting")) {
			updateInspector();
		}
	});
	window["stop-btn"].addEventListener('click', () => stopSimulation(BIOM_CONSTRUCTORS));
}

function stopSimulation(BIOM_CONSTRUCTORS) {
	const parametersContainer = document.querySelector('.parameters__container');
	parametersContainer.classList.remove('hidden');
	window.inspector.classList.remove("hidden");
	window["play-btn"].classList.remove('hidden');
	window["pause-btn"].classList.add('hidden');
	window["play-btn"].parentElement.classList.remove('hidden');

	if (inspectorAnimationID) {
		window.cancelAnimationFrame(inspectorAnimationID);
		inspectorAnimationID = null;
	}
	if (inspectorTarget) {
		inspectorTarget = null;
	}

	window.simulation.isLive = false;
	window.simulation = new BIOM_CONSTRUCTORS[window.biom.value]();
	window.simulation.init();
}

function initInspector() {
	window["inspect-trigger"].addEventListener("click", toggleInspector);
	window["layer-selector"].addEventListener("change", changeLayer);

	updateInspector();
}

// callback to toggle inspector mode
function toggleInspector() {
	document.body.classList.toggle("inspecting");
	window.inspector.classList.toggle("pinned");

	if (!inspectorAnimationID && window.simulation.isLive) {
		animateInspector();
		return;
	} else {
		document.addEventListener("targetSelect", resumeInspectorAnimation);
	}

	if (inspectedLayer !== "world" && inspectorAnimationID) {
		window[`${inspectedLayer}`].addEventListener("click", listenLayerInteract);
	}

	cancelAnimationFrame(inspectorAnimationID);
	inspectorAnimationID = null;
	window[`${inspectedLayer}`].removeEventListener("click", listenLayerInteract);
}

// handle interactivity of env & population layers
function changeLayer(event) {
	// remove previous listener if exists
	window[`${inspectedLayer}`].removeEventListener("click", listenLayerInteract);
	window[`${inspectedLayer}`].style.pointerEvents = "none";

	inspectedLayer = event.target.value;

	// enter inspector if layer selected when simulation isn't running
	if (!document.body.classList.contains("inspecting")) {
		toggleInspector();
	}

	if (inspectedLayer === "world") return document.dispatchEvent(targetSelectEvent);
	window[`${inspectedLayer}`].addEventListener("click", listenLayerInteract);
	window[`${inspectedLayer}`].style.pointerEvents = "all";
}

function listenLayerInteract(event) {
	const rect = event.target.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;

	for (const object of window.simulation[`${inspectedLayer}`]) {
		if (mouseX >= object.x - object.size && mouseX <= object.x + object.size &&
			mouseY >= object.y - object.size && mouseY <= object.y + object.size) {
			// unselect last
			if (inspectorTarget instanceof Being) {
				inspectorTarget.statusColor = "orange";
				window.simulation.drawBeings();
			}

			if (inspectorTarget?.id !== object.id) {
				// select new
				inspectorTarget = object;
				if (inspectorTarget instanceof Being) {
					inspectorTarget.statusColor = "blue";
					window.simulation.drawBeings();
				}
			} else {
				inspectorTarget = null;
			}

			document.dispatchEvent(targetSelectEvent);
			break;
		}
	}
}

// recursive animation call
function animateInspector() {
	if ((inspectedLayer !== "world" && !inspectorTarget) || !window.simulation.isLive) {
		cancelAnimationFrame(inspectorAnimationID);
		document.addEventListener("targetSelect", resumeInspectorAnimation);
		return;
	}

	updateInspector();
	inspectorAnimationID = requestAnimationFrame(animateInspector);
}

function resumeInspectorAnimation() {
	if (window.simulation.isLive) {
		animateInspector();
		document.removeEventListener("targetSelect", resumeInspectorAnimation);
	} else {
		updateInspector();
	}
}

// insert data into html
function updateInspector() {
	// section where to insert data
	// const section = document.querySelector(`.inspector__section[data-layer="${inspectedLayer}"]`);

	if (inspectedLayer !== "world" && !inspectorTarget) {
		console.warn("no tgt at layer: " + inspectedLayer);
		return cancelAnimationFrame(inspectorAnimationID);
	}

	switch (inspectedLayer) {
		case "world":
			console.log(window.simulation);
			break;
		case "environment":
			console.log(inspectorTarget);
			break;
		case "population":
			if (!inspectorTarget.isAlive) inspectorTarget = null;
			console.log(inspectorTarget);
			break;
	}
}