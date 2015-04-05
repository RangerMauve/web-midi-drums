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

domBindingStream("main")
	.pipe(mergeStream({}))
	.pipe(map(process_updates))
	.pipe(mergeStream(initial_data()))
	.pipe(map(render_main))
	.pipe(patcherStream(main_element, render_main({})));

var midiInput = repeatStream();

midiInput
	.pipe(noteStream())
	.pipe(map(play_tag));

domBindingStream("header")
	.pipe(add_instrument);

function render_main(data) {
	return mustache.render(templates.main, data);
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
		blocks: [],
		samples: []
	};
}

function $(query) {
	return document.querySelector(query);
}

function $$(query) {
	return document.querySelectorAll(query);
}
