var domBindingStream = require("dom-binding-stream");
var mustache = require("mustache");
var map = require("through2-map").obj;
var stdout = require("stdout");
var webMidi = require("web-midi");
var midiDevices = require("web-midi-devices");
var noteStream = require("web-midi-note-stream");
var patcherStream = require("html-patcher-stream");
var mergeStream = require("object-merge-stream");
var through = require("through2");
var repeatStream = require("repeat-stream");

// TODO: Display available devices in header
// TODO: Implement logic for parsing updates to sample preferences
// TODO: Add logs

var templates = require("./templates");

var main_element = $("main");

var instrument_map = {};

var main_state = mergeStream(initial_data());

main_state.pipe(stdout("Main State:"));

domBindingStream("main")
	.pipe(mergeStream({}))
	.pipe(map(process_updates))
	.pipe(main_state)
	.pipe(map(render_main))
	.pipe(patcherStream(main_element, render_main(initial_data())));

var midiInput = repeatStream();

midiInput
	.pipe(noteStream())
	.pipe(map(play_tag));

domBindingStream("header")
	.pipe(map(add_instrument));

midiDevices.inputs()
	.then(render_header)
	.then(set_header);

function render_main(data) {
	return mustache.render(templates.main, data);
}

function render_header(inputs) {
	console.log("Inputs", inputs);
	return mustache.render(templates.header, {
		inputs: inputs
	});
}

function set_header(html) {
	$("header").innerHTML = html;
}

function process_updates(data) {
	// Parse all input updates into the final rendered form
}

function add_instrument(data) {
	var name = data.instrument;
	if (instrument_map[name]) return;
	webMidi(name).pipe(midiInput);
	instrument_map[name] = true;
}

function play_tag(data) {
	var note = data.note;
	var tag = $(note);
	if (data.pressed) {
		tag.currentTime = 0;
		tag.play();
	} else {
		tag.pause();
	}
}

function initial_data() {
	return {
		blocks: gen_blocks(),
		samples: gen_samples()
	};
}

function gen_blocks() {
	var start = 36;
	var end = 51 + 1;
	var i = end - start;
	var blocks = [];
	while (i--) {
		blocks.push({
			note: start + i,
			audio: "clap-808.wav"
		});
	}
	return blocks;
}

function gen_samples() {
	return [
		"clap-808.wav",
		"cowbell-808.wav",
		"crash-808.wav",
		"hihat-808.wav",
		"kick-808.wav",
		"openhat-808.wav",
		"perc-808.wav",
		"snare-808.wav",
		"tom-808.wav"
	];
}

function $(query) {
	return document.querySelector(query);
}

function $$(query) {
	return document.querySelectorAll(query);
}
